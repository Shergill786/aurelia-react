import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the production build works from any sub-folder
  // (e.g. GitHub Pages at https://<user>.github.io/<repo>/).
  base: './',
})
