import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const mailboxDir = join(process.cwd(), '.mailbox')
  const filePath = join(mailboxDir, `${id}.json`)

  try {
    const content = await readFile(filePath, 'utf-8')
    const email = JSON.parse(content)

    // Get the email client from the request context
    const emailClient = (event as any).context.$email

    if (!emailClient) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Email client not available',
      })
    }

    // Prepare the message for resending
    const message = {
      to: body.to || email.to,
      from: body.from || email.from,
      subject: body.subject || email.subject,
      html: email.html,
      text: email.text,
      headers: email.headers,
      template: email.template,
      data: email.data,
    }

    // Send the email
    const result = await emailClient.send(message)

    return {
      ok: result.success,
      result: result.success ? result.data : result.error,
    }
  }
  catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Email not found',
      })
    }

    throw error
  }
})
