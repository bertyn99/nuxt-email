import { useNuxtApp, useRequestHeaders, useRequestEvent } from '#app'

export const useEmail = () => {
  const nuxtApp = useNuxtApp()
  // On server, call the per-request email client attached by the Nitro plugin
  if (import.meta.server) {
    const event = useRequestEvent() as any
    const email = event?.context?.$email || (nuxtApp as any).$email
    return email as { send: (body: any) => Promise<any> }
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
