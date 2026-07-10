import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In Docker dev, Vite runs inside the web container, so the backend is reachable
// at the service name `backend` (not localhost). Override via API_PROXY_TARGET.
const apiTarget = process.env.API_PROXY_TARGET || 'http://localhost:8000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
      '/uploads': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: false,
  },
});
