import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import fs from 'fs'
import path from 'path'
import VueDevTool from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VueDevTool(),
    vue(),
    Unocss(),
    {
      name: 'vite-plugin-del',
      closeBundle() {
        // do something
        console.log(fs, path)
      },
    },
  ],
  build: {
    emptyOutDir: false,
    lib: {
      entry: 'lib/index.ts',
      name: '@seemr/vuetransable',
      formats: ['cjs', 'es'],
      fileName: format => format === 'es' 
        ? 'es/vuetransable.mjs' 
        : 'lib/vuetransable.cjs',
    },
    rollupOptions: {
      external: ['vue'], // 将 'vue' 设为外部依赖
      output: {
        globals: { // // 在全局作用域下将 'vue' 映射为 'Vue'
          vue: 'Vue',
        },
      },
    },
  },
})
