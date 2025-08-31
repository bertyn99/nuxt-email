export default defineEventHandler(async (event) => {
  const email = (event as any).context.$email
  const body = await readBody<{ to?: string, subject?: string, html?: string, template?: string, data?: unknown }>(event)

  const result = await email.send({
    to: body?.to ?? 'user@example.com',
    subject: body?.subject ?? 'Hello from playground',
    html: body?.html ?? '<p>Hi! This is a playground test.</p>',
    template: body?.template,
    data: body?.data,
  })

  return result
})
