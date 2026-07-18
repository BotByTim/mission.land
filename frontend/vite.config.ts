import path from "node:path";
import type { Connect, Plugin } from "vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Force UTF-8 charset for plain-text markdown files so browsers don't fall
 * back to Latin-1 and mangle em-dashes / CJK characters.
 */
function utf8MarkdownPlugin(): Plugin {
  const setCharset = (server: { middlewares: Connect.Server }) => {
    server.middlewares.use((req, res, next) => {
      if (req.url?.endsWith(".md")) {
        const original = res.setHeader.bind(res);
        res.setHeader = (name: string, value: string | number | readonly string[]) => {
          if (
            name.toLowerCase() === "content-type" &&
            typeof value === "string" &&
            !value.includes("charset")
          ) {
            return original(name, `${value}; charset=utf-8`);
          }
          return original(name, value);
        };
      }
      next();
    });
  };

  return {
    name: "utf8-markdown",
    configureServer: setCharset,
    configurePreviewServer: setCharset,
  };
}

// Mission/record data is imported straight from the repo's markdown and
// record files (../missions) via import.meta.glob — allow dev-server reads
// outside the frontend root.
export default defineConfig({
  plugins: [react(), tailwindcss(), utf8MarkdownPlugin()],
  server: {
    fs: { allow: [path.resolve(__dirname, "..")] },
  },
});
