import { describe, it, expect, vi } from 'vitest'

import { createEmailClient } from '../src/runtime/server/utils/email-client'
import { createHookBus } from '../src/runtime/server/utils/hook-bus'
import { createProviderRegistry } from '../src/runtime/server/utils/provider-registry'

describe('EmailClient send flow', () => {
  it('renders optional template (skipped here), runs hooks, and selects provider with retry', async () => {
    const hooks = createHookBus()

    const providers = createProviderRegistry()

    // Adapter that fails once then succeeds
    const adapter = {
      name: 'resend',
      health: vi.fn(async () => ({ success: true, data: { healthy: true } })),
      send: vi.fn()
        .mockResolvedValueOnce({ success: false, error: new Error('temp') })
        .mockResolvedValueOnce({ success: true, data: { provider: 'resend', accepted: ['b@example.com'], rejected: [], durationMs: 1 } }),
    } as any

    const providers2 = providers.addProvider('resend', adapter)

    const email = createEmailClient(
      {
        strategy: { mode: 'primary-fallback', retries: { maxAttempts: 2, backoffMs: 1, jitter: false } },
        defaults: { from: 'a@example.com', headers: {} },
      } as any,
      providers2,
      {
        // template registry not used in this test
        renderTemplate: vi.fn(async () => ({ success: true, data: { html: '<p/>', text: '', subject: 's' } })),
      } as any,
      hooks,
    )

    const afterSend = vi.fn(async () => {})
    hooks.on('email:afterSend', afterSend)

    const res = await email.send({ to: 'b@example.com', subject: 'Test' } as any)
    expect(res.success).toBe(true)
    expect(adapter.send).toHaveBeenCalledTimes(2)
    expect(afterSend).toHaveBeenCalledTimes(1)
  })
})


