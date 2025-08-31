import { defineNuxtModule, addPlugin, createResolver, addServerHandler } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'my-module',
    configKey: 'myModule',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'))

    // Bridge endpoint (dev/prod configurable later)
    addServerHandler({
      route: '/_email/bridge/send',
      method: 'post',
      handler: resolver.resolve('./runtime/server/api/_email-bridge/send.post'),
    })
  },
})
