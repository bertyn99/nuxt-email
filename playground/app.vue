<template>
  <div style="padding: 24px; font-family: sans-serif">
    <h2>Nuxt Email Playground</h2>
    <div style="display:flex; gap:12px; margin: 12px 0">
      <button @click="send">Send test email</button>
      <button @click="health">Check health</button>
    </div>
    <pre v-if="out">{{ out }}</pre>
  </div>
</template>

<script setup lang="ts">
const out = ref('')

const send = async () => {
  const { data, error } = await useFetch('/api/email/send', { method: 'POST' })
  out.value = JSON.stringify(error?.value ?? data?.value, null, 2)
}

const health = async () => {
  const { data, error } = await useFetch('/api/email/health')
  out.value = JSON.stringify(error?.value ?? data?.value, null, 2)
}
</script>
