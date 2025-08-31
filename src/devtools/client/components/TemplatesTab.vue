<template>
  <div class="space-y-6">
    <!-- Template Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Templates</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ templates.length }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">With Layout</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ templatesWithLayout.length }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Custom Templates</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ customTemplates.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="flex items-center space-x-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search templates..."
        class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        v-model="layoutFilter"
        class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Layouts</option>
        <option value="with-layout">With Layout</option>
        <option value="without-layout">Without Layout</option>
      </select>
    </div>

    <!-- Templates Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="template in filteredTemplates"
        :key="template.name"
        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ template.name }}</h3>
            <span
              v-if="template.layout"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              Layout
            </span>
          </div>
          
          <p v-if="template.subject" class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            <strong>Subject:</strong> {{ template.subject }}
          </p>
          
          <p v-if="template.preview" class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {{ template.preview }}
          </p>
          
          <div class="text-xs text-gray-500 dark:text-gray-400 mb-4">
            <p><strong>Path:</strong> {{ template.path }}</p>
            <p v-if="template.layout"><strong>Layout:</strong> {{ template.layout }}</p>
          </div>
          
          <div class="flex items-center justify-between">
            <button
              @click="viewTemplate(template)"
              class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              View Template
            </button>
            <button
              @click="previewTemplate(template)"
              class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium"
            >
              Preview
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredTemplates.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No templates</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">No templates found matching your criteria.</p>
    </div>

    <!-- Template Detail Modal -->
    <div v-if="selectedTemplate" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Template: {{ selectedTemplate.name }}</h3>
            <button
              @click="selectedTemplate = null"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject:</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedTemplate.subject || 'No subject' }}</p>
            </div>
            
            <div v-if="selectedTemplate.preview">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Preview:</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedTemplate.preview }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Path:</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedTemplate.path }}</p>
            </div>
            
            <div v-if="selectedTemplate.layout">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Layout:</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedTemplate.layout }}</p>
            </div>
            
            <div v-if="templateContent">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Content:</label>
              <div class="mt-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-md max-h-64 overflow-auto">
                <pre class="text-xs text-gray-900 dark:text-white">{{ templateContent }}</pre>
              </div>
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
import type { EmailTemplate } from '../../../rpc-types'

const devtoolsClient = useDevtoolsClient()
const templates = ref<EmailTemplate[]>([])
const selectedTemplate = ref<EmailTemplate | null>(null)
const templateContent = ref('')
const searchQuery = ref('')
const layoutFilter = ref('')

const templatesWithLayout = computed(() => {
  return templates.value.filter(t => t.layout)
})

const customTemplates = computed(() => {
  return templates.value.filter(t => !t.path.includes('node_modules'))
})

const filteredTemplates = computed(() => {
  let filtered = templates.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(t => 
      t.name.toLowerCase().includes(query) ||
      (t.subject && t.subject.toLowerCase().includes(query)) ||
      (t.preview && t.preview.toLowerCase().includes(query))
    )
  }

  if (layoutFilter.value === 'with-layout') {
    filtered = filtered.filter(t => t.layout)
  } else if (layoutFilter.value === 'without-layout') {
    filtered = filtered.filter(t => !t.layout)
  }

  return filtered.sort((a, b) => a.name.localeCompare(b.name))
})

const loadTemplates = async () => {
  if (devtoolsClient.value) {
    try {
      const rpc = devtoolsClient.value.devtools.extendClientRpc('nuxt-email', {
        refreshTemplates() {
          loadTemplates()
        }
      })

      templates.value = await rpc.getTemplates()
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }
}

const viewTemplate = async (template: EmailTemplate) => {
  selectedTemplate.value = template
  
  // Load template content if available
  try {
    // This would need to be implemented on the server side
    // For now, we'll just show the template info
    templateContent.value = 'Template content would be loaded here...'
  } catch (error) {
    console.error('Failed to load template content:', error)
    templateContent.value = 'Failed to load template content'
  }
}

const previewTemplate = (template: EmailTemplate) => {
  // This would open a preview of the template
  console.log('Preview template:', template.name)
  // Could open in a new window or modal with rendered template
}

onMounted(() => {
  loadTemplates()
})
</script>
