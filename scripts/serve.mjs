import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { buildWebsite } from "./build.mjs";

if (!process.argv.includes("--production")) await buildWebsite();
const port = Number(process.env.PORT ?? 3518);
const base = process.env.BASE_PATH ?? "/";
if (!base.startsWith("/") || !base.endsWith("/"))
  throw new Error("BASE_PATH must start and end with /");
const allowed = new Map([
  ["isometric/", "isometric/index.html"],
  ["isometric/index.html", "isometric/index.html"],
  ["isometric/app.js", "isometric/app.js"],
  ["isometric/app.css", "isometric/app.css"],
  ["isometric/app.js.LEGAL.txt", "isometric/app.js.LEGAL.txt"],
  ["", "index.html"],
  ["index.html", "index.html"],
  ["app.js", "app.js"],
  ["app.css", "app.css"],
  ["favicon.svg", "favicon.svg"],
  ["app.js.LEGAL.txt", "app.js.LEGAL.txt"],
]);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};
const server = createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405);
    res.end();
    return;
  }
  const pathname = new URL(req.url, "http://localhost").pathname;
  const file = pathname.startsWith(base)
    ? allowed.get(pathname.slice(base.length))
    : null;
  if (!file) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  try {
    const data = await readFile(resolve("dist", file));
    const ext = file.slice(file.lastIndexOf("."));
    res.setHeader("Content-Type", types[ext]);
    res.writeHead(200);
    res.end(req.method === "HEAD" ? undefined : data);
  } catch {
    res.writeHead(404);
    res.end("Build first: pnpm build");
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log(`Preview: http://127.0.0.1:${port}${base}`),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.close(() => process.exit(0)));
