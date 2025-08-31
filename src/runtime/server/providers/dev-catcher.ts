import type { NormalizedEmailMessage, ProviderSendResult } from '../utils/email-client'
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

type Result<T, E = Error> = { success: true, data: T } | { success: false, error: E }

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
  const mailboxDir = config.dir || join(process.cwd(), '.mailbox')

  const write = async (record: unknown) => {
    if (typeof config.write === 'function') {
      await config.write(record)
    }
    else {
      // Default: write to .mailbox directory
      try {
        await mkdir(mailboxDir, { recursive: true })
        const id = randomUUID()
        const filePath = join(mailboxDir, `${id}.json`)
        await writeFile(filePath, JSON.stringify(record, null, 2))
      }
      catch (error) {
        console.error('Failed to write email to mailbox:', error)
      }
    }
  }

  return {
    name: 'devCatcher',
    health: async () => ({ success: true, data: { healthy: !!config.enabled } }),
    send: async (message) => {
      const start = Date.now()
      const id = randomUUID()

      const record = {
        id,
        date: new Date(Date.now()).toISOString(),
        to: message.to,
        from: message.from,
        subject: message.subject,
        html: message.html,
        text: message.text,
        headers: message.headers,
        provider: 'devCatcher',
        template: message.meta?.template,
      }

      await write(record)

      const durationMs = Date.now() - start
      return {
        success: true,
        data: {
          id,
          provider: 'devCatcher',
          accepted: Array.isArray(message.to) ? message.to.map(String) : [String(message.to)],
          rejected: [],
          durationMs,
        },
      }
    },
  }
}
