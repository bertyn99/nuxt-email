import type { NormalizedEmailMessage, ProviderSendResult } from '../utils/email-client'

type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E }

export interface DevCatcherConfig {
  enabled: boolean
  dir?: string
  write?: (record: unknown) => Promise<void>
}

export interface ProviderAdapter {
  name: string
  health: () => Promise<Result<{ healthy: boolean }>>
  send: (message: NormalizedEmailMessage) => Promise<Result<ProviderSendResult>>
}

export const createDevCatcherProvider = (config: DevCatcherConfig): ProviderAdapter => {
  const write = async (record: unknown) => {
    if (typeof config.write === 'function') {
      await config.write(record)
    }
  }

  return {
    name: 'devCatcher',
    health: async () => ({ success: true, data: { healthy: !!config.enabled } }),
    send: async (message) => {
      const start = Date.now()
      await write({
        date: new Date(Date.now()).toISOString(),
        to: message.to,
        from: message.from,
        subject: message.subject,
        html: message.html,
        text: message.text,
        headers: message.headers,
      })

      const durationMs = Date.now() - start
      return {
        success: true,
        data: {
          provider: 'devCatcher',
          accepted: Array.isArray(message.to) ? message.to.map(String) : [String(message.to as any)],
          rejected: [],
          durationMs,
        },
      }
    },
  }
}


