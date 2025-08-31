import { createEmailClient } from '../utils/email-client'
import { createHookBus } from '../utils/hook-bus'
import { createProviderRegistry } from '../utils/provider-registry'
import { buildProvidersFromConfig } from '../utils/provider-factory'
import { createTemplateRegistry } from '../utils/template-registry'

export default (nitroApp: any) => {
  const runtimeEmail = (nitroApp?.options?.runtimeConfig?.email) || {}

  const hooks = createHookBus()
  const registry = createProviderRegistry()
  const providers = buildProvidersFromConfig(registry, runtimeEmail.providers || {})
  const templates = createTemplateRegistry()

  const email = createEmailClient({
    defaults: runtimeEmail.defaults,
    strategy: runtimeEmail.strategy,
    security: runtimeEmail.security,
    limits: runtimeEmail.limits,
    circuitBreaker: runtimeEmail.strategy?.circuitBreaker,
  } as any, providers, templates as any, hooks)

  // Expose on nitro event context for server-side usage
  nitroApp.hooks.hook('request', (event: any) => {
    // attach per-request
    // @ts-expect-error custom field
    event.context.$email = email
  })
}
