import type { EmailAddress, NormalizedEmailMessage, ProviderSendResult } from '../utils/email-client'

type Result<T, E = Error> = { success: true, data: T } | { success: false, error: E }

type ResendSendPayload = {
  from: string
  to: string | string[]
  cc?: string | string[]
  bcc?: string | string[]
  subject: string
  html?: string
  text?: string
  headers?: Record<string, string>
  attachments?: Array<{
    filename?: string
    content?: Buffer | string
    path?: string
    contentType?: string
  }>
}

type ResendEmailClient = { emails: { send: (payload: ResendSendPayload) => Promise<{ id: string }> } }

export interface ResendConfig {
  apiKey: string
  createClient?: (apiKey: string) => ResendEmailClient | Promise<ResendEmailClient>
}

export interface ProviderAdapter {
  name: string
  health: () => Promise<Result<{ healthy: boolean }>>
  send: (message: NormalizedEmailMessage) => Promise<Result<ProviderSendResult>>
}

const toError = (err: unknown): Error => (err instanceof Error ? err : new Error(String(err)))

const formatAddress = (addr: EmailAddress): string => {
  if (typeof addr === 'string') return addr
  return addr.name ? `${addr.name} <${addr.email}>` : addr.email
}

const toList = (addr?: EmailAddress | EmailAddress[]): string | string[] | undefined => {
  if (!addr) return undefined
  return Array.isArray(addr) ? addr.map(formatAddress) : formatAddress(addr)
}

export const createResendProvider = (config: ResendConfig): ProviderAdapter => {
  const createClient = config.createClient || (async () => {
    throw new Error('Resend client is not installed. Provide `createClient` in config or install the optional dependency.')
  })

  return {
    name: 'resend',
    health: async () => {
      try {
        const client = await Promise.resolve(createClient(config.apiKey))
        if (!(client && client.emails))
          throw new Error('No client')
        return { success: true, data: { healthy: true } }
      }
      catch (error) {
        return { success: false, error: toError(error) }
      }
    },
    send: async (message) => {
      const start = Date.now()
      try {
        const client = await Promise.resolve(createClient(config.apiKey))
        const result = await client.emails.send({
          from: formatAddress(message.from),
          to: toList(message.to)!,
          cc: toList(message.cc),
          bcc: toList(message.bcc),
          subject: message.subject,
          html: message.html,
          text: message.text,
          headers: message.headers,
          attachments: message.attachments,
        })
        const durationMs = Date.now() - start
        const accepted = Array.isArray(message.to) ? message.to.map(formatAddress) : [formatAddress(message.to)]
        return {
          success: true,
          data: {
            id: result.id,
            provider: 'resend',
            accepted,
            rejected: [],
            durationMs,
            meta: { resendId: result.id },
          },
        }
      }
      catch (error) {
        return { success: false, error: toError(error) }
      }
    },
  }
}
