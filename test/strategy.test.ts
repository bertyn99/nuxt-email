import { describe, it, expect, vi } from 'vitest'

import { selectProviders, selectWeighted, shuffle } from '../src/runtime/server/utils/strategy'

describe('Strategy selection', () => {
  it('primary-fallback returns healthy providers in order', () => {
    const providers = ['resend', 'sendgrid', 'mailgun'] as const
    const health = new Map([
      ['resend', { healthy: true }],
      ['sendgrid', { healthy: true }],
      ['mailgun', { healthy: false }],
    ])
    const result = selectProviders('primary-fallback', providers as any, undefined, health as any)
    expect(result).toEqual(['resend', 'sendgrid'])
  })

  it('round-robin shuffles but only includes healthy', () => {
    const providers = ['a', 'b', 'c'] as any
    const health = new Map([
      ['a', { healthy: true }],
      ['b', { healthy: false }],
      ['c', { healthy: true }],
    ])
    const result = selectProviders('round-robin', providers, undefined, health as any)
    expect(result.sort()).toEqual(['a', 'c'])
  })

  it('weighted duplicates based on weights and returns shuffled mix', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const providers = ['x', 'y'] as any
    const weights = { x: 3, y: 1 } as any
    const result = selectProviders('weighted', providers, weights)
    expect(result.filter(p => p === 'x').length).toBe(3)
    expect(result.filter(p => p === 'y').length).toBe(1)
  })
})
