import { describe, it, expect, vi } from 'vitest'

import { createMailgunProvider } from '../../src/runtime/server/providers/mailgun'

describe('Mailgun provider', () => {
  it('maps normalized message to Mailgun API and returns result', async () => {
    const create = vi.fn(async (_domain: string, _data: any) => ({ id: 'mg_123' }))
    const client = { messages: { create } }
    const factory = vi.fn(() => client)

    const provider = createMailgunProvider({ apiKey: 'key', domain: 'example.com', factory } as any)

    const res = await provider.send({
      from: 'a@example.com',
      to: 'b@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      text: 'Hi',
      headers: { 'X-Test': '1' },
    } as any)

    expect(factory).toHaveBeenCalled()
    expect(create).toHaveBeenCalledWith('example.com', expect.objectContaining({
      from: 'a@example.com', to: 'b@example.com', subject: 'Hello',
    }))
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.data.provider).toBe('mailgun')
      expect(res.data.id).toBe('mg_123')
      expect(res.data.accepted).toEqual(['b@example.com'])
    }
  })
})
