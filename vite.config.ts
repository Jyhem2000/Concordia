import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
  define: {
    // Version des règles d'une partie classée : le commit déployé par Cloudflare Pages, « dev » ailleurs (README)
    __RULES_VERSION__: JSON.stringify(process.env.CF_PAGES_COMMIT_SHA ?? 'dev'),
  },
})
