import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('bridge policy e2e (allowlist)', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/bridge', import.meta.url)),
  })

  it('rejects non-allowlisted domain', async () => {
    const result = await $fetch('/_email/bridge/send', {
      method: 'POST',
      body: { to: 'user@blocked.com', subject: 'x' },
    })
    expect(result.success).toBe(false)
  })
})
