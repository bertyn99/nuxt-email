export default defineNuxtPlugin(() => {
  if (process.dev) {
    const devtools = useDevtools()
    
    devtools?.addCustomTab({
      name: 'email',
      title: 'Email',
      icon: 'i-carbon-email',
      view: {
        type: 'iframe',
        src: '/_email/devtools/ui'
      }
    })
  }
})
