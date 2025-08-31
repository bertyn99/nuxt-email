import { defineNuxtModule, addPlugin, createResolver, addServerHandler, addImportsDir, addServerPlugin } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {
  defaults?: { from?: string, headers?: Record<string, string> }
  strategy?: { mode?: 'primary-fallback' | 'round-robin' | 'weighted', weights?: Record<string, number>, retries?: { maxAttempts: number, backoffMs: number, jitter?: boolean }, circuitBreaker?: { failureThreshold: number, cooldownMs: number } }
  security?: { allowlistDomains?: string[] }
  limits?: { maxRecipients?: number }
  providers?: { devCatcher?: { enabled?: boolean } }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'my-module',
    configKey: 'email',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    defaults: { from: 'no-reply@example.com', headers: {} },
    security: { allowlistDomains: [] },
    limits: { maxRecipients: 50 },
    strategy: { mode: 'primary-fallback', retries: { maxAttempts: 1, backoffMs: 1 }, circuitBreaker: { failureThreshold: 5, cooldownMs: 60_000 } },
    providers: { devCatcher: { enabled: true } },
  },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Expose runtime config (server)
    // Merge user options into runtimeConfig.email
    nuxt.options.runtimeConfig.email = {
      ...(nuxt.options.runtimeConfig.email || {}),
      ..._options,
    }

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'))
    // Server-only Nitro plugin to provide $email
    addServerPlugin(resolver.resolve('./runtime/server/plugins/email.server'))
    // Auto-import composables
    addImportsDir(resolver.resolve('./runtime/composables'))

    // Bridge endpoint (dev/prod configurable later)
    addServerHandler({
      route: '/_email/bridge/send',
      method: 'post',
      handler: resolver.resolve('./runtime/server/api/_email-bridge/send.post'),
    })
  },
})
