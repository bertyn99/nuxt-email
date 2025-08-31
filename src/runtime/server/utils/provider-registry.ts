export type ProviderName = 'resend' | 'sendgrid' | 'mailgun' | 'brevo' | 'smtp' | 'mailtrap' | 'devCatcher'

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

export type HealthStatus = { healthy: true } | { healthy: false; error?: unknown }

export interface ProviderAdapter {
  name: ProviderName | string
  health: () => Promise<Result<{ healthy: boolean }>>
  send: (...args: any[]) => Promise<any>
}

export interface ProviderRegistry {
  providers: Map<ProviderName | string, ProviderAdapter>
  addProvider: (name: ProviderName | string, adapter: ProviderAdapter) => ProviderRegistry
  removeProvider: (name: ProviderName | string) => ProviderRegistry
  getProvider: (name: ProviderName | string) => ProviderAdapter | undefined
  listProviders: () => (ProviderName | string)[]
  healthCheck: () => Promise<Map<ProviderName | string, HealthStatus>>
}

export const createProviderRegistry = (): ProviderRegistry => {
  const providers = new Map<ProviderName | string, ProviderAdapter>()

  const clone = (newProviders: Map<ProviderName | string, ProviderAdapter>): ProviderRegistry => ({
    providers: newProviders,
    addProvider: (name, adapter) => {
      const next = new Map(newProviders)
      next.set(name, adapter)
      return clone(next)
    },
    removeProvider: (name) => {
      const next = new Map(newProviders)
      next.delete(name)
      return clone(next)
    },
    getProvider: (name) => newProviders.get(name),
    listProviders: () => Array.from(newProviders.keys()),
    healthCheck: async () => {
      const health = new Map<ProviderName | string, HealthStatus>()
      for (const [name, adapter] of newProviders) {
        try {
          const res = await adapter.health()
          if (res.success) {
            health.set(name, { healthy: true })
          } else {
            health.set(name, { healthy: false, error: res.error })
          }
        } catch (err) {
          health.set(name, { healthy: false, error: err })
        }
      }
      return health
    },
  })

  return clone(providers)
}


