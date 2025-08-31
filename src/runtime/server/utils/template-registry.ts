type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E }

export interface EmailTemplate {
  component: unknown
  subject: (data: any) => string
  schema?: { parse: (data: any) => any }
  renderText?: (data: any) => string
}

export interface RenderResult {
  html: string
  text: string
  subject: string
}

export interface TemplateRegistryDeps {
  renderVueEmail: (component: unknown, data: unknown) => Promise<string>
  htmlToText: (html: string) => string
}

export interface TemplateRegistry {
  templates: Map<string, EmailTemplate>
  registerTemplate: (name: string, template: EmailTemplate) => TemplateRegistry
  getTemplate: (name: string) => EmailTemplate | undefined
  renderTemplate: (name: string, data: unknown) => Promise<Result<RenderResult>>
}

export const createTemplateRegistry = (deps?: Partial<TemplateRegistryDeps>): TemplateRegistry => {
  const templates = new Map<string, EmailTemplate>()
  const renderVueEmail = deps?.renderVueEmail || (async () => '')
  const htmlToText = deps?.htmlToText || ((html: string) => html.replace(/<[^>]+>/g, ''))

  const clone = (map: Map<string, EmailTemplate>): TemplateRegistry => ({
    templates: map,
    registerTemplate: (name, template) => {
      const next = new Map(map)
      next.set(name, template)
      return clone(next)
    },
    getTemplate: (name) => map.get(name),
    renderTemplate: async (name, data) => {
      const tpl = map.get(name)
      if (!tpl)
        return { success: false, error: new Error(`Template ${name} not found`) }

      try {
        const validated = tpl.schema ? tpl.schema.parse(data) : data
        const html = await renderVueEmail(tpl.component, validated)
        const text = tpl.renderText ? tpl.renderText(validated) : htmlToText(html)
        return { success: true, data: { html, text, subject: tpl.subject(validated) } }
      } catch (error: any) {
        return { success: false, error }
      }
    },
  })

  return clone(templates)
}


