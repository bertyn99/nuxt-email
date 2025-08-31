import type { NormalizedEmailMessage, ProviderSendResult } from '../utils/email-client'

type Result<T, E = Error> = { success: true, data: T } | { success: false, error: E }

export interface MailgunConfig {
  apiKey: string
  domain: string
  factory?: () => { messages: { create: (domain: string, data: any) => Promise<{ id: string }> } }
}

export interface ProviderAdapter {
  name: string
  health: () => Promise<Result<{ healthy: boolean }>>
  send: (message: NormalizedEmailMessage) => Promise<Result<ProviderSendResult>>
}

export const createMailgunProvider = (config: MailgunConfig): ProviderAdapter => {
  const factory = config.factory || (() => {
    const formData = require('form-data')

    const Mailgun = require('mailgun.js')
    const mg = Mailgun(formData)
    return mg.client({ username: 'api', key: config.apiKey })
  })

  return {
    name: 'mailgun',
    health: async () => ({ success: true, data: { healthy: true } }),
    send: async (message) => {
      const start = Date.now()
      try {
        const mg = factory()
        const data: any = {
          from: message.from as any,
          to: message.to as any,
          cc: message.cc as any,
          bcc: message.bcc as any,
          subject: message.subject,
          html: message.html,
          text: message.text,
          ...message.headers,
        }
        const result = await mg.messages.create(config.domain, data)
        const durationMs = Date.now() - start
        const accepted = Array.isArray(message.to) ? (message.to as any[]).map(String) : [String(message.to as any)]
        return { success: true, data: { id: result.id, provider: 'mailgun', accepted, rejected: [], durationMs, meta: { response: result } } }
      }
      catch (error: any) {
        return { success: false, error }
      }
    },
  }
}
