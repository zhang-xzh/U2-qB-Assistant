import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

const isFirefox = process.env.FIREFOX === 'true';

export default defineConfig({
  plugins: !isFirefox
    ? [crx({ manifest })]
    : [],
  build: {
    outDir: isFirefox ? 'dist-firefox' : 'dist',
    rollupOptions: {
      input: isFirefox
        ? {
            'service-worker': 'src/background/index.ts',
            'content': 'src/content/index.ts',
            'popup': 'popup.html',
            'options': 'options.html',
          }
        : {
            options: 'options.html',
          },
      output: isFirefox
        ? {
            entryFileNames: 'assets/[name].js',
            chunkFileNames: 'assets/[name].js',
          }
        : undefined,
    },
  },
});
