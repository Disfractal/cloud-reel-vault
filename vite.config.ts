import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/

// Work around npm optional dependency bug for Rollup native binaries
// See error: "Cannot find module '@rollup/rollup-linux-x64-gnu'"
if (!process.env.ROLLUP_DISABLE_NATIVE) {
  process.env.ROLLUP_DISABLE_NATIVE = "true";
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
