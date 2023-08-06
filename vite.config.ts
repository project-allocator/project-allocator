import ViteYaml from '@modyfi/vite-plugin-yaml';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://backend:8000'
    },
    watch: {
      ignored: ['/app/src/api/**'],
    },
  },
  plugins: [
    react(),
    tsconfigPaths(),
    ViteYaml(),
  ],
})
