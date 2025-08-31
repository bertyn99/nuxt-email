import { describe, it, expect, vi } from 'vitest'

import { createProviderRegistry } from '../src/runtime/server/utils/provider-registry'

describe('ProviderRegistry', () => {
  it('adds, gets, lists, and removes providers immutably', () => {
    const registry = createProviderRegistry()

    const adapterA = {
      name: 'resend',
      health: vi.fn(async () => ({ success: true, data: { healthy: true } })),
      send: vi.fn(),
    } as any

    const adapterB = {
      name: 'sendgrid',
      health: vi.fn(async () => ({ success: true, data: { healthy: true } })),
      send: vi.fn(),
    } as any

    const reg2 = registry.addProvider('resend', adapterA)
    expect(registry.listProviders()).toEqual([])
    expect(reg2.getProvider('resend')).toBe(adapterA)

    const reg3 = reg2.addProvider('sendgrid', adapterB)
    expect(reg3.listProviders().sort()).toEqual(['resend', 'sendgrid'].sort())

    const reg4 = reg3.removeProvider('resend')
    expect(reg3.listProviders().includes('resend')).toBe(true)
    expect(reg4.listProviders()).toEqual(['sendgrid'])
  })

  it('runs health checks across providers', async () => {
    const registry = createProviderRegistry()

    const ok = {
      name: 'resend',
      health: vi.fn(async () => ({ success: true, data: { healthy: true } })),
      send: vi.fn(),
    } as any

    const bad = {
      name: 'sendgrid',
      health: vi.fn(async () => ({ success: false, error: new Error('boom') })),
      send: vi.fn(),
    } as any

    const reg2 = registry.addProvider('resend', ok).addProvider('sendgrid', bad)
    const results = await reg2.healthCheck()

    expect(results.get('resend')).toEqual({ healthy: true })
    expect(results.get('sendgrid')?.healthy).toBe(false)
    expect(results.get('sendgrid')?.error).toBeInstanceOf(Error)
  })
})
