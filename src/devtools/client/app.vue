<template>
  <div class="h-full bg-gray-50 dark:bg-gray-900">
    <div class="flex h-full">
      <!-- Sidebar -->
      <div class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 class="text-lg font-semibold text-gray-900 dark:text-white">Email DevTools</h1>
        </div>
        
        <nav class="p-4">
          <ul class="space-y-2">
            <li>
              <NButton 
                @click="activeTab = 'messages'"
                :variant="activeTab === 'messages' ? 'primary' : 'ghost'"
                class="w-full justify-start"
              >
                <Icon name="carbon:email" class="mr-2" />
                Messages
              </NButton>
            </li>
            <li>
              <NButton 
                @click="activeTab = 'templates'"
                :variant="activeTab === 'templates' ? 'primary' : 'ghost'"
                class="w-full justify-start"
              >
                <Icon name="carbon:document" class="mr-2" />
                Templates
              </NButton>
            </li>
            <li>
              <NButton 
                @click="activeTab = 'providers'"
                :variant="activeTab === 'providers' ? 'primary' : 'ghost'"
                class="w-full justify-start"
              >
                <Icon name="carbon:settings" class="mr-2" />
                Providers
              </NButton>
            </li>
            <li>
              <NButton 
                @click="activeTab = 'config'"
                :variant="activeTab === 'config' ? 'primary' : 'ghost'"
                class="w-full justify-start"
              >
                <Icon name="carbon:configuration" class="mr-2" />
                Configuration
              </NButton>
            </li>
          </ul>
        </nav>
      </div>

      <!-- Main Content -->
      <div class="flex-1 overflow-hidden">
        <div class="h-full flex flex-col">
          <!-- Header -->
          <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                {{ activeTab }}
              </h2>
              <div class="flex items-center space-x-2">
                <NButton 
                  @click="refresh"
                  size="sm"
                  variant="primary"
                >
                  <Icon name="carbon:refresh" class="mr-1" />
                  Refresh
                </NButton>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-auto p-6">
            <MessagesTab v-if="activeTab === 'messages'" />
            <TemplatesTab v-else-if="activeTab === 'templates'" />
            <ProvidersTab v-else-if="activeTab === 'providers'" />
            <ConfigTab v-else-if="activeTab === 'config'" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDevtoolsClient } from '@nuxt/devtools-kit/iframe-client'
import MessagesTab from './components/MessagesTab.vue'
import TemplatesTab from './components/TemplatesTab.vue'
import ProvidersTab from './components/ProvidersTab.vue'
import ConfigTab from './components/ConfigTab.vue'

const activeTab = ref('messages')
const devtoolsClient = useDevtoolsClient()

const refresh = () => {
  // Trigger refresh based on active tab
  if (activeTab.value === 'messages') {
    // This would trigger a refresh of messages
    console.log('Refreshing messages...')
  } else if (activeTab.value === 'templates') {
    // This would trigger a refresh of templates
    console.log('Refreshing templates...')
  }
}

onMounted(() => {
  // Initialize connection
  if (devtoolsClient.value) {
    console.log('DevTools client connected')
  }
})
</script>
