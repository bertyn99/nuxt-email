import type { NormalizedEmailMessage, ProviderSendResult } from '../utils/email-client'

type Result<T, E = Error> = { success: true, data: T } | { success: false, error: E }

export interface BrevoConfig {
  apiKey: string
  createClient?: () => { setApiKey: (k: string) => void, sendTransacEmail: (payload: any) => Promise<{ messageId: string }> }
}

export interface ProviderAdapter {
  name: string
  health: () => Promise<Result<{ healthy: boolean }>>
  send: (message: NormalizedEmailMessage) => Promise<Result<ProviderSendResult>>
}

export const createBrevoProvider = (config: BrevoConfig): ProviderAdapter => {
  const factory = config.createClient || (() => {
    const Sib = require('@sendinblue/client')
    return new Sib.TransactionalEmailsApi()
  })

  return {
    name: 'brevo',
    health: async () => ({ success: true, data: { healthy: true } }),
    send: async (message) => {
      const start = Date.now()
      try {
        const api = factory()
        api.setApiKey('api-key', config.apiKey)
        const payload: any = {
          sender: { email: (typeof message.from === 'string' ? message.from : message.from.email) },
          to: (Array.isArray(message.to) ? message.to : [message.to]).map((t: any) => ({ email: typeof t === 'string' ? t : t.email })),
          subject: message.subject,
          htmlContent: message.html,
          textContent: message.text,
          headers: message.headers,
        }
        const result = await api.sendTransacEmail(payload)
        const durationMs = Date.now() - start
        const accepted = Array.isArray(message.to) ? (message.to as any[]).map(t => typeof t === 'string' ? t : t.email) : [typeof message.to === 'string' ? message.to : message.to.email]
        return { success: true, data: { id: (result as any).messageId, provider: 'brevo', accepted, rejected: [], durationMs, meta: { response: result } } }
      }
      catch (error: any) {
        return { success: false, error }
      }
    },
  }
}
