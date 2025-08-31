<template>
  <div class="space-y-6">
    <!-- Configuration Overview -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuration Overview</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 class="font-medium text-gray-900 dark:text-white mb-2">Default Provider</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400 capitalize">{{ config.defaultProvider || 'Not set' }}</p>
        </div>
        
        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 class="font-medium text-gray-900 dark:text-white mb-2">Strategy Mode</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ config.strategy?.mode || 'Not configured' }}</p>
        </div>
        
        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 class="font-medium text-gray-900 dark:text-white mb-2">Client Enabled</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ config.client?.enabled ? 'Yes' : 'No' }}</p>
        </div>
        
        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 class="font-medium text-gray-900 dark:text-white mb-2">Templates Directory</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ config.templates?.dir || 'emails' }}</p>
        </div>
        
        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 class="font-medium text-gray-900 dark:text-white mb-2">Max Recipients</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ config.limits?.maxRecipients || 'Unlimited' }}</p>
        </div>
        
        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 class="font-medium text-gray-900 dark:text-white mb-2">Max Attachment Size</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ formatBytes(config.limits?.maxAttachmentSize) }}</p>
        </div>
      </div>
    </div>

    <!-- Detailed Configuration -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Providers Configuration -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Providers Configuration</h3>
        
        <div class="space-y-4">
          <div v-for="(providerConfig, providerName) in config.providers" :key="providerName" class="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-medium text-gray-900 dark:text-white capitalize">{{ providerName }}</h4>
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Configured
              </span>
            </div>
            
            <div class="text-sm text-gray-600 dark:text-gray-400">
              <div v-if="providerConfig.apiKey" class="flex items-center mb-1">
                <svg class="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                API Key: {{ maskApiKey(providerConfig.apiKey) }}
              </div>
              <div v-if="providerConfig.domain" class="flex items-center mb-1">
                <svg class="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
                </svg>
                Domain: {{ providerConfig.domain }}
              </div>
              <div v-if="providerConfig.host" class="flex items-center mb-1">
                <svg class="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
                </svg>
                Host: {{ providerConfig.host }}
              </div>
              <div v-if="providerConfig.port" class="flex items-center mb-1">
                <svg class="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
                </svg>
                Port: {{ providerConfig.port }}
              </div>
              <div v-if="providerConfig.inboxId" class="flex items-center mb-1">
                <svg class="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                Inbox ID: {{ providerConfig.inboxId }}
              </div>
              <div v-if="providerConfig.enabled !== undefined" class="flex items-center mb-1">
                <svg class="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Enabled: {{ providerConfig.enabled ? 'Yes' : 'No' }}
              </div>
            </div>
          </div>
          
          <div v-if="!config.providers || Object.keys(config.providers).length === 0" class="text-center py-4 text-gray-500 dark:text-gray-400">
            No providers configured
          </div>
        </div>
      </div>

      <!-- Strategy Configuration -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Strategy Configuration</h3>
        
        <div class="space-y-4">
          <div class="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">Mode</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ config.strategy?.mode || 'Not configured' }}</p>
          </div>
          
          <div v-if="config.strategy?.retries" class="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">Retry Configuration</h4>
            <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>Max Attempts: {{ config.strategy.retries.maxAttempts }}</p>
              <p>Backoff: {{ config.strategy.retries.backoffMs }}ms</p>
              <p>Jitter: {{ config.strategy.retries.jitter ? 'Enabled' : 'Disabled' }}</p>
            </div>
          </div>
          
          <div v-if="config.strategy?.circuitBreaker" class="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">Circuit Breaker</h4>
            <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>Failure Threshold: {{ config.strategy.circuitBreaker.failureThreshold }}</p>
              <p>Cooldown: {{ config.strategy.circuitBreaker.cooldownMs }}ms</p>
            </div>
          </div>
          
          <div v-if="config.strategy?.weights" class="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">Weights</h4>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              <div v-for="(weight, provider) in config.strategy.weights" :key="provider" class="flex justify-between">
                <span class="capitalize">{{ provider }}:</span>
                <span>{{ weight }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Security Configuration -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Configuration</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="font-medium text-gray-900 dark:text-white mb-2">Domain Restrictions</h4>
          <div class="space-y-2">
            <div v-if="config.security?.allowlistDomains">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Allowed Domains:</p>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                <span v-for="domain in config.security.allowlistDomains" :key="domain" class="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded mr-2 mb-1">
                  {{ domain }}
                </span>
              </div>
            </div>
            
            <div v-if="config.security?.blocklistDomains">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Blocked Domains:</p>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                <span v-for="domain in config.security.blocklistDomains" :key="domain" class="inline-block bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded mr-2 mb-1">
                  {{ domain }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 class="font-medium text-gray-900 dark:text-white mb-2">Security Options</h4>
          <div class="space-y-2">
            <div class="flex items-center">
              <svg v-if="config.security?.sanitizeHeaders" class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <svg v-else class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <span class="text-sm text-gray-600 dark:text-gray-400">Sanitize Headers</span>
            </div>
            
            <div class="flex items-center">
              <svg v-if="config.security?.stripTrackingInDev" class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <svg v-else class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <span class="text-sm text-gray-600 dark:text-gray-400">Strip Tracking in Dev</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Raw Configuration JSON -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Raw Configuration</h3>
      <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 overflow-auto">
        <pre class="text-xs text-gray-900 dark:text-white">{{ JSON.stringify(config, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDevtoolsClient } from '@nuxt/devtools-kit/iframe-client'
import type { ModuleOptions } from '../../../rpc-types'

const devtoolsClient = useDevtoolsClient()
const config = ref<ModuleOptions>({})

const loadConfig = async () => {
  if (devtoolsClient.value) {
    try {
      const rpc = devtoolsClient.value.devtools.extendClientRpc('nuxt-email', {})
      config.value = await rpc.getConfig()
    } catch (error) {
      console.error('Failed to load configuration:', error)
    }
  }
}

const formatBytes = (bytes?: number) => {
  if (!bytes) return 'Unlimited'
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const maskApiKey = (apiKey: string) => {
  if (!apiKey) return 'Not set'
  if (apiKey.length <= 8) return '*'.repeat(apiKey.length)
  return apiKey.substring(0, 4) + '*'.repeat(apiKey.length - 8) + apiKey.substring(apiKey.length - 4)
}

onMounted(() => {
  loadConfig()
})
</script>
