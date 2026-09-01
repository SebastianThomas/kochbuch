module.exports = {
  outputDir: 'dist',
  // The vendor bundle (pdfmake + friends) is large but intentionally precached
  // so the PWA works fully offline. These hints are not actionable here.
  configureWebpack: {
    performance: { hints: false },
  },
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://192.168.2.100:5000',
      },
    },
  },
  pwa: {
    name: 'kochbuch-sebastian',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: './src/service-worker.js',
      // Let the ~2.3 MB vendor chunk into the precache manifest.
      maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
    },
  },
};
