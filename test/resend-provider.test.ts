import { describe, it, expect, vi } from 'vitest'

import { createResendProvider } from '../src/runtime/server/providers/resend'

describe('Resend provider', () => {
  it('maps normalized message to Resend API and returns result', async () => {
    const send = vi.fn(async () => ({ id: 're_123' }))
    const emails = { send }
    const client = { emails } as any

    const createClient = vi.fn(() => client)
    const provider = createResendProvider({ apiKey: 'key', createClient } as any)

    const res = await provider.send({
      from: 'a@example.com',
      to: 'b@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      text: 'Hi',
      headers: { 'X-Test': '1' },
      attachments: [{ filename: 'a.txt', content: 'x', contentType: 'text/plain' }],
    } as any)

    expect(createClient).toHaveBeenCalledWith('key')
    expect(send).toHaveBeenCalledWith(expect.objectContaining({
      from: 'a@example.com',
      to: 'b@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      text: 'Hi',
      headers: { 'X-Test': '1' },
    }))
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.data.provider).toBe('resend')
      expect(res.data.id).toBe('re_123')
      expect(res.data.accepted).toEqual(['b@example.com'])
    }
  })
})
