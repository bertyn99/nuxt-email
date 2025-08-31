import { useNuxtApp, useRequestHeaders } from '#app'

export const useEmail = () => {
  const nuxtApp = useNuxtApp()
  // On server, we can call directly
  if (import.meta.server) {
    return nuxtApp.$email as { send: (body: any) => Promise<any> }
  }
  // On client, proxy to bridge endpoint
  return {
    send: async (body: any) => {
      const headers = useRequestHeaders(['cookie'])
      const res = await fetch('/_email/bridge/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(headers as any) },
        body: JSON.stringify(body),
      })
      return await res.json()
    },
  }
}
