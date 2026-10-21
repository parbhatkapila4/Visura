import { copyFileSync, existsSync, mkdirSync } from "fs";
import { createRequire } from "module";
import { dirname, join } from "path";
const require = createRequire(import.meta.url);
const pkg = dirname(require.resolve("pdfjs-dist/package.json"));
const toDir = join(process.cwd(), "public");

mkdirSync(toDir, { recursive: true });

for (const name of ["pdf.min.mjs", "pdf.worker.min.mjs"]) {
  const from = join(pkg, "legacy", "build", name);
  if (!existsSync(from)) {
    console.error(`${name} not found at ${from} - is pdfjs-dist installed?`);
    process.exit(1);
  }
  copyFileSync(from, join(toDir, name));
}

const { version } = require("pdfjs-dist/package.json");
console.log(`pdf.min.mjs + pdf.worker.min.mjs -> public/ (pdfjs-dist ${version})`);
