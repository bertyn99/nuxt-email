export default defineNuxtConfig({
  modules: ['/home/persival/project/yggdraz/nuxt-email/src/module'],
  devtools: { enabled: true },
  email: {
    defaults: { from: 'no-reply@example.com' },
    security: { allowlistDomains: ['example.com'] },
    providers: { devCatcher: { enabled: true } },
  },
})
