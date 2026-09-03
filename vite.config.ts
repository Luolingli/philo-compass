import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages 项目页部署: https://<user>.github.io/philo-compass/
export default defineConfig({
  plugins: [react()],
  base: '/philo-compass/',
})
