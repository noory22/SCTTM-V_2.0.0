import { defineConfig } from 'vite'
import { builtinModules } from 'node:module'

export default defineConfig({
  build: {
    outDir: '.vite/build/main',
    emptyOutDir: true,
    lib: {
      entry: {
        main: 'src/main.js',
        preload: 'src/preload.js', // 👈 added preload
      },
      formats: ['cjs'],
    },
    rollupOptions: {
      output: {
        entryFileNames: '[name].js', // generates main.js & preload.js
      },
      external: [
        'electron',
        'serialport',
        ...builtinModules,
      ],
    },
  },
})
