import { build } from "esbuild";
import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export async function buildWebsite() {
  await mkdir("dist", { recursive: true });
  await build({
    entryPoints: {
      app: "src/web/main.tsx",
      "isometric/app": "src/web/isometric/main.tsx",
    },
    bundle: true,
    platform: "browser",
    format: "esm",
    outdir: "dist",
    minify: true,
    sourcemap: false,
    legalComments: "linked",
    define: { "process.env.NODE_ENV": '"production"' },
  });
  await copyFile("index.html", "dist/index.html");
  await copyFile("src/web/isometric/index.html", "dist/isometric/index.html");
  await copyFile("favicon.svg", "dist/favicon.svg");
  console.log("Built standalone simulation in dist/");
}
if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
)
  await buildWebsite();
