import { defineEventHandler, getQuery } from 'h3'
import { readFile, readdir } from 'fs/promises'
import { join } from 'path'

interface EmailMessage {
  id: string
  date: string
  to: string | string[]
  from: string
  subject: string
  provider: string
  template?: string
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const mailboxDir = join(process.cwd(), '.mailbox')
  
  try {
    // Read all email files from .mailbox directory
    const files = await readdir(mailboxDir)
    const emailFiles = files.filter(file => file.endsWith('.json'))
    
    const messages: EmailMessage[] = []
    
    for (const file of emailFiles) {
      try {
        const content = await readFile(join(mailboxDir, file), 'utf-8')
        const email = JSON.parse(content)
        
        // Add file-based ID
        email.id = file.replace('.json', '')
        
        messages.push(email)
      } catch (error) {
        console.error(`Error reading email file ${file}:`, error)
      }
    }
    
    // Sort by date (newest first)
    messages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    // Apply filters
    let filtered = messages
    
    if (query.query) {
      const searchTerm = String(query.query).toLowerCase()
      filtered = filtered.filter(msg => 
        msg.subject.toLowerCase().includes(searchTerm) ||
        String(msg.to).toLowerCase().includes(searchTerm) ||
        msg.from.toLowerCase().includes(searchTerm)
      )
    }
    
    if (query.template) {
      filtered = filtered.filter(msg => msg.template === query.template)
    }
    
    if (query.to) {
      filtered = filtered.filter(msg => 
        Array.isArray(msg.to) 
          ? msg.to.some(t => t.includes(String(query.to)))
          : msg.to.includes(String(query.to))
      )
    }
    
    if (query.provider) {
      filtered = filtered.filter(msg => msg.provider === query.provider)
    }
    
    if (query.from) {
      const fromDate = new Date(String(query.from))
      filtered = filtered.filter(msg => new Date(msg.date) >= fromDate)
    }
    
    if (query.toDate) {
      const toDate = new Date(String(query.toDate))
      filtered = filtered.filter(msg => new Date(msg.date) <= toDate)
    }
    
    // Apply pagination
    const page = parseInt(String(query.page || '1'))
    const limit = parseInt(String(query.limit || '20'))
    const offset = (page - 1) * limit
    
    const paginated = filtered.slice(offset, offset + limit)
    
    return {
      items: paginated,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit)
    }
    
  } catch (error) {
    // If .mailbox directory doesn't exist, return empty results
    if (error instanceof Error && error.message.includes('ENOENT')) {
      return {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
      }
    }
    
    throw error
  }
})
