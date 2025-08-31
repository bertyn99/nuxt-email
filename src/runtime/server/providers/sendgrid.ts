import type { NormalizedEmailMessage, ProviderSendResult } from '../utils/email-client'

type Result<T, E = Error> = { success: true, data: T } | { success: false, error: E }

export interface SendGridConfig {
  apiKey: string
  createClient?: () => { setApiKey: (k: string) => void, send: (msg: any) => Promise<any[]> }
}

export interface ProviderAdapter {
  name: string
  health: () => Promise<Result<{ healthy: boolean }>>
  send: (message: NormalizedEmailMessage) => Promise<Result<ProviderSendResult>>
}

export const createSendGridProvider = (config: SendGridConfig): ProviderAdapter => {
  const factory = config.createClient || (() => {
    const mail = require('@sendgrid/mail')
    return mail
  })

  return {
    name: 'sendgrid',
    health: async () => ({ success: true, data: { healthy: true } }),
    send: async (message) => {
      const start = Date.now()
      try {
        const sg = factory()
        sg.setApiKey(config.apiKey)
        const payload: any = {
          to: message.to as any,
          cc: message.cc as any,
          bcc: message.bcc as any,
          from: message.from as any,
          subject: message.subject,
          html: message.html,
          text: message.text,
          headers: message.headers,
          attachments: message.attachments?.map(att => ({
            content: typeof att.content === 'string' ? Buffer.from(att.content).toString('base64') : (att.content as Buffer | undefined)?.toString('base64'),
            filename: att.filename,
            type: att.contentType,
            disposition: 'attachment',
          })),
        }
        const result = await sg.send(payload)
        const durationMs = Date.now() - start
        const id = result?.[0]?.headers?.['x-message-id']
        const accepted = Array.isArray(message.to) ? (message.to as any[]).map(String) : [String(message.to as any)]
        return { success: true, data: { id, provider: 'sendgrid', accepted, rejected: [], durationMs, meta: { response: result } } }
      }
      catch (error: any) {
        return { success: false, error }
      }
    },
  }
}
