export type ProviderName = string

export type StrategyMode = 'primary-fallback' | 'round-robin' | 'weighted'

export type HealthStatus = { healthy: true } | { healthy: false; error?: unknown }

export const selectProviders = (
  mode: StrategyMode,
  providers: ProviderName[],
  weights?: Record<string, number>,
  healthStatus?: Map<ProviderName, HealthStatus>,
): ProviderName[] => {
  const healthyProviders = providers.filter(p => !healthStatus || healthStatus.get(p)?.healthy !== false)

  switch (mode) {
    case 'primary-fallback':
      return healthyProviders
    case 'round-robin':
      return shuffle(healthyProviders)
    case 'weighted':
      return selectWeighted(healthyProviders, weights || {})
    default:
      return healthyProviders
  }
}

export const selectWeighted = (
  providers: ProviderName[],
  weights: Record<string, number>,
): ProviderName[] => {
  const weighted = providers.flatMap(p => Array(weights[p] || 1).fill(p))
  return shuffle(weighted)
}

export const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}


