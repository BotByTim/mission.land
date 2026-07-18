import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..", "..");
const publicDir = resolve(root, "frontend", "public");

const langs = ["ja", "ko", "zh"];

function ensure(dir) {
  mkdirSync(dir, { recursive: true });
}

function sync(src, dest) {
  ensure(dirname(dest));
  copyFileSync(src, dest);
  console.log(`sync ${src} -> ${dest}`);
}

// Root skill.md
sync(resolve(root, "skill.md"), resolve(publicDir, "skill.md"));

// Localized skill.md files
for (const lang of langs) {
  sync(resolve(root, "i18n", lang, "skill.md"), resolve(publicDir, lang, "skill.md"));
}
