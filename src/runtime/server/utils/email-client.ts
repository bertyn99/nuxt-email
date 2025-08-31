import type { HookBus } from './hook-bus'
import type { ProviderRegistry } from './provider-registry'
import { selectProviders } from './strategy'

export type EmailAddress = string | { name?: string; email: string }

export type EmailMessage<TData = unknown> = {
  to: EmailAddress | EmailAddress[]
  cc?: EmailAddress | EmailAddress[]
  bcc?: EmailAddress | EmailAddress[]
  subject: string
  template?: string
  html?: string
  text?: string
  data?: TData
  headers?: Record<string, string>
  attachments?: Array<{
    filename?: string
    content?: Buffer | string
    path?: string
    contentType?: string
  }>
}

export type NormalizedEmailMessage = {
  from: EmailAddress
  to: EmailAddress | EmailAddress[]
  cc?: EmailAddress | EmailAddress[]
  bcc?: EmailAddress | EmailAddress[]
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
  meta?: { template?: string; correlationId?: string }
}

export type ProviderSendResult = {
  id?: string
  provider: string
  accepted: string[]
  rejected: string[]
  durationMs: number
  meta?: Record<string, unknown>
}

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

type RetryConfig = { maxAttempts: number; backoffMs: number; jitter?: boolean }

export interface EmailClient {
  send: (message: EmailMessage) => Promise<Result<ProviderSendResult>>
}

export const createEmailClient = (
  config: any,
  providers: ProviderRegistry,
  templates: any,
  hooks: HookBus,
): EmailClient => ({
  send: async (message) => {
    const normalized = normalizeMessage(message, config.defaults || {})

    await hooks.emit('email:beforeRender', { message: normalized, context: { now: Date.now() } } as any)

    let renderResult: { html?: string; text?: string; subject?: string } | undefined
    if (message.template) {
      const render = await templates.renderTemplate(message.template, message.data)
      if (!render.success)
        return { success: false, error: render.error }
      renderResult = render.data
    }

    const finalMessage = mergeRenderResult(normalized, renderResult)

    await hooks.emit('email:afterRender', { message: finalMessage, context: { now: Date.now() } } as any)

    const selected = selectProviders(
      config.strategy?.mode || 'primary-fallback',
      providers.listProviders() as any,
      config.strategy?.weights,
    )

    for (const name of selected) {
      const adapter = providers.getProvider(name as any)
      if (!adapter)
        continue

      const result = await sendWithRetries(adapter as any, finalMessage, config.strategy?.retries || { maxAttempts: 1, backoffMs: 1 })
      if (result.success) {
        await hooks.emit('email:afterSend', { message: finalMessage, context: { now: Date.now() }, provider: name as any, result: result.data } as any)
        return result
      }
    }

    const error = new Error('All providers failed')
    await hooks.emit('email:error', { message: finalMessage, error, attempts: selected.length, context: { now: Date.now() } } as any)
    return { success: false, error }
  },
})

const normalizeMessage = (message: EmailMessage, defaults: any): NormalizedEmailMessage => ({
  from: (message as any).from || defaults.from,
  to: message.to,
  cc: message.cc,
  bcc: message.bcc,
  subject: message.subject,
  html: message.html,
  text: message.text,
  headers: { ...(defaults.headers || {}), ...(message.headers || {}) },
  attachments: message.attachments,
  meta: { template: message.template },
})

const mergeRenderResult = (
  message: NormalizedEmailMessage,
  render?: { html?: string; text?: string; subject?: string },
): NormalizedEmailMessage => ({
  ...message,
  html: render?.html || message.html,
  text: render?.text || message.text,
  subject: render?.subject || message.subject,
})

const sendWithRetries = async (
  provider: { send: (m: NormalizedEmailMessage) => Promise<Result<ProviderSendResult>> },
  message: NormalizedEmailMessage,
  retry: RetryConfig,
): Promise<Result<ProviderSendResult>> => {
  let lastError: any
  for (let attempt = 1; attempt <= retry.maxAttempts; attempt++) {
    const res = await provider.send(message)
    if ((res as any).success)
      return res as any
    lastError = (res as any).error
    if (attempt < retry.maxAttempts) {
      const delay = retry.backoffMs * Math.pow(2, attempt - 1)
      await new Promise(r => setTimeout(r, delay))
    }
  }
  return { success: false, error: lastError }
}


