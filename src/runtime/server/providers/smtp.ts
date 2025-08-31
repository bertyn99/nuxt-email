import type { NormalizedEmailMessage, ProviderSendResult } from '../utils/email-client'

type Result<T, E = Error> = { success: true, data: T } | { success: false, error: E }

export interface SmtpConfig {
  transportOptions: Record<string, any>
  createTransport?: (opts: any) => { sendMail: (msg: any) => Promise<any> }
}

export interface ProviderAdapter {
  name: string
  health: () => Promise<Result<{ healthy: boolean }>>
  send: (message: NormalizedEmailMessage) => Promise<Result<ProviderSendResult>>
}

export const createSmtpProvider = (config: SmtpConfig): ProviderAdapter => {
  const createTransport = config.createTransport || ((opts: any) => {
    // Lazy require to avoid hard dependency in tests

    const nodemailer = require('nodemailer')
    return nodemailer.createTransport(opts)
  })

  return {
    name: 'smtp',
    health: async () => ({ success: true, data: { healthy: true } }),
    send: async (message) => {
      const start = Date.now()
      const transporter = createTransport(config.transportOptions)

      const payload = {
        from: message.from as any,
        to: message.to as any,
        cc: message.cc as any,
        bcc: message.bcc as any,
        subject: message.subject,
        html: message.html,
        text: message.text,
        headers: message.headers,
        attachments: message.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          path: att.path,
          contentType: att.contentType,
        })),
      }

      try {
        const result = await transporter.sendMail(payload)
        const durationMs = Date.now() - start
        return {
          success: true,
          data: {
            id: result.messageId,
            provider: 'smtp',
            accepted: result.accepted || [],
            rejected: result.rejected || [],
            durationMs,
            meta: { response: result.response },
          },
        }
      }
      catch (error: any) {
        return { success: false, error }
      }
    },
  }
}
