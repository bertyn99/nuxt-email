import type { HookBus } from './hook-bus'
import type { ProviderRegistry } from './provider-registry'
import { selectProviders, type StrategyMode } from './strategy'

export type EmailAddress = string | { name?: string, email: string }

export type EmailMessage<TData = unknown> = {
  from?: EmailAddress
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
  meta?: { template?: string, correlationId?: string }
}

export type ProviderSendResult = {
  id?: string
  provider: string
  accepted: string[]
  rejected: string[]
  durationMs: number
  meta?: Record<string, unknown>
}

export type Result<T, E = Error>
  = | { success: true, data: T }
    | { success: false, error: E }

type RetryConfig = { maxAttempts: number, backoffMs: number, jitter?: boolean }

export interface EmailClient {
  send: (message: EmailMessage) => Promise<Result<ProviderSendResult>>
}

type RenderData = { html?: string, text?: string, subject?: string }

type EmailClientConfig = {
  defaults?: { from?: EmailAddress, headers?: Record<string, string> }
  strategy?: { mode?: StrategyMode, weights?: Record<string, number>, retries?: RetryConfig }
  security?: { allowlistDomains?: string[] }
  limits?: { maxRecipients?: number }
  circuitBreaker?: { failureThreshold: number, cooldownMs: number }
}

export const createEmailClient = (
  config: EmailClientConfig,
  providers: ProviderRegistry,
  templates: { renderTemplate: (name: string, data: unknown) => Promise<Result<RenderData>> },
  hooks: HookBus,
): EmailClient => {
  const circuit = new Map<string, { state: 'closed' | 'open', failureCount: number, openedAt?: number }>()
  const cb = config.circuitBreaker || { failureThreshold: Infinity, cooldownMs: 0 }

  const isOpen = (name: string) => {
    const s = circuit.get(name)
    if (!s || s.state !== 'open') return false
    return typeof s.openedAt === 'number' && (Date.now() - s.openedAt) < cb.cooldownMs
  }
  const recordSuccess = (name: string) => {
    circuit.set(name, { state: 'closed', failureCount: 0 })
  }
  const recordFailure = (name: string) => {
    const prev = circuit.get(name) || { state: 'closed', failureCount: 0 as number }
    const failureCount = prev.failureCount + 1
    if (failureCount >= cb.failureThreshold) circuit.set(name, { state: 'open', failureCount, openedAt: Date.now() })
    else circuit.set(name, { state: prev.state, failureCount, openedAt: prev.openedAt })
  }

  return { send: async (message: EmailMessage) => {
    const normalized = normalizeMessage(message, config.defaults || {})

    // Policy: allowlist domains (non-prod by plan, but simple here)
    if (config.security && Array.isArray(config.security.allowlistDomains) && config.security.allowlistDomains.length > 0) {
      const toArray = (v?: EmailAddress | EmailAddress[]): EmailAddress[] => v ? (Array.isArray(v) ? v : [v]) : []
      const flatten = (r: EmailAddress): string => typeof r === 'string' ? r : r.email
      const all: EmailAddress[] = [...toArray(normalized.to), ...toArray(normalized.cc), ...toArray(normalized.bcc)]
      const ok = all.every((addr) => {
        const email = flatten(addr)
        const domain = String(email.split('@')[1] || '')
        return (config.security as { allowlistDomains?: string[] }).allowlistDomains?.includes(domain)
      })
      if (!ok) {
        return { success: false, error: new Error('Recipient domain not allowed') }
      }
    }

    // Policy: recipient limits
    if (config.limits?.maxRecipients) {
      const toCount = Array.isArray(normalized.to) ? normalized.to.length : 1
      const ccCount = Array.isArray(normalized.cc) ? normalized.cc.length : 0
      const bccCount = Array.isArray(normalized.bcc) ? normalized.bcc.length : 0
      const total = toCount + ccCount + bccCount
      if (total > config.limits.maxRecipients) {
        return { success: false, error: new Error('Too many recipients') }
      }
    }

    await hooks.emit('email:beforeRender', { message: normalized, context: { now: Date.now() } } as unknown as Parameters<HookBus['emit']>[1])

    let renderResult: RenderData | undefined
    if (message.template) {
      const render = await templates.renderTemplate(message.template, message.data)
      if (!render.success)
        return { success: false, error: render.error }
      renderResult = render.data
    }

    const finalMessage = mergeRenderResult(normalized, renderResult)

    await hooks.emit('email:afterRender', { message: finalMessage, context: { now: Date.now() } } as unknown as Parameters<HookBus['emit']>[1])

    const selected = selectProviders(
      (config.strategy?.mode || 'primary-fallback') as StrategyMode,
      providers.listProviders().map(String),
      config.strategy?.weights,
    )

    for (const name of selected) {
      if (isOpen(name as string)) continue
      const adapter = providers.getProvider(name as string)
      if (!adapter)
        continue

      const result = await sendWithRetries(adapter as { send: (m: NormalizedEmailMessage) => Promise<Result<ProviderSendResult>> }, finalMessage, config.strategy?.retries || { maxAttempts: 1, backoffMs: 1 })
      if (result.success) {
        recordSuccess(name as string)
        await hooks.emit('email:afterSend', { message: finalMessage, context: { now: Date.now() }, provider: name as string, result: result.data } as unknown as Parameters<HookBus['emit']>[1])
        return result
      }
      recordFailure(name as string)
    }

    const error = new Error('All providers failed')
    await hooks.emit('email:error', { message: finalMessage, error, attempts: selected.length as unknown as number, context: { now: Date.now() } } as unknown as Parameters<HookBus['emit']>[1])
    return { success: false, error }
  } }
}

const normalizeMessage = (message: EmailMessage, defaults: { from?: EmailAddress, headers?: Record<string, string> }): NormalizedEmailMessage => ({
  from: message.from ?? defaults.from!,
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
  render?: RenderData,
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
  let lastError: Error | undefined
  for (let attempt = 1; attempt <= retry.maxAttempts; attempt++) {
    const res = await provider.send(message)
    if (res.success)
      return res
    lastError = res.error
    if (attempt < retry.maxAttempts) {
      const delay = retry.backoffMs * Math.pow(2, attempt - 1)
      await new Promise(r => setTimeout(r, delay))
    }
  }
  return { success: false, error: lastError! }
}
