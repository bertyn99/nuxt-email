import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('email bridge endpoint', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/bridge', import.meta.url)),
  })

  it('accepts POST and returns result object', async () => {
    const result = await $fetch('/_email/bridge/send', {
      method: 'POST',
      body: {
        to: 'b@example.com',
        subject: 'Hello',
        html: '<p>Hi</p>',
        text: 'Hi',
      },
    })

    expect(result).toBeTruthy()
    expect(result.success).toBeDefined()
  })
})


