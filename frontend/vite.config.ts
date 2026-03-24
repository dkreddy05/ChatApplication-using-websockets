import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  define: {
    global: 'window',
  },
  build: {
    outDir: '../src/main/resources/static',
    emptyOutDir: true,
  },
  server: {
    port: 5173, // optional, explicitly set frontend port
    proxy: {
      // API calls
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/logout': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/css': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/js': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/img': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:8080',
        ws: true,
        changeOrigin: true,
      },
      '/chat': {
        // SockJS uses both HTTP (xhr_*) and WS upgrade under this path
        target: 'http://localhost:8080',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
