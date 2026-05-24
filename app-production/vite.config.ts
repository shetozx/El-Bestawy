import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  // For GitHub Pages: set to '/repo-name/' if deploying to username.github.io/repo-name/
  // Or use './' for root deployment / custom domain
  base: "./",
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    // Generate source maps for easier debugging
    sourcemap: false,
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router", "react-router-dom"],
          "vendor-firebase": ["firebase/app", "firebase/firestore"],
          "vendor-ui": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-select"],
          "vendor-charts": ["recharts"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
