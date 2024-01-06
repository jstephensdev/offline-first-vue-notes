import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['img/icons/*.png'],
      manifest: {
        name: 'offline-first-vue-notes',
        short_name: 'offline-first-vue-notes',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        lang: 'en',
        scope: '/',
        icons: [
          {
            src: 'img/icons/notes.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      input: {
        // the default entry point
        app: './index.html',
        'service-worker': './src/registerServiceWorker.js'
      },
      output: {
        entryFileNames: (assetInfo) => {
          return assetInfo.name === 'service-worker'
            ? '[name].js' // put service worker in root
            : 'assets/js/[name]-[hash].js'; // others in `assets/js/`
        }
      }
    }
  }
});
