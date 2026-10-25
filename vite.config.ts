import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as { version: string }

// https://vite.dev/config/
export default defineConfig({
  publicDir: false,
  plugins: [react(), viteSingleFile()],
  define: {
    __BUILD_VERSION__: JSON.stringify(`v${packageJson.version}`),
  },
})
