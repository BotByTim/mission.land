import { copyFileSync } from "node:fs";

// GitHub Pages (and other static hosts) serve 404.html for unknown paths.
// Copy index.html so client-side routes like /zh/m/1 work on direct visit.
copyFileSync("dist/index.html", "dist/404.html");
console.log("postbuild: copied dist/index.html -> dist/404.html");
