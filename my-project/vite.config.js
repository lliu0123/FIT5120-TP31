import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        awareness: resolve(__dirname, 'awareness.html'),
        tools: resolve(__dirname, 'tools.html'),
        profile: resolve(__dirname, 'profile.html'),
        calculator: resolve(__dirname, 'calculator.html'),
        clothing_advice: resolve(__dirname, 'clothing_advice.html'),
      },
    },
  },
})