import { describe, it, expect, vi } from 'vitest'

import { createBrevoProvider } from '../../src/runtime/server/providers/brevo'

type SendInput = {
  from: string
  to: string
  subject: string
  html?: string
  text?: string
  headers?: Record<string, string>
}

describe('Brevo provider', () => {
  it('maps normalized message to Brevo API and returns result', async () => {
    const sendTransacEmail = vi.fn(async (_payload: Record<string, unknown>) => ({ messageId: 'br_123' }))
    const client = { setApiKey: vi.fn(), sendTransacEmail } as { setApiKey: (k: string) => void, sendTransacEmail: (p: Record<string, unknown>) => Promise<{ messageId: string }> }
    const createClient = vi.fn(() => client)

    const provider = createBrevoProvider({ apiKey: 'key', createClient })

    const input: SendInput = {
      from: 'a@example.com',
      to: 'b@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      text: 'Hi',
      headers: {},
    }

    const res = await provider.send(input as unknown as Parameters<typeof provider.send>[0])

    expect(createClient).toHaveBeenCalled()
    expect(client.setApiKey).toHaveBeenCalledWith('key')
    expect(sendTransacEmail).toHaveBeenCalledWith(expect.objectContaining({
      subject: 'Hello', htmlContent: '<p>Hi</p>', to: [{ email: 'b@example.com' }], sender: { email: 'a@example.com' },
    }))
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.data.provider).toBe('brevo')
      expect(res.data.id).toBe('br_123')
      expect(res.data.accepted).toEqual(['b@example.com'])
    }
  })
})
