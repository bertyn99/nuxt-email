import { describe, it, expect, vi } from 'vitest'

import { createDevCatcherProvider } from '../src/runtime/server/providers/dev-catcher'

describe('DevCatcher provider', () => {
  it('writes message to store and returns result', async () => {
    const write = vi.fn(async () => {})
    const now = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(now)

    const provider = createDevCatcherProvider({ enabled: true, dir: '.mailbox', write } as any)

    const res = await provider.send({
      from: 'a@example.com',
      to: 'b@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      text: 'Hi',
      headers: {},
    } as any)

    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.data.provider).toBe('devCatcher')
      expect(res.data.accepted).toEqual(['b@example.com'])
      expect(res.data.durationMs).toBeGreaterThanOrEqual(0)
    }
    expect(write).toHaveBeenCalledTimes(1)
  })
})


