import type { Component } from 'vue'
import { z } from 'zod'

// Flexible schema interface for defineEmailTemplate helper
export type SchemaLike = {
  parse?: (data: unknown) => unknown
  safeParse?: (data: unknown) => { success: boolean; data?: unknown; error?: unknown }
}

export type EmailTemplate = {
  component: Component
  schema?: z.ZodSchema | SchemaLike
  subject: (data: unknown) => string
  renderText?: (data: unknown) => string
  previewData?: unknown // sample data for DevTools preview
}

export type RenderResult = {
  html: string
  text: string
  subject: string
}

export type ValidationError = Error & { details?: unknown }

export interface TemplateRegistry {
  templates: Map<string, EmailTemplate>
  registerTemplate: (name: string, template: EmailTemplate) => TemplateRegistry
  getTemplate: (name: string) => EmailTemplate | undefined
  renderTemplate: (name: string, data: unknown) => Promise<Result<RenderResult>>
  validateData: (name: string, data: unknown) => Result<unknown, ValidationError>
  scanTemplates: (dir: string) => Promise<void> // scan user templates from configurable directory
  listTemplates: () => string[]
}

export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }

// defineEmailTemplate helper for authoring templates
export const defineEmailTemplate = <TData = unknown>(config: {
  component: Component
  schema?: z.ZodSchema | SchemaLike
  subject: (data: TData) => string
  renderText?: (data: TData) => string
  previewData?: TData // sample data for DevTools
}): EmailTemplate => {
  return {
    component: config.component,
    schema: config.schema,
    subject: config.subject,
    renderText: config.renderText,
    previewData: config.previewData,
  }
}

// Simple HTML to text conversion for fallback
const htmlToText = (html: string): string => {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
}

// Simple Vue email renderer (placeholder - will be replaced with @vue-email/compiler)
const renderVueEmail = async (component: Component, data: unknown): Promise<string> => {
  // TODO: Implement with @vue-email/compiler
  // For now, return a simple HTML structure
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Template</title>
    </head>
    <body>
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>Email Template</h1>
        <p>This is a placeholder for the Vue email template.</p>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </div>
    </body>
    </html>
  `
}

export const createTemplateRegistry = (): TemplateRegistry => {
  const templates = new Map<string, EmailTemplate>()
  
  return {
    templates,
    registerTemplate: (name, template) => {
      const newTemplates = new Map(templates)
      newTemplates.set(name, template)
      return { ...this, templates: newTemplates }
    },
    getTemplate: (name) => templates.get(name),
    listTemplates: () => Array.from(templates.keys()),
    renderTemplate: async (name, data) => {
      const template = templates.get(name)
      if (!template) {
        return { success: false, error: new Error(`Template ${name} not found`) }
      }
      
      try {
        // Validate data against schema (if present)
        const validation = validateData(name, data)
        if (!validation.success) {
          return { success: false, error: validation.error }
        }
        
        // Render HTML using Vue email renderer
        const html = await renderVueEmail(template.component, data)
        
        // Generate text
        const text = template.renderText?.(data) || htmlToText(html)
        
        // Generate subject
        const subject = template.subject(data)
        
        return {
          success: true,
          data: {
            html,
            text,
            subject
          }
        }
      } catch (error) {
        return { success: false, error: new Error(`Render failed: ${error instanceof Error ? error.message : String(error)}`) }
      }
    },
    validateData: (name, data) => {
      const template = templates.get(name)
      if (!template?.schema) {
        return { success: true, data }
      }
      
      try {
        // Support both Zod and custom schema-like objects
        if (template.schema.parse) {
          const validated = template.schema.parse(data)
          return { success: true, data: validated }
        } else if (template.schema.safeParse) {
          const result = template.schema.safeParse(data)
          if (result.success) {
            return { success: true, data: result.data }
          } else {
            return { success: false, error: new Error(`Validation failed: ${JSON.stringify(result.error)}`) as ValidationError }
          }
        }
        
        return { success: true, data }
      } catch (error) {
        return { success: false, error: new Error(`Validation failed: ${error instanceof Error ? error.message : String(error)}`) as ValidationError }
      }
    },
    scanTemplates: async (dir) => {
      // TODO: Implement template directory scanning
      // This will scan user templates from configurable directory
      // Built-in templates are immutable and cannot be overridden
      // User templates must use unique names
      console.log(`Scanning templates from directory: ${dir}`)
    }
  }
}

// Helper function to validate data against a template
const validateData = (name: string, data: unknown): Result<unknown, ValidationError> => {
  // This is a placeholder - the actual validation is done in the template registry
  return { success: true, data }
}


