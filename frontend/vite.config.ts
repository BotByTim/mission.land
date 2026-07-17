import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Mission/record data is imported straight from the repo's markdown and
// record files (../missions) via import.meta.glob — allow dev-server reads
// outside the frontend root.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    fs: { allow: [path.resolve(__dirname, "..")] },
  },
});
