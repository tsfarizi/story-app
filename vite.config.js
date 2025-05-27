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
      base: '/story-app/',
      injectRegister: 'auto',
      registerType: 'autoUpdate',
      manifest: {
        name: 'Story App',
        short_name: 'Story App',
        description: 'A simple application to share stories.',
        start_url: '/story-app/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#42b883',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html}'],
      },
      srcDir: 'public',
      filename: 'sw.js',
    }),
  ],
});
