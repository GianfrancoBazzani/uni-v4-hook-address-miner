import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.sol'], // Allows .sol files to be included
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
