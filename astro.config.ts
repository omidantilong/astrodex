import { defineConfig } from "astro/config"

export default defineConfig({
  site: "https://astrodex.29b6.io",
  output: "static",
  vite: {
    build: {
      rollupOptions: {
        output: {
          assetFileNames: "_static/[name]-[hash][extname]",
        },
      },
    },
  },
})
