import { describe, it, expect } from 'vitest'

import { createEmailClient } from '../src/runtime/server/utils/email-client'
import { createHookBus } from '../src/runtime/server/utils/hook-bus'
import { createProviderRegistry } from '../src/runtime/server/utils/provider-registry'

describe('EmailClient policy enforcement', () => {
  it('rejects recipients outside allowlist domains', async () => {
    const hooks = createHookBus()
    const providers = createProviderRegistry()
    const email = createEmailClient({
      defaults: { from: 'a@example.com', headers: {} },
      security: { allowlistDomains: ['example.com'] },
      strategy: { mode: 'primary-fallback', retries: { maxAttempts: 1, backoffMs: 1 } },
    } as any, providers, { renderTemplate: async () => ({ success: true, data: { html: '', text: '', subject: '' } }) } as any, hooks)

    const res = await email.send({ to: 'user@blocked.com', subject: 'x' } as any)
    expect(res.success).toBe(false)
  })

  it('rejects when recipients exceed limits', async () => {
    const hooks = createHookBus()
    const providers = createProviderRegistry()
    const email = createEmailClient({
      defaults: { from: 'a@example.com', headers: {} },
      limits: { maxRecipients: 1 },
      strategy: { mode: 'primary-fallback', retries: { maxAttempts: 1, backoffMs: 1 } },
    } as any, providers, { renderTemplate: async () => ({ success: true, data: { html: '', text: '', subject: '' } }) } as any, hooks)

    const res = await email.send({ to: ['a@example.com', 'b@example.com'], subject: 'x' } as any)
    expect(res.success).toBe(false)
  })
})
