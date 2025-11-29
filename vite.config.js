import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  // Expose environment variables to the client
  // Variables prefixed with VITE_ are exposed to the client
  envPrefix: 'VITE_'
});

