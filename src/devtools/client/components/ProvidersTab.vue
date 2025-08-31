<template>
  <div class="space-y-6">
    <!-- Provider Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Providers</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ providers.length }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Enabled</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ enabledProviders.length }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Configured</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ configuredProviders.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Providers Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="provider in providers"
        :key="provider.name"
        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <span class="text-lg font-semibold text-gray-600 dark:text-gray-400">
                  {{ provider.name.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="ml-3">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white capitalize">{{ provider.name }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ getProviderDescription(provider.name) }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span
                :class="[
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  provider.enabled 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                ]"
              >
                {{ provider.enabled ? 'Enabled' : 'Disabled' }}
              </span>
            </div>
          </div>
          
          <div class="space-y-2 mb-4">
            <div v-if="provider.config" class="text-xs text-gray-500 dark:text-gray-400">
              <div v-if="provider.config.hasApiKey" class="flex items-center">
                <svg class="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                API Key configured
              </div>
              <div v-if="provider.config.host" class="flex items-center">
                <svg class="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
                </svg>
                Host: {{ provider.config.host }}
              </div>
              <div v-if="provider.config.port" class="flex items-center">
                <svg class="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
                </svg>
                Port: {{ provider.config.port }}
              </div>
              <div v-if="provider.config.domain" class="flex items-center">
                <svg class="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
                </svg>
                Domain: {{ provider.config.domain }}
              </div>
              <div v-if="provider.config.inboxId" class="flex items-center">
                <svg class="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                Inbox ID: {{ provider.config.inboxId }}
              </div>
              <div v-if="provider.config.dir" class="flex items-center">
                <svg class="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                </svg>
                Directory: {{ provider.config.dir }}
              </div>
            </div>
            <div v-else class="text-xs text-gray-500 dark:text-gray-400">
              No configuration
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <button
              @click="testProvider(provider)"
              :disabled="!provider.enabled"
              :class="[
                'px-3 py-1 text-sm rounded-md transition-colors',
                provider.enabled
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed'
              ]"
            >
              Test Connection
            </button>
            <button
              @click="viewProviderDetails(provider)"
              class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Provider Details Modal -->
    <div v-if="selectedProvider" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ selectedProvider.name }} Provider</h3>
            <button
              @click="selectedProvider = null"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
              <span
                :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  selectedProvider.enabled 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                ]"
              >
                {{ selectedProvider.enabled ? 'Enabled' : 'Disabled' }}
              </span>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description:</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ getProviderDescription(selectedProvider.name) }}</p>
            </div>
            
            <div v-if="selectedProvider.config">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Configuration:</label>
              <div class="mt-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                <pre class="text-xs text-gray-900 dark:text-white">{{ JSON.stringify(selectedProvider.config, null, 2) }}</pre>
              </div>
            </div>
            
            <div v-else>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Configuration:</label>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">No configuration available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDevtoolsClient } from '@nuxt/devtools-kit/iframe-client'
import type { EmailProvider } from '../../../rpc-types'

const devtoolsClient = useDevtoolsClient()
const providers = ref<EmailProvider[]>([])
const selectedProvider = ref<EmailProvider | null>(null)

const enabledProviders = computed(() => {
  return providers.value.filter(p => p.enabled)
})

const configuredProviders = computed(() => {
  return providers.value.filter(p => p.config && Object.keys(p.config).length > 0)
})

const getProviderDescription = (name: string) => {
  const descriptions: Record<string, string> = {
    resend: 'Modern email API for developers',
    sendgrid: 'Email delivery service by Twilio',
    mailgun: 'Email service for developers',
    brevo: 'Customer experience platform',
    smtp: 'Simple Mail Transfer Protocol',
    mailtrap: 'Email testing service',
    devCatcher: 'Development email catcher'
  }
  return descriptions[name] || 'Email provider'
}

const loadProviders = async () => {
  if (devtoolsClient.value) {
    try {
      const rpc = devtoolsClient.value.devtools.extendClientRpc('nuxt-email', {})
      providers.value = await rpc.getProviders()
    } catch (error) {
      console.error('Failed to load providers:', error)
    }
  }
}

const testProvider = async (provider: EmailProvider) => {
  if (!provider.enabled) return
  
  console.log(`Testing ${provider.name} provider...`)
  // This would need to be implemented on the server side
  // For now, we'll just log the action
}

const viewProviderDetails = (provider: EmailProvider) => {
  selectedProvider.value = provider
}

onMounted(() => {
  loadProviders()
})
</script>
