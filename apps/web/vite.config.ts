import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    fs: {
      // Allow serving files from resolve-dctl-master directory
      allow: ['..', '../..', '../../resolve-dctl-master']
    }
  },
  // Add static file serving for resolve-dctl-master
  assetsInclude: ['**/*.dctl'],
  define: {
    __RESOLVE_DCTL_PATH__: JSON.stringify('/resolve-dctl-master/')
  }
})
