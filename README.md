<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: My Module
- Package name: my-module
- Description: My new Nuxt module
-->

# My Module

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

My new Nuxt module for doing amazing things.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/my-module?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

<!-- Highlight some of the features your module provide here -->
- ⛰ &nbsp;Foo
- 🚠 &nbsp;Bar
- 🌲 &nbsp;Baz

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxi module add my-module
```

That's it! You can now use My Module in your Nuxt app ✨

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

# SMTP (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

See `env.example` for a complete list of all available environment variables.

## Usage (Email)

1) Configure the module in `nuxt.config`:

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
    },
  },
})
```

2) Send an email from server code:

```ts
const email = useEmail()
await email.send({ to: 'user@example.com', subject: 'Hello', html: '<p>Hi</p>' })
```

3) Optional: client-side sending via the bridge endpoint (disabled by default in production):

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
   npm install
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
   npm run dev:prepare
   npm run dev
   ```

4. **Test the module**
   - Open http://localhost:3000
   - Use the playground UI to send test emails
   - Check the DevTools tab for email management

### Available Scripts

```bash
# Development
npm run dev:prepare    # Generate type stubs and prepare playground
npm run dev           # Start development server with playground
npm run dev:build     # Build the playground

# Testing
npm run test          # Run Vitest tests
npm run test:watch    # Run tests in watch mode
npm run test:types    # Type checking

# Linting
npm run lint          # Run ESLint

# Release
npm run release       # Build, test, and publish
```

## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
  
  # Run Vitest
  npm run test
  npm run test:watch
  
  # Release new version
  npm run release
  ```

</details>


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/my-module/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/my-module

[npm-downloads-src]: https://img.shields.io/npm/dm/my-module.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/my-module

[license-src]: https://img.shields.io/npm/l/my-module.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/my-module

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
