import { defineNuxtModule, addPlugin, createResolver, addServerHandler, addImportsDir, addServerPlugin } from '@nuxt/kit'
import { setupDevToolsUI } from './devtools/setup'

// Module options TypeScript interface definition
export interface ModuleOptions {
  defaultProvider?: 'resend' | 'sendgrid' | 'mailgun' | 'brevo' | 'smtp' | 'mailtrap' | 'devCatcher'
  providers?: {
    resend?: { apiKey: string }
    sendgrid?: { apiKey: string }
    mailgun?: { apiKey: string, domain: string }
    brevo?: { apiKey: string }
    smtp?: {
      host: string
      port?: number
      secure?: boolean
      auth?: { user: string, pass: string }
    }
    mailtrap?: { apiKey: string, inboxId: string }
    devCatcher?: { enabled: boolean, dir?: string }
  }
  strategy?: {
    mode?: 'primary-fallback' | 'round-robin' | 'weighted'
    weights?: Record<string, number>
    circuitBreaker?: { failureThreshold: number, cooldownMs: number }
    retries?: { maxAttempts: number, backoffMs: number, jitter?: boolean }
  }
  defaults?: {
    from?: string
    replyTo?: string
    headers?: Record<string, string>
    layout?: string
    preheader?: string
    baseUrl?: string
  }
  security?: {
    allowlistDomains?: string[]
    blocklistDomains?: string[]
    sanitizeHeaders?: boolean
    stripTrackingInDev?: boolean
  }
  limits?: {
    maxAttachmentSize?: number
    maxRecipients?: number
  }
  client?: {
    enabled?: boolean
    endpoint?: string
  }
  devtools?: { enabled?: boolean }
  templates?: {
    dir?: string
    layoutDir?: string
    cache?: boolean
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@yggdraz/nuxt-email',
    configKey: 'email',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    defaultProvider: 'devCatcher',
    providers: {
      devCatcher: { enabled: true },
    },
    strategy: {
      mode: 'primary-fallback',
      retries: { maxAttempts: 3, backoffMs: 1000, jitter: true },
      circuitBreaker: { failureThreshold: 5, cooldownMs: 60000 },
    },
    defaults: {
      from: 'no-reply@example.com',
      headers: {} as Record<string, string>,
    },
    security: {
      allowlistDomains: ['example.com'],
      sanitizeHeaders: true,
      stripTrackingInDev: true,
    },
    limits: {
      maxAttachmentSize: 10 * 1024 * 1024, // 10MB
      maxRecipients: 50,
    },
    client: {
      enabled: true,
      endpoint: '/_email/bridge/send',
    },
    devtools: { enabled: true },
    templates: {
      dir: 'emails',
      layoutDir: 'emails/layouts',
      cache: true,
    },
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Expose runtime config (server)
    // Merge user options into runtimeConfig.email
    nuxt.options.runtimeConfig.email = {
      ...(nuxt.options.runtimeConfig.email || {}),
      ...options,
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

    // DevTools endpoints (dev only)
    if (options.devtools?.enabled !== false) {
      addServerHandler({
        route: '/_email/devtools/messages',
        method: 'get',
        handler: resolver.resolve('./runtime/server/api/_email-devtools/messages.get'),
      })
      addServerHandler({
        route: '/_email/devtools/messages/:id/html',
        method: 'get',
        handler: resolver.resolve('./runtime/server/api/_email-devtools/messages/[id]/html.get'),
      })
      addServerHandler({
        route: '/_email/devtools/messages/:id/text',
        method: 'get',
        handler: resolver.resolve('./runtime/server/api/_email-devtools/messages/[id]/text.get'),
      })
      addServerHandler({
        route: '/_email/devtools/messages/:id/raw',
        method: 'get',
        handler: resolver.resolve('./runtime/server/api/_email-devtools/messages/[id]/raw.get'),
      })
      addServerHandler({
        route: '/_email/devtools/messages/:id/resend',
        method: 'post',
        handler: resolver.resolve('./runtime/server/api/_email-devtools/messages/[id]/resend.post'),
      })
    }

    // Setup playground. Only available in development
    if (nuxt.options.dev && options.devtools?.enabled !== false) {
      setupDevToolsUI(options, resolver.resolve)
    }
  },
})
