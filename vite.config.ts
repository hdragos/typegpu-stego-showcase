import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset paths, so the build works wherever it's served from, including the
  // /typegpu-stego-showcase/ folder GitHub Pages gives this repository.
  base: './',
  plugins: [react()],
});
