import { existsSync } from 'node:fs'
import type { Nuxt } from 'nuxt/schema'
import type { Nitro } from 'nitropack'
import type { Resolver } from '@nuxt/kit'
import { useNuxt } from '@nuxt/kit'
import { extendServerRpc, onDevToolsInitialized, addCustomTab } from '@nuxt/devtools-kit'
import type { ModuleOptions } from '../module'
import type { ClientFunctions, ServerFunctions } from '../rpc-types'

const DEVTOOLS_UI_ROUTE = '/__nuxt-email'
const DEVTOOLS_UI_LOCAL_PORT = 3030

export function setupDevToolsUI(options: ModuleOptions, resolve: Resolver['resolve'], nuxt: Nuxt = useNuxt()) {
  const clientPath = resolve('./client')
  const isProductionBuild = existsSync(clientPath)

  // Serve production-built client (used when package is published)
  if (isProductionBuild) {
    nuxt.hook('vite:serverCreated', async (server) => {
      const sirv = await import('sirv').then(r => r.default || r)
      server.middlewares.use(
        DEVTOOLS_UI_ROUTE,
        sirv(clientPath, { dev: true, single: true }),
      )
    })
  }
  // In local development, start a separate Nuxt Server and proxy to serve the client
  else {
    nuxt.hook('vite:extendConfig', (config) => {
      config.server = config.server || {}
      config.server.proxy = config.server.proxy || {}
      config.server.proxy[DEVTOOLS_UI_ROUTE] = {
        target: `http://localhost:${DEVTOOLS_UI_LOCAL_PORT}${DEVTOOLS_UI_ROUTE}`,
        changeOrigin: true,
        followRedirects: true,
        rewrite: path => path.replace(DEVTOOLS_UI_ROUTE, ''),
      }
    })
  }
  const useNitro = new Promise<Nitro>((resolve) => {
    nuxt.hooks.hook('nitro:init', resolve)
  })

  // wait for DevTools to be initialized
  onDevToolsInitialized(async () => {
    const rpc = extendServerRpc<ClientFunctions, ServerFunctions>('nuxt-email', {

      async getMessages() {
        // This will be implemented to fetch messages from the devCatcher or other storage
        return []
      },
      async getMessage(_id: string) {
        // This will be implemented to fetch a specific message
        return null
      },
      async resendMessage(_id: string) {
        // This will be implemented to resend a message
        return { success: false, error: 'Not implemented yet' }
      },
      async getTemplates() {
        // This will be implemented to scan and return available templates
        return []
      },
      async getProviders() {
        // This will be implemented to return configured providers
        const providers: Array<{ name: string, enabled: boolean, config?: Record<string, unknown> }> = []

        if (options.providers?.resend) {
          providers.push({ name: 'resend', enabled: true, config: { hasApiKey: !!options.providers.resend.apiKey } })
        }
        if (options.providers?.sendgrid) {
          providers.push({ name: 'sendgrid', enabled: true, config: { hasApiKey: !!options.providers.sendgrid.apiKey } })
        }
        if (options.providers?.mailgun) {
          providers.push({ name: 'mailgun', enabled: true, config: { hasApiKey: !!options.providers.mailgun.apiKey, domain: options.providers.mailgun.domain } })
        }
        if (options.providers?.brevo) {
          providers.push({ name: 'brevo', enabled: true, config: { hasApiKey: !!options.providers.brevo.apiKey } })
        }
        if (options.providers?.smtp) {
          providers.push({ name: 'smtp', enabled: true, config: { host: options.providers.smtp.host, port: options.providers.smtp.port } })
        }
        if (options.providers?.mailtrap) {
          providers.push({ name: 'mailtrap', enabled: true, config: { hasApiKey: !!options.providers.mailtrap.apiKey, inboxId: options.providers.mailtrap.inboxId } })
        }
        if (options.providers?.devCatcher) {
          providers.push({ name: 'devCatcher', enabled: !!options.providers.devCatcher.enabled, config: { dir: options.providers.devCatcher.dir } })
        }

        return providers
      },
      async getConfig() {
        return options
      },
      async clearMessages() {
        // This will be implemented to clear stored messages
      },
    })

    // Watch for file changes to refresh the devtools
    nuxt.hook('builder:watch', (e, path) => {
      // Refresh when email templates change
      if (e === 'change' && path.includes(options.templates?.dir || 'emails')) {
        rpc.broadcast.refreshTemplates()
          .catch(() => {}) // ignore errors
      }
    })
  })

  // Register the custom tab
  addCustomTab({
    name: 'nuxt-email',
    title: 'Email',
    icon: 'carbon:email',
    view: {
      type: 'iframe',
      src: DEVTOOLS_UI_ROUTE,
    },
  })
}
