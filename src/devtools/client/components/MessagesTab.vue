<template>
  <div class="space-y-6">
    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <NCard>
        <div class="flex items-center">
          <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <Icon name="carbon:checkmark" class="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Sent</p>
            <p class="text-2xl font-semibold">{{ stats.sent }}</p>
          </div>
        </div>
      </NCard>
      
      <NCard>
        <div class="flex items-center">
          <div class="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
            <Icon name="carbon:close" class="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Failed</p>
            <p class="text-2xl font-semibold">{{ stats.failed }}</p>
          </div>
        </div>
      </NCard>
      
      <NCard>
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <Icon name="carbon:time" class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
            <p class="text-2xl font-semibold">{{ stats.pending }}</p>
          </div>
        </div>
      </NCard>
      
      <NCard>
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Icon name="carbon:email" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total</p>
            <p class="text-2xl font-semibold">{{ stats.total }}</p>
          </div>
        </div>
      </NCard>
    </div>

    <!-- Actions -->
    <div class="flex justify-between items-center">
      <div class="flex items-center space-x-4">
        <NInput
          v-model="searchQuery"
          placeholder="Search messages..."
          class="w-64"
        />
        <NSelect
          v-model="statusFilter"
          :options="[
            { label: 'All Status', value: '' },
            { label: 'Sent', value: 'sent' },
            { label: 'Failed', value: 'failed' },
            { label: 'Pending', value: 'pending' }
          ]"
        />
      </div>
      
      <div class="flex items-center space-x-2">
        <NButton
          @click="clearMessages"
          variant="danger"
          size="sm"
        >
          <Icon name="carbon:trash-can" class="mr-1" />
          Clear All
        </NButton>
      </div>
    </div>

    <!-- Messages Table -->
    <NCard>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                To
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Subject
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Provider
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="message in filteredMessages" :key="message.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                {{ Array.isArray(message.to) ? message.to.join(', ') : message.to }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                {{ message.subject }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                {{ message.provider }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <NTag
                  :variant="message.status === 'sent' ? 'success' : message.status === 'failed' ? 'danger' : 'warning'"
                  size="sm"
                >
                  {{ message.status }}
                </NTag>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(message.timestamp) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <NButton
                    @click="viewMessage(message)"
                    variant="ghost"
                    size="sm"
                  >
                    View
                  </NButton>
                  <NButton
                    v-if="message.status === 'failed'"
                    @click="resendMessage(message.id)"
                    variant="success"
                    size="sm"
                  >
                    Resend
                  </NButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="filteredMessages.length === 0" class="text-center py-12">
        <Icon name="carbon:email" class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium">No messages</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">No messages found matching your criteria.</p>
      </div>
    </NCard>

    <!-- Message Detail Modal -->
    <NModal v-model="selectedMessage" class="w-11/12 md:w-3/4 lg:w-1/2">
      <NCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">Message Details</h3>
            <NButton
              @click="selectedMessage = null"
              variant="ghost"
              size="sm"
            >
              <Icon name="carbon:close" />
            </NButton>
          </div>
        </template>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">To:</label>
            <p class="mt-1 text-sm">
              {{ Array.isArray(selectedMessage?.to) ? selectedMessage?.to.join(', ') : selectedMessage?.to }}
            </p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">From:</label>
            <p class="mt-1 text-sm">{{ selectedMessage?.from }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject:</label>
            <p class="mt-1 text-sm">{{ selectedMessage?.subject }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Provider:</label>
            <p class="mt-1 text-sm">{{ selectedMessage?.provider }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
            <NTag
              :variant="selectedMessage?.status === 'sent' ? 'success' : selectedMessage?.status === 'failed' ? 'danger' : 'warning'"
              size="sm"
            >
              {{ selectedMessage?.status }}
            </NTag>
          </div>
          
          <div v-if="selectedMessage?.error">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Error:</label>
            <p class="mt-1 text-sm text-red-600 dark:text-red-400">{{ selectedMessage.error }}</p>
          </div>
          
          <div v-if="selectedMessage?.html">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">HTML Content:</label>
            <div class="mt-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-md max-h-64 overflow-auto">
              <pre class="text-xs">{{ selectedMessage.html }}</pre>
            </div>
          </div>
          
          <div v-if="selectedMessage?.text">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Text Content:</label>
            <div class="mt-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-md max-h-64 overflow-auto">
              <pre class="text-xs">{{ selectedMessage.text }}</pre>
            </div>
          </div>
        </div>
      </NCard>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDevtoolsClient } from '@nuxt/devtools-kit/iframe-client'
import type { EmailMessage } from '../../../rpc-types'

const devtoolsClient = useDevtoolsClient()
const messages = ref<EmailMessage[]>([])
const selectedMessage = ref<EmailMessage | null>(null)
const searchQuery = ref('')
const statusFilter = ref('')

const stats = computed(() => {
  const sent = messages.value.filter(m => m.status === 'sent').length
  const failed = messages.value.filter(m => m.status === 'failed').length
  const pending = messages.value.filter(m => m.status === 'pending').length
  return {
    sent,
    failed,
    pending,
    total: messages.value.length
  }
})

const filteredMessages = computed(() => {
  let filtered = messages.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(m => 
      m.subject.toLowerCase().includes(query) ||
      (Array.isArray(m.to) ? m.to.some(t => t.toLowerCase().includes(query)) : m.to.toLowerCase().includes(query)) ||
      m.from.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(m => m.status === statusFilter.value)
  }

  return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
})

const loadMessages = async () => {
  if (devtoolsClient.value) {
    try {
      const rpc = devtoolsClient.value.devtools.extendClientRpc('nuxt-email', {
        refreshMessages() {
          loadMessages()
        },
        updateMessageStatus(id: string, status: EmailMessage['status'], error?: string) {
          const message = messages.value.find(m => m.id === id)
          if (message) {
            message.status = status
            if (error) message.error = error
          }
        }
      })

      messages.value = await rpc.getMessages()
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }
}

const viewMessage = (message: EmailMessage) => {
  selectedMessage.value = message
}

const resendMessage = async (id: string) => {
  if (devtoolsClient.value) {
    try {
      const rpc = devtoolsClient.value.devtools.extendClientRpc('nuxt-email', {})
      const result = await rpc.resendMessage(id)
      
      if (result.success) {
        // Update the message status
        const message = messages.value.find(m => m.id === id)
        if (message) {
          message.status = 'pending'
        }
      } else {
        console.error('Failed to resend message:', result.error)
      }
    } catch (error) {
      console.error('Failed to resend message:', error)
    }
  }
}

const clearMessages = async () => {
  if (devtoolsClient.value) {
    try {
      const rpc = devtoolsClient.value.devtools.extendClientRpc('nuxt-email', {})
      await rpc.clearMessages()
      messages.value = []
    } catch (error) {
      console.error('Failed to clear messages:', error)
    }
  }
}

const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleString()
}

onMounted(() => {
  loadMessages()
})
</script>
