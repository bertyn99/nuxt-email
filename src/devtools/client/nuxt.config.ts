import { resolve } from 'pathe'
import DevtoolsUIKit from '@nuxt/devtools-ui-kit'

export default defineNuxtConfig({
  modules: [
    DevtoolsUIKit,
  ],
  ssr: false,
  devtools: {
    enabled: false,
  },
  app: {
    baseURL: '/__nuxt-email',
  },
  experimental: {
    componentIslands: true,
  },
  compatibilityDate: '2025-08-31',
  nitro: {
    prerender: {
      routes: [
        '/',
      ],
    },
    output: {
      publicDir: resolve(__dirname, '../dist/devtools/client'),
    },
  },
  // UnoCSS configuration for theming
  unocss: {
    shortcuts: {
      'n-button-base': 'border n-border-base rounded shadow-sm op80 !outline-none',
      'n-button-hover': 'op100 !border-context text-context',
      'n-button-active': 'n-active-base bg-context/5',
    },
  },
})
