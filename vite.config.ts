import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: 'lib/index.ts',
      name: '@seemr/vuetransable',
      formats: ['cjs', 'es'],
      fileName: format => format === 'es' 
        ? 'es/index.mjs' 
        : 'lib/index.cjs',
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
