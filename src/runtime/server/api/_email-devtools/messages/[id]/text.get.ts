import { defineEventHandler, getRouterParam } from 'h3'
import { readFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const mailboxDir = join(process.cwd(), '.mailbox')
  const filePath = join(mailboxDir, `${id}.json`)
  
  try {
    const content = await readFile(filePath, 'utf-8')
    const email = JSON.parse(content)
    
    // Set content type to plain text
    setHeader(event, 'Content-Type', 'text/plain')
    
    return email.text || 'No text content available'
    
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Email not found'
      })
    }
    
    throw error
  }
})
