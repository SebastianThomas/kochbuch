import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectRegister: 'auto',
      manifest: false, // public/manifest.json is served as-is
      injectManifest: {
        // let the ~2.3 MB pdfmake-heavy vendor chunk into the precache manifest
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
    }),
  ],
  build: {
    outDir: 'dist',
    // The pdfmake-heavy vendor bundle is large but intentionally precached
    // for full offline support; this warning is not actionable here.
    chunkSizeWarningLimit: 2200,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.2.100:5000',
      },
    },
  },
});
