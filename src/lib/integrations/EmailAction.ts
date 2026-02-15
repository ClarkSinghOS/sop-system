/**
 * EmailAction - Send emails via Resend API
 * 
 * Supports:
 * - HTML body with variable substitution
 * - Template IDs
 * - CC and BCC recipients
 * - Custom from address
 */

import { ActionConfig, VariableContext } from '@/types/integrations';
import { resolveTemplate } from './VariableResolver';

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface ResendResponse {
  id?: string;
  message?: string;
}

export async function sendEmail(
  config: ActionConfig,
  context: VariableContext
): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    return {
      success: false,
      error: 'RESEND_API_KEY not configured',
    };
  }

  // Resolve variables in all fields
  const to = resolveTemplate(config.to || '', context);
  const subject = resolveTemplate(config.subject || '', context);
  const body = resolveTemplate(config.body || '', context);
  const cc = config.cc?.map(email => resolveTemplate(email, context));
  const bcc = config.bcc?.map(email => resolveTemplate(email, context));

  if (!to) {
    return {
      success: false,
      error: 'Email recipient (to) is required',
    };
  }

  if (!subject) {
    return {
      success: false,
      error: 'Email subject is required',
    };
  }

  try {
    const payload: Record<string, unknown> = {
      from: process.env.RESEND_FROM_EMAIL || 'ProcessCore <noreply@example.com>',
      to: to.split(',').map(e => e.trim()),
      subject,
      html: body,
    };

    if (cc && cc.length > 0) {
      payload.cc = cc;
    }

    if (bcc && bcc.length > 0) {
      payload.bcc = bcc;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data: ResendResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      messageId: data.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Build a simple HTML email template
 */
export function buildEmailTemplate(options: {
  title: string;
  heading: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  footerText?: string;
}): string {
  const { title, heading, body, ctaText, ctaUrl, footerText } = options;

  const ctaButton = ctaText && ctaUrl
    ? `
      <tr>
        <td style="padding: 20px 0;">
          <a href="${ctaUrl}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
          ">${ctaText}</a>
        </td>
      </tr>
    `
    : '';

  const footer = footerText
    ? `
      <tr>
        <td style="padding: 20px 0; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          ${footerText}
        </td>
      </tr>
    `
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #111827;">${heading}</h1>
              <div style="color: #374151; font-size: 16px; line-height: 1.6;">
                ${body}
              </div>
              ${ctaButton}
              ${footer}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Email templates for common process events
 */
export const EMAIL_TEMPLATES = {
  processStarted: (processName: string, instanceUrl: string) => buildEmailTemplate({
    title: `Process Started: ${processName}`,
    heading: `Process Started: ${processName}`,
    body: `
      <p>A new process instance has been started.</p>
      <p><strong>Process:</strong> ${processName}</p>
      <p><strong>Started at:</strong> {{env.timestamp|date:datetime}}</p>
    `,
    ctaText: 'View Process',
    ctaUrl: instanceUrl,
    footerText: 'This is an automated notification from ProcessCore.',
  }),

  stepCompleted: (stepName: string, processName: string, instanceUrl: string) => buildEmailTemplate({
    title: `Step Completed: ${stepName}`,
    heading: `Step Completed`,
    body: `
      <p>A step has been completed in your process.</p>
      <p><strong>Step:</strong> ${stepName}</p>
      <p><strong>Process:</strong> ${processName}</p>
      <p><strong>Completed at:</strong> {{env.timestamp|date:datetime}}</p>
    `,
    ctaText: 'View Progress',
    ctaUrl: instanceUrl,
    footerText: 'This is an automated notification from ProcessCore.',
  }),

  processCompleted: (processName: string, instanceUrl: string) => buildEmailTemplate({
    title: `Process Completed: ${processName}`,
    heading: `✅ Process Completed`,
    body: `
      <p>Your process has been successfully completed.</p>
      <p><strong>Process:</strong> ${processName}</p>
      <p><strong>Completed at:</strong> {{env.timestamp|date:datetime}}</p>
    `,
    ctaText: 'View Summary',
    ctaUrl: instanceUrl,
    footerText: 'This is an automated notification from ProcessCore.',
  }),

  processFailed: (processName: string, errorMessage: string, instanceUrl: string) => buildEmailTemplate({
    title: `Process Failed: ${processName}`,
    heading: `❌ Process Failed`,
    body: `
      <p>A process has failed and requires attention.</p>
      <p><strong>Process:</strong> ${processName}</p>
      <p><strong>Error:</strong> ${errorMessage}</p>
      <p><strong>Failed at:</strong> {{env.timestamp|date:datetime}}</p>
    `,
    ctaText: 'Investigate',
    ctaUrl: instanceUrl,
    footerText: 'This is an automated notification from ProcessCore.',
  }),
};

export default { sendEmail, buildEmailTemplate, EMAIL_TEMPLATES };
