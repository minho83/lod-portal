import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  ssr: {
    noExternal: [
      "react-router-dom",
      "react-router",
      "lucide-react",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
      "radix-ui",
      "sonner",
    ],
  },
})
