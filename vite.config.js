import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/story-app/',
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'src', 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  plugins: [
    VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Story App',
    short_name: 'Story App',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#42b883',
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html}'],
  },
  srcDir: 'public',
  filename: 'sw.js',
}),
  ],
});
