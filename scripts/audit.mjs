import { lstat, readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const omitted = new Set([".git", "node_modules", ".qa", ".cache"]);
const roots = new Set(["src", "scripts", "tests", "docs", ".github", "dist"]);
const rootFiles = new Set([
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "tsconfig.json",
  "index.html",
  "favicon.svg",
  ".gitignore",
  "LICENSE",
  "README.md",
  "AGENTS.md",
  "PROJECT_STATE.md",
]);
const imagePaths = new Set([
  "docs/city.png",
  "docs/assets.png",
  "docs/mobile.png",
]);
const privatePatterns = [
  /[a-z]:[\\/](?:Users|workspace|Download)[\\/]/i,
  /(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,})/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /[a-z0-9._%+-]+@(?:qq|163|gmail)\.com/i,
  /cmb-(?:ordinary|pension)-\d{4}|securities-account-[a-f0-9]{20}/,
];
const failures = [];
let sourceFiles = 0,
  buildFiles = 0;
async function inspect(dir = ".", rel = "") {
  for (const name of await readdir(dir)) {
    if (!rel && omitted.has(name)) continue;
    const path = join(dir, name);
    const relative = rel ? `${rel}/${name}` : name;
    const info = await lstat(path);
    if (info.isSymbolicLink()) {
      failures.push(`${relative}: symlink is outside the export boundary`);
      continue;
    }
    if (!rel && !(info.isDirectory() ? roots.has(name) : rootFiles.has(name)))
      failures.push(`${relative}: outside publication allowlist`);
    if (info.isDirectory()) {
      await inspect(path, relative);
      continue;
    }
    if (relative.startsWith("dist/")) buildFiles++;
    else sourceFiles++;
    if (
      /\.(sqlite(?:-wal|-shm)?|db|pdf|xlsx?|csv|bak|map)$/i.test(name) ||
      name.startsWith(".env")
    )
      failures.push(`${relative}: private/generated file type`);
    if (extname(name) === ".png") {
      if (!imagePaths.has(relative))
        failures.push(
          `${relative}: image outside authored Demo screenshot allowlist`,
        );
      continue;
    }
    if (
      !/[.](?:tsx?|m?js|css|json|html|svg|md|ya?ml|txt)$/.test(name) &&
      name !== "LICENSE" &&
      name !== ".gitignore"
    ) {
      failures.push(`${relative}: unreviewed file type`);
      continue;
    }
    const contents = await readFile(path, "utf8");
    // Public dependency license contacts are attribution, not scenario data.
    const patterns = relative.endsWith("/app.js.LEGAL.txt")
      ? privatePatterns.filter((pattern) => !pattern.source.includes("gmail"))
      : privatePatterns;
    if (patterns.some((pattern) => pattern.test(contents)))
      failures.push(
        `${relative}: private identity, local path or credential pattern`,
      );
  }
}
await inspect();
if (!buildFiles) failures.push("dist/: build output missing; run pnpm build");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(
  `Public file boundary PASS: ${sourceFiles} source/doc files, ${buildFiles} build files. Review Git history and image provenance separately.`,
);
