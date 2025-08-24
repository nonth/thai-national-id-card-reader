import { resolve } from 'path';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: false, // Disable rollup types to avoid Buffer issue
      tsconfigPath: './tsconfig.json',
      copyDtsFiles: true, // Copy .d.ts files to output
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ThaiNationalIdCardReader',
      formats: ['cjs', 'es'],
      fileName: (format) => `index.${format === 'cjs' ? 'cjs' : 'js'}`,
    },
    rollupOptions: {
      // Mark dependencies as external so they're not bundled
      external: ['smartcard', 'hex2imagebase64', 'legacy-encoding', 'events'],
      output: {
        exports: 'named', // Fix the named/default export warning
        globals: {
          smartcard: 'smartcard',
          hex2imagebase64: 'hex2imagebase64',
          'legacy-encoding': 'legacyEncoding',
          events: 'events',
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    target: 'node14',
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  clearScreen: false,
});
