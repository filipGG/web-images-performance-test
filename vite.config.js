import path from 'path';

/** @type {import('vite').UserConfig} */
export default {
  base: '/web-images-performance-test/',
  resolve: {
    alias: {
      src: path.resolve('src/'),
    },
  },
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    target: 'esnext',
  },
};
