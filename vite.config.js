import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [vue(), VitePWA({ registerType: 'autoUpdate' })],
  build: {
    rollupOptions: {
      input: {
        // the default entry point
        app: './index.html',

        // 1️⃣
        'service-worker': './src/registerServiceWorker.js',
      },
      output: {
        // 2️⃣
        entryFileNames: assetInfo => {
          return assetInfo.name === 'service-worker'
             ? '[name].js'                  // put service worker in root
             : 'assets/js/[name]-[hash].js' // others in `assets/js/`
        }
      },
    },
  },
})
