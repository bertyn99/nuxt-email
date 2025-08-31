import { describe, it, expect, vi } from 'vitest'

import { createSmtpProvider } from '../../src/runtime/server/providers/smtp'

describe('SMTP provider', () => {
  it('maps normalized message to nodemailer and returns result', async () => {
    const sendMail = vi.fn(async () => ({
      messageId: 'abc123',
      accepted: ['b@example.com'],
      rejected: [],
    }))

    const transporter = { sendMail } as any
    const createTransport = vi.fn(() => transporter)

    const provider = createSmtpProvider({
      transportOptions: { host: 'smtp.example.com', port: 587 },
      createTransport,
    } as any)

    const res = await provider.send({
      from: 'a@example.com',
      to: 'b@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      text: 'Hi',
      headers: { 'X-Test': '1' },
      attachments: [{ filename: 'a.txt', content: 'x', contentType: 'text/plain' }],
    } as any)

    expect(createTransport).toHaveBeenCalled()
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'a@example.com',
      to: 'b@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      text: 'Hi',
      headers: { 'X-Test': '1' },
    }))
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.data.provider).toBe('smtp')
      expect(res.data.accepted).toEqual(['b@example.com'])
      expect(res.data.rejected).toEqual([])
      expect(res.data.id).toBe('abc123')
    }
  })
})
