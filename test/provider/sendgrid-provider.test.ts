import { describe, it, expect, vi } from 'vitest'

import { createSendGridProvider } from '../../src/runtime/server/providers/sendgrid'

describe('SendGrid provider', () => {
  it('maps normalized message to SendGrid API and returns result', async () => {
    const send = vi.fn(async (_msg: any) => [
      { headers: { 'x-message-id': 'sg_123' } },
    ])
    const client = { setApiKey: vi.fn(), send } as any
    const createClient = vi.fn(() => client)

    const provider = createSendGridProvider({ apiKey: 'key', createClient } as any)

    const res = await provider.send({
      from: 'a@example.com',
      to: 'b@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      text: 'Hi',
      headers: { 'X-Test': '1' },
      attachments: [{ filename: 'a.txt', content: 'x', contentType: 'text/plain' }],
    } as any)

    expect(createClient).toHaveBeenCalled()
    expect(client.setApiKey).toHaveBeenCalledWith('key')
    expect(send).toHaveBeenCalledWith(expect.objectContaining({
      to: 'b@example.com', from: 'a@example.com', subject: 'Hello', html: '<p>Hi</p>',
    }))
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.data.provider).toBe('sendgrid')
      expect(res.data.id).toBe('sg_123')
      expect(res.data.accepted).toEqual(['b@example.com'])
    }
  })
})
