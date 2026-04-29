import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // MUST
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // MUST
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
