import { mkdir, copyFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";

const output = "dist";
const files = [
  "index.html",
  "admin.html",
  "styles.css",
  "data.js",
  "app.js",
  "admin.js",
  "README.md",
];

await rm(output, { force: true, recursive: true });
await mkdir(output, { recursive: true });

for (const file of files) {
  const target = join(output, file);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(file, target);
}

console.log(`Static site built in ${output}/`);
