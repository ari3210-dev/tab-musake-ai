import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Trik memaksa Vite mengabaikan logo png dan data kuis yang belum diunggah
      external: [
        './assets/images/tab_bot_logo_1781152066922.png',
        './data/quiz',
        './data/glossary'
      ]
    }
  }
})
