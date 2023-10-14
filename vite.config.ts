import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Unocss(),
    {
      name: 'vite-plugin-del',
      closeBundle() {
        // 删除打包后的index.html style.css vite.svg
        // fs.unlinkSync(path.resolve(__dirname, 'dist/index.html'))
        // fs.unlinkSync(path.resolve(__dirname, 'dist/style.css'))
        // fs.unlinkSync(path.resolve(__dirname, 'dist/vite.svg'))
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
