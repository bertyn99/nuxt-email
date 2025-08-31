import { defineEventHandler, readBody } from 'h3'
import { createEmailClient } from '../../utils/email-client'
import { createProviderRegistry } from '../../utils/provider-registry'
import { createHookBus } from '../../utils/hook-bus'
import { createDevCatcherProvider } from '../../providers/dev-catcher'

export default defineEventHandler(async (event) => {
  const payload = await readBody(event)

  // Minimal runtime wiring for now: single devCatcher provider if enabled
  const hooks = createHookBus()
  const providers = createProviderRegistry()
    .addProvider('devCatcher', createDevCatcherProvider({ enabled: true }))

  const email = createEmailClient(
    {
      strategy: { mode: 'primary-fallback', retries: { maxAttempts: 1, backoffMs: 1 } },
      defaults: { from: payload?.from || 'no-reply@example.com', headers: {} },
    },
    providers,
    { renderTemplate: async () => ({ success: true, data: { html: payload?.html, text: payload?.text, subject: payload?.subject } }) },
    hooks,
  )

  const res = await email.send(payload)
  return res
})
