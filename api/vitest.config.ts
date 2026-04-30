import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@factories': resolve(__dirname, 'src/factories'),
      '@use-cases': resolve(__dirname, 'src/use-cases'),
      '@repositories': resolve(__dirname, 'src/repositories'),
      '@errors': resolve(__dirname, 'src/errors'),
    },
  },
})
