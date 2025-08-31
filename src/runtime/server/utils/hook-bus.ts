export type HookEvents =
  | 'email:beforeRender'
  | 'email:afterRender'
  | 'email:beforeSend'
  | 'email:afterSend'
  | 'email:error'

export interface HookContext {
  template?: string
  requestId?: string
  correlationId?: string
  now?: number
}

export interface NormalizedEmailMessage {
  from: string | { name?: string; email: string }
  to: string | { name?: string; email: string } | Array<string | { name?: string; email: string }>
  cc?: string | { name?: string; email: string } | Array<string | { name?: string; email: string }>
  bcc?: string | { name?: string; email: string } | Array<string | { name?: string; email: string }>
  subject: string
  html?: string
  text?: string
  headers?: Record<string, string>
}

export interface ProviderSendResult {
  id?: string
  provider: string
  accepted: string[]
  rejected: string[]
  durationMs: number
  meta?: Record<string, unknown>
}

export interface HookData {
  message: NormalizedEmailMessage
  context: HookContext
  html?: string
  text?: string
  provider?: string
  result?: ProviderSendResult
  error?: Error
}

export type HookHandler = (data: HookData) => Promise<void | Partial<HookData>> | void

export interface HookBus {
  on: (event: HookEvents, handler: HookHandler) => HookBus
  off: (event: HookEvents, handler: HookHandler) => HookBus
  emit: (event: HookEvents, data: HookData) => Promise<void>
}

export const createHookBus = (): HookBus => {
  const handlers = new Map<HookEvents, HookHandler[]>()

  const bus: HookBus = {
    on: (event, handler) => {
      const list = handlers.get(event) || []
      handlers.set(event, [...list, handler])
      return bus
    },
    off: (event, handler) => {
      const list = handlers.get(event) || []
      handlers.set(event, list.filter(h => h !== handler))
      return bus
    },
    emit: async (event, data) => {
      const list = handlers.get(event) || []
      for (const handler of list) {
        try {
          await handler(data)
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(`Hook handler error for ${event}:`, err)
        }
      }
    },
  }

  return bus
}


