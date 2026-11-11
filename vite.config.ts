import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import { unlink } from 'node:fs/promises'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), {
    name: 'exclude-private-content',
    async writeBundle(output) {
      // Keep the import source locally, but never publish the private memo as a static asset.
      const outputDir = resolve(output.dir || 'dist');
      try { await unlink(resolve(outputDir, 'Posts/memo.html')); }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    },
  }],
  server: {
    proxy: { '/api': { target: 'http://127.0.0.1:8787', changeOrigin: true } },
  },
})


