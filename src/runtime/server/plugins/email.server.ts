import { createEmailClient } from '../utils/email-client'
import { createHookBus } from '../utils/hook-bus'
import { createProviderRegistry } from '../utils/provider-registry'
import { buildProvidersFromConfig } from '../utils/provider-factory'
import { createTemplateRegistry } from '../utils/template-registry'

export default (nitroApp: { options?: { runtimeConfig?: { email?: Record<string, unknown> } }, hooks: { hook: (event: string, handler: (event: { context: Record<string, unknown> }) => void) => void } }) => {
  const runtimeEmail = (nitroApp?.options?.runtimeConfig?.email) || {}

  console.log('Email plugin - runtime config:', JSON.stringify(runtimeEmail, null, 2))

  const hooks = createHookBus()
  const registry = createProviderRegistry()
  const providers = buildProvidersFromConfig(registry, runtimeEmail.providers || {})
  const templates = createTemplateRegistry()

  const email = createEmailClient({
    defaults: runtimeEmail.defaults,
    strategy: runtimeEmail.strategy,
    security: runtimeEmail.security,
    limits: runtimeEmail.limits,
    circuitBreaker: (runtimeEmail.strategy as any)?.circuitBreaker,
  } as any, providers, templates, hooks)

  // Expose on nitro event context for server-side usage
  nitroApp.hooks.hook('request', (event: { context: Record<string, unknown> }) => {
    // attach per-request
    event.context.$email = email
  })
}
