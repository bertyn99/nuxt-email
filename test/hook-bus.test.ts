import { describe, it, expect, vi, beforeEach } from 'vitest'

// Import the hook bus from source (will be created after tests fail first)
// Path is relative to this test file
import { createHookBus } from '../src/runtime/server/utils/hook-bus'

describe('HookBus', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('registers handlers and emits in order', async () => {
    const bus = createHookBus()

    const calls: string[] = []
    const h1 = vi.fn(async () => { calls.push('h1') })
    const h2 = vi.fn(async () => { calls.push('h2') })

    bus.on('email:beforeRender', h1)
      .on('email:beforeRender', h2)

    await bus.emit('email:beforeRender', {
      message: { from: 'a@example.com', to: 'b@example.com', subject: 's' },
      context: { now: Date.now() },
    } as any)

    expect(h1).toHaveBeenCalledTimes(1)
    expect(h2).toHaveBeenCalledTimes(1)
    expect(calls).toEqual(['h1', 'h2'])
  })

  it('supports off() to remove a handler', async () => {
    const bus = createHookBus()
    const calls: string[] = []
    const h1 = vi.fn(async () => { calls.push('h1') })
    const h2 = vi.fn(async () => { calls.push('h2') })

    bus.on('email:afterRender', h1)
      .on('email:afterRender', h2)
      .off('email:afterRender', h1)

    await bus.emit('email:afterRender', {
      message: { from: 'a@example.com', to: 'b@example.com', subject: 's' },
      context: { now: Date.now() },
      html: '<p>Hi</p>',
      text: 'Hi',
    } as any)

    expect(h1).not.toHaveBeenCalled()
    expect(h2).toHaveBeenCalledTimes(1)
    expect(calls).toEqual(['h2'])
  })

  it('isolates errors in handlers and logs them', async () => {
    const bus = createHookBus()
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const h1 = vi.fn(async () => { throw new Error('boom') })
    const h2 = vi.fn(async () => {})

    bus.on('email:afterSend', h1)
      .on('email:afterSend', h2)

    await bus.emit('email:afterSend', {
      message: { from: 'a@example.com', to: 'b@example.com', subject: 's' },
      context: { now: Date.now() },
      provider: 'resend',
      result: { provider: 'resend', accepted: [], rejected: [], durationMs: 0 },
    } as any)

    expect(h1).toHaveBeenCalledTimes(1)
    expect(h2).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalled()
  })
})
