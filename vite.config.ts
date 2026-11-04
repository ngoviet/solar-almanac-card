import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

export default defineConfig({
  define: {
    __VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    lib: {
      entry: 'src/solar-almanac-card.ts',
      formats: ['es'],
      fileName: () => 'solar-almanac-card.js',
    },
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2021',
    sourcemap: false,
  },
  server: {
    open: '/dev/index.html',
  },
});
