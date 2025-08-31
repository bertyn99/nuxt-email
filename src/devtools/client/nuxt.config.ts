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
})
