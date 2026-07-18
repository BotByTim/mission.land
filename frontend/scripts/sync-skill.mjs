import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..", "..");
const publicDir = resolve(root, "frontend", "public");

function ensure(dir) {
  mkdirSync(dir, { recursive: true });
}

function sync(src, dest) {
  ensure(dirname(dest));
  copyFileSync(src, dest);
  console.log(`sync ${src} -> ${dest}`);
}

// skill.md is English-only — agents work best in English, so there are no
// localized copies to sync.
sync(resolve(root, "skill.md"), resolve(publicDir, "skill.md"));
