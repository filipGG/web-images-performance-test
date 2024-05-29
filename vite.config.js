/** @type {import('vite').UserConfig} */
export default {
  base: '/web-images-performance-test/',
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    target: 'esnext',
  },
};
