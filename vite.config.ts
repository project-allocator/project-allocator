import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// Note that this config only works within the Docker container
// as proxy host and ignored path do not exist locally.
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
  ],
})
