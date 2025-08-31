export interface EmailMessage {
  id: string
  to: string | string[]
  from: string
  subject: string
  html?: string
  text?: string
  raw?: string
  timestamp: string
  provider: string
  status: 'sent' | 'failed' | 'pending'
  error?: string
}

export interface EmailTemplate {
  name: string
  subject: string
  preview?: string
  path: string
  layout?: string
}

export interface EmailProvider {
  name: string
  enabled: boolean
  config?: Record<string, any>
}

export interface ServerFunctions {
  getMessages: () => Promise<EmailMessage[]>
  getMessage: (id: string) => Promise<EmailMessage | null>
  resendMessage: (id: string) => Promise<{ success: boolean; error?: string }>
  getTemplates: () => Promise<EmailTemplate[]>
  getProviders: () => Promise<EmailProvider[]>
  getConfig: () => Promise<ModuleOptions>
  clearMessages: () => Promise<void>
}

export interface ClientFunctions {
  refreshMessages: () => void
  refreshTemplates: () => void
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void
  updateMessageStatus: (id: string, status: EmailMessage['status'], error?: string) => void
}

export interface ModuleOptions {
  defaultProvider?: 'resend' | 'sendgrid' | 'mailgun' | 'brevo' | 'smtp' | 'mailtrap' | 'devCatcher'
  providers?: {
    resend?: { apiKey: string }
    sendgrid?: { apiKey: string }
    mailgun?: { apiKey: string, domain: string }
    brevo?: { apiKey: string }
    smtp?: {
      host: string
      port?: number
      secure?: boolean
      auth?: { user: string, pass: string }
    }
    mailtrap?: { apiKey: string, inboxId: string }
    devCatcher?: { enabled?: boolean, dir?: string }
  }
  strategy?: {
    mode?: 'primary-fallback' | 'round-robin' | 'weighted'
    weights?: Record<string, number>
    circuitBreaker?: { failureThreshold: number, cooldownMs: number }
    retries?: { maxAttempts: number, backoffMs: number, jitter?: boolean }
  }
  defaults?: {
    from?: string
    replyTo?: string
    headers?: Record<string, string>
    layout?: string
    preheader?: string
    baseUrl?: string
  }
  security?: {
    allowlistDomains?: string[]
    blocklistDomains?: string[]
    sanitizeHeaders?: boolean
    stripTrackingInDev?: boolean
  }
  limits?: {
    maxAttachmentSize?: number
    maxRecipients?: number
  }
  client?: {
    enabled?: boolean
    endpoint?: string
  }
  devtools?: { enabled?: boolean }
  templates?: {
    dir?: string
    layoutDir?: string
    cache?: boolean
  }
}
