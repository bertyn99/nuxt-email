import { describe, it, expect, vi } from 'vitest'

import { createTemplateRegistry } from '../src/runtime/server/utils/template-registry'

describe('TemplateRegistry', () => {
  it('registers and gets templates immutably', () => {
    const reg = createTemplateRegistry()
    const tpl = { component: {}, subject: () => 's' } as any
    const reg2 = reg.registerTemplate('Welcome', tpl)
    expect(reg.getTemplate('Welcome')).toBeUndefined()
    expect(reg2.getTemplate('Welcome')).toBe(tpl)
  })

  it('validates with schema when present and renders html/text/subject', async () => {
    const reg = createTemplateRegistry({
      renderVueEmail: vi.fn(async (_c, data: any) => `<p>${data.msg}</p>`),
      htmlToText: vi.fn((html: string) => html.replace(/<[^>]+>/g, '')),
    } as any)

    const schema = { parse: vi.fn((d: any) => d) }
    const tpl = { component: {}, subject: (d: any) => `Hello ${d.msg}`, schema } as any
    const reg2 = reg.registerTemplate('Hello', tpl)

    const result = await reg2.renderTemplate('Hello', { msg: 'World' })
    expect(schema.parse).toHaveBeenCalled()
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.html).toContain('World')
      expect(result.data.text).toContain('World')
      expect(result.data.subject).toBe('Hello World')
    }
  })

  it('errors when template missing', async () => {
    const reg = createTemplateRegistry() as any
    const result = await reg.renderTemplate('Missing', {})
    expect(result.success).toBe(false)
  })
})
