import { resolve } from 'path';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import commonjs from '@rollup/plugin-commonjs';

export default defineConfig({
  plugins: [
    // Move CommonJS plugin to main plugins array for better integration
    commonjs({
      include: ['node_modules/**'],
    }),
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
      output: [
        // CommonJS output configuration
        {
          format: 'cjs',
          exports: 'named',
          interop: 'auto',
          entryFileNames: 'index.cjs',
          // Ensure proper CommonJS exports
          esModule: false,
        },
        // ESM output configuration
        {
          format: 'es',
          exports: 'named',
          entryFileNames: 'index.js',
          // Preserve ESM imports
          preserveModules: false,
        },
      ],
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    target: 'node14',
    // Ensure proper module resolution
    minify: false, // Keep unminified for better debugging
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  clearScreen: false,
});
