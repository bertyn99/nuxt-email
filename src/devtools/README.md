# Nuxt Email DevTools

This directory contains the DevTools integration for the Nuxt Email module, providing a comprehensive interface for monitoring and managing email functionality during development.

## Structure

```
devtools/
├── client/                 # DevTools client application
│   ├── app.vue            # Main application component
│   ├── components/         # Tab components
│   │   ├── MessagesTab.vue
│   │   ├── TemplatesTab.vue
│   │   ├── ProvidersTab.vue
│   │   └── ConfigTab.vue
│   ├── nuxt.config.ts     # Nuxt configuration
│   ├── package.json        # Client dependencies
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   ├── postcss.config.js   # PostCSS configuration
│   └── assets/
│       └── css/
│           └── main.css    # Main stylesheet
└── README.md              # This file
```

## Features

### Messages Tab
- View all sent emails with status tracking
- Search and filter messages by status
- View detailed message content (HTML, text, raw)
- Resend failed messages
- Clear message history
- Real-time statistics (sent, failed, pending, total)

### Templates Tab
- Browse available email templates
- View template metadata (subject, preview, layout)
- Filter templates by layout usage
- Preview template content
- Statistics on template usage

### Providers Tab
- Monitor configured email providers
- View provider configuration details
- Test provider connections
- Provider status indicators
- Configuration validation

### Configuration Tab
- Overview of module configuration
- Detailed provider settings
- Strategy configuration (retries, circuit breaker)
- Security settings
- Raw configuration JSON view

## Development

### Local Development
The DevTools client runs on port 3031 during development and is proxied through the main Nuxt application.

To start the client in development mode:
```bash
cd src/devtools/client
npm install
npm run dev
```

### Production Build
The client is automatically built and served when the module is published. The built files are served using `sirv` middleware.

## Integration

The DevTools integration is automatically enabled in development mode when `devtools.enabled` is not set to `false` in the module configuration.

### RPC Communication
The DevTools uses Remote Procedure Call (RPC) for communication between the server and client:

- **Server Functions**: Implemented in `src/devtools.ts`
- **Client Functions**: Implemented in each tab component
- **Types**: Defined in `src/rpc-types.ts`

### File Watching
The DevTools automatically refreshes when email templates are modified, providing real-time updates during development.

## Styling

The DevTools client uses:
- **Tailwind CSS** for styling
- **Dark mode** support
- **Responsive design** for different screen sizes
- **Custom scrollbars** for better UX

## Dependencies

### Required Dependencies
- `@nuxt/devtools-kit` - DevTools utility functions
- `@nuxt/devtools-ui-kit` - UI components
- `@nuxt/devtools` - DevTools core (dev dependency)

### Client Dependencies
- `tailwindcss` - CSS framework
- `@tailwindcss/forms` - Form styling
- `autoprefixer` - CSS vendor prefixes
- `postcss` - CSS processing

## Configuration

The DevTools client configuration is in `src/devtools/client/nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  devtools: { enabled: false }, // Disable DevTools for the client
  ssr: false, // Client-side only
  app: {
    baseURL: '/__nuxt-email' // Base URL for the iframe
  },
  // ... other configuration
})
```

## Usage

Once the module is installed and configured, the DevTools tab will appear in the Nuxt DevTools interface with the "Email" icon. Click on it to access the comprehensive email management interface.

The DevTools provides a powerful way to:
- Monitor email sending in real-time
- Debug email templates
- Manage provider configurations
- Test email functionality
- View detailed logs and statistics
