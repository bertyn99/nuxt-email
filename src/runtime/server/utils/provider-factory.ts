import type { ProviderRegistry } from './provider-registry'
import { createDevCatcherProvider } from '../providers/dev-catcher'
import { createSmtpProvider } from '../providers/smtp'
import { createResendProvider } from '../providers/resend'
import { createSendGridProvider } from '../providers/sendgrid'
import { createMailgunProvider } from '../providers/mailgun'
import { createBrevoProvider } from '../providers/brevo'

export const buildProvidersFromConfig = (registry: ProviderRegistry, providersConfig: any) => {
  let r = registry
  if (providersConfig?.devCatcher?.enabled) {
    r = r.addProvider('devCatcher', createDevCatcherProvider({ enabled: true }))
  }
  if (providersConfig?.smtp) {
    r = r.addProvider('smtp', createSmtpProvider({ transportOptions: providersConfig.smtp }))
  }
  if (providersConfig?.resend?.apiKey) {
    r = r.addProvider('resend', createResendProvider({ apiKey: providersConfig.resend.apiKey }))
  }
  if (providersConfig?.sendgrid?.apiKey) {
    r = r.addProvider('sendgrid', createSendGridProvider({ apiKey: providersConfig.sendgrid.apiKey }))
  }
  if (providersConfig?.mailgun?.apiKey && providersConfig?.mailgun?.domain) {
    r = r.addProvider('mailgun', createMailgunProvider({ apiKey: providersConfig.mailgun.apiKey, domain: providersConfig.mailgun.domain }))
  }
  if (providersConfig?.brevo?.apiKey) {
    r = r.addProvider('brevo', createBrevoProvider({ apiKey: providersConfig.brevo.apiKey }))
  }
  return r
}
