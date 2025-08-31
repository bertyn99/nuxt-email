import { describe, it, expect, vi } from 'vitest'

import { createEmailClient } from '../src/runtime/server/utils/email-client'
import { createHookBus } from '../src/runtime/server/utils/hook-bus'
import { createProviderRegistry } from '../src/runtime/server/utils/provider-registry'

describe('EmailClient circuit breaker', () => {
  it('opens after threshold failures and cools down before half-open', async () => {
    const hooks = createHookBus()
    const calls = 0
    const failingAdapter = {
      name: 'resend',
      health: vi.fn(async () => ({ success: true, data: { healthy: true } })),
      send: vi.fn(async () => ({ success: false, error: new Error('boom') })),
    } as any

    const providers = createProviderRegistry().addProvider('resend', failingAdapter)

    const email = createEmailClient({
      defaults: { from: 'a@example.com', headers: {} },
      strategy: { mode: 'primary-fallback', retries: { maxAttempts: 1, backoffMs: 1 } },
      circuitBreaker: { failureThreshold: 2, cooldownMs: 10 },
    } as any, providers, { renderTemplate: async () => ({ success: true, data: { html: '', text: '', subject: '' } }) } as any, hooks)

    const r1 = await email.send({ to: 'b@example.com', subject: 'x' } as any)
    const r2 = await email.send({ to: 'b@example.com', subject: 'x' } as any)
    expect(r1.success).toBe(false)
    expect(r2.success).toBe(false)

    // Now circuit should be open; next call should fail fast without invoking adapter
    failingAdapter.send.mockClear()
    const r3 = await email.send({ to: 'b@example.com', subject: 'x' } as any)
    expect(r3.success).toBe(false)
    expect(failingAdapter.send).not.toHaveBeenCalled()
  })
})
