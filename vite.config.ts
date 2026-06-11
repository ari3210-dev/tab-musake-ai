import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Trik memaksa Vite mengabaikan file data kuis/glossary yang hilang
    rollupOptions: {
      external: ['./data/quiz', './data/glossary', './types'],
    }
  }
})
