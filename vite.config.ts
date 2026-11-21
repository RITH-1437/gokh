import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// `vite preview` serves the same security headers as production (vercel.json)
// so CSP problems show up locally before deploying.
const vercel = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf-8')) as {
  headers?: { source: string; headers: { key: string; value: string }[] }[]
}
const previewHeaders = Object.fromEntries(
  (vercel.headers?.find(h => h.source === '/(.*)')?.headers ?? []).map(h => [h.key, h.value])
)

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  preview: { headers: previewHeaders }
})
