import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  email: {
    security: { allowlistDomains: ['example.com'] },
    providers: { devCatcher: { enabled: true } },
  },
})
