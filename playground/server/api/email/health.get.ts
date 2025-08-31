export default defineEventHandler(async (event) => {
  const email = (event as any).context.$email
  return await email.health()
})
