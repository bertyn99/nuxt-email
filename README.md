<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: My Module
- Package name: my-module
- Description: My new Nuxt module
-->

# Nuxt Email

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A powerful, functional email module for Nuxt 3 with Vue-based templates, multiple provider support, and comprehensive DevTools integration.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/my-module?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

<!-- Highlight some of the features your module provide here -->
- 🎨 &nbsp;Vue-based email templates with `@vue-email/compiler`
- 📧 &nbsp;Multiple provider support (Resend, SendGrid, Mailgun, Brevo, SMTP, Mailtrap)
- 🛠 &nbsp;DevTools integration with mail catcher and preview
- 🔧 &nbsp;Functional programming architecture with pure functions
- 🎯 &nbsp;Type-safe templates with Zod schema validation
- ⚡ &nbsp;Configurable template directory and layouts
- 🔒 &nbsp;Security features (domain allowlists, header sanitization)
- 📊 &nbsp;Comprehensive observability and error handling

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxi module add @yggdraz/nuxt-email
```

That's it! You can now use Nuxt Email in your Nuxt app ✨

## Environment Variables

The module supports extensive configuration via environment variables. Copy `env.example` to `.env` and configure your email providers:

```bash
# Required
EMAIL_FROM=noreply@yourdomain.com
NODE_ENV=development

# Optional provider API keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAILGUN_DOMAIN=mg.yourdomain.com
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAILTRAP_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAILTRAP_INBOX_ID=123456

# SMTP (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Optional configuration
EMAIL_REPLY_TO=reply@yourdomain.com
PUBLIC_SITE_URL=https://yourdomain.com
MAX_ATTACHMENT_SIZE=10485760
MAX_RECIPIENTS=50
EMAIL_CLIENT_ENABLED=false
EMAIL_DEBUG=false
```

See `env.example` for a complete list of all available environment variables.

## Usage

### 1. Configure the module in `nuxt.config`:

```ts
export default defineNuxtConfig({
  modules: ['@yggdraz/nuxt-email'],
  email: {
    defaults: { from: 'no-reply@example.com' },
    security: { allowlistDomains: ['example.com'] },
    providers: {
      devCatcher: { enabled: process.env.NODE_ENV !== 'production' },
      // smtp: { host: 'smtp.example.com', port: 587, secure: false },
      // resend: { apiKey: process.env.RESEND_API_KEY },
      // sendgrid: { apiKey: process.env.SENDGRID_API_KEY },
      // mailgun: { apiKey: process.env.MAILGUN_API_KEY, domain: 'mg.example.com' },
      // brevo: { apiKey: process.env.BREVO_API_KEY },
      // mailtrap: { apiKey: process.env.MAILTRAP_API_KEY, inboxId: process.env.MAILTRAP_INBOX_ID },
    },
    templates: {
      dir: 'emails', // default: 'emails' - can be changed to 'components/emails' or any custom path
      layoutDir: 'emails/layouts', // default: 'emails/layouts'
      cache: true, // enable template caching in production
    },
    strategy: {
      mode: 'primary-fallback', // 'failover' | 'round-robin' | 'weighted'
      weights: { resend: 3, sendgrid: 2, mailgun: 2, brevo: 1 },
      circuitBreaker: { failureThreshold: 5, cooldownMs: 60_000 },
      retries: { maxAttempts: 3, backoffMs: 1_000, jitter: true },
    },
  },
})
```

### 2. Send an email from server code:

```ts
const email = useEmail()
await email.send({ to: 'user@example.com', subject: 'Hello', html: '<p>Hi</p>' })
```

### 3. Use Vue-based templates:

Create email templates in your `emails/` directory:

```vue
<!-- emails/Welcome.vue -->
<template>
  <div>
    <h1>Welcome, {{ userName }}!</h1>
    <p>Thanks for signing up.</p>
    <a :href="verifyUrl">Verify your email</a>
  </div>
</template>

<script setup lang="ts">
defineEmailTemplate({
  component: defineComponent({
    props: ['userName', 'verifyUrl']
  }),
  schema: z.object({
    userName: z.string(),
    verifyUrl: z.string().url()
  }),
  subject: (data) => `Welcome, ${data.userName}!`,
  previewData: {
    userName: 'John Doe',
    verifyUrl: 'https://example.com/verify?token=123'
  }
})
</script>
```

Then send using the template:

```ts
const email = useEmail()
await email.send({ 
  template: 'Welcome', 
  to: 'user@example.com', 
  data: { userName: 'John', verifyUrl: 'https://example.com/verify?token=123' }
})
```

### 4. Optional: client-side sending via the bridge endpoint (disabled by default in production):

```ts
const email = useEmail()
await email.send({ to: 'user@example.com', subject: 'Hello', html: '<p>Hi</p>' })
```

Policies (non-prod allowlist and recipient limits) are enforced on the server via module configuration.

## Development & Testing

### Playground Setup

For local development and testing:

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Setup environment variables**
   ```bash
   # Copy example files
   cp env.example .env
   cp playground/.env.example playground/.env
   
   # Edit playground/.env with your test values
   ```

3. **Start development**
   ```bash
   pnpm run dev:prepare
   pnpm run dev
   ```

4. **Test the module**
   - Open http://localhost:3000
   - Use the playground UI to send test emails
   - Check the DevTools tab for email management

### Available Scripts

```bash
# Development
pnpm run dev:prepare    # Generate type stubs and prepare playground
pnpm run dev           # Start development server with playground
pnpm run dev:build     # Build the playground

# Testing
pnpm run test          # Run Vitest tests
pnpm run test:watch    # Run tests in watch mode
pnpm run test:types    # Type checking

# Linting
pnpm run lint          # Run ESLint

# Release
pnpm run release       # Build, test, and publish
```

## Built-in Templates

The module includes several built-in templates that cannot be overridden:

- **Signup**: Welcome email with verification link
- **PasswordChanged**: Password change notification
- **VerifyEmail**: Email verification template
- **ResetPassword**: Password reset template

Users must create templates with unique names to avoid conflicts with built-ins.

## Template Directory Configuration

You can customize where your email templates are stored:

```ts
// Default: templates in emails/ directory
export default defineNuxtConfig({
  email: {
    templates: { dir: 'emails' }, // default
  }
})

// Alternative: templates in components/emails/ directory
export default defineNuxtConfig({
  email: {
    templates: { dir: 'components/emails' },
  },
  components: {
    // Exclude email templates from auto-registration to prevent client bundling
    dirs: [{ path: '~/components' }],
  }
})
```

## Security Features

- **Domain allowlists**: Prevents accidental sends to real users in non-production
- **Header sanitization**: Protects against header injection attacks
- **Attachment limits**: Configurable maximum attachment size (default: 10MB)
- **Recipient limits**: Maximum recipients per email (default: 50)
- **Tracking pixel removal**: Automatically strips tracking in development

## Observability

The module provides comprehensive logging and metrics:

- Structured logs using `consola` around hook lifecycle and provider selection
- Console metrics for emails sent, failed, duration, and retry counts
- Hook timeouts and warnings
- Error taxonomy with specific error classes

## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  pnpm install
  
  # Generate type stubs
  pnpm run dev:prepare
  
  # Develop with the playground
  pnpm run dev
  
  # Build the playground
  pnpm run dev:build
  
  # Run ESLint
  pnpm run lint
  
  # Run Vitest
  pnpm run test
  pnpm run test:watch
  
  # Release new version
  pnpm run release
  ```

</details>


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@yggdraz/nuxt-email/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/@yggdraz/nuxt-email

[npm-downloads-src]: https://img.shields.io/npm/dm/@yggdraz/nuxt-email.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/@yggdraz/nuxt-email

[license-src]: https://img.shields.io/npm/l/@yggdraz/nuxt-email.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/@yggdraz/nuxt-email

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
