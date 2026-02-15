/**
 * SlackAction - Post messages to Slack via incoming webhooks
 * 
 * Supports:
 * - Plain text messages
 * - Block Kit formatted messages
 * - Variable substitution
 * - Custom webhook URLs or channel-specific webhooks
 */

import { ActionConfig, VariableContext, SlackBlock } from '@/types/integrations';
import { resolveTemplate, resolveObject } from './VariableResolver';

interface SlackResult {
  success: boolean;
  error?: string;
}

interface SlackPayload {
  text?: string;
  blocks?: SlackBlock[];
  channel?: string;
  username?: string;
  icon_emoji?: string;
  unfurl_links?: boolean;
  unfurl_media?: boolean;
}

export async function postToSlack(
  config: ActionConfig,
  context: VariableContext
): Promise<SlackResult> {
  // Get webhook URL from config or environment
  const webhookUrl = config.webhookUrl || process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    return {
      success: false,
      error: 'Slack webhook URL not configured',
    };
  }

  // Resolve variables in message
  const message = resolveTemplate(config.message || '', context);
  const channel = config.channel ? resolveTemplate(config.channel, context) : undefined;

  if (!message && (!config.blocks || config.blocks.length === 0)) {
    return {
      success: false,
      error: 'Message or blocks required',
    };
  }

  try {
    const payload: SlackPayload = {
      unfurl_links: false,
      unfurl_media: true,
    };

    if (message) {
      payload.text = message;
    }

    if (channel) {
      payload.channel = channel;
    }

    // Resolve variables in blocks
    if (config.blocks && config.blocks.length > 0) {
      payload.blocks = resolveObject({ blocks: config.blocks }, context).blocks as SlackBlock[];
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Slack webhooks return 'ok' as plain text on success
    const responseText = await response.text();

    if (!response.ok || responseText !== 'ok') {
      return {
        success: false,
        error: responseText || `HTTP ${response.status}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to post to Slack',
    };
  }
}

/**
 * Build a Block Kit message for process events
 */
export function buildProcessBlock(options: {
  title: string;
  status: 'started' | 'completed' | 'failed' | 'info';
  fields: Array<{ label: string; value: string }>;
  ctaText?: string;
  ctaUrl?: string;
}): SlackBlock[] {
  const { title, status, fields, ctaText, ctaUrl } = options;

  const statusEmoji: Record<string, string> = {
    started: '🚀',
    completed: '✅',
    failed: '❌',
    info: 'ℹ️',
  };

  const statusColor: Record<string, string> = {
    started: '#2563eb',
    completed: '#16a34a',
    failed: '#dc2626',
    info: '#6b7280',
  };

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${statusEmoji[status]} ${title}`,
      },
    },
    {
      type: 'section',
      fields: fields.map(({ label, value }) => ({
        type: 'mrkdwn',
        text: `*${label}:*\n${value}`,
      })),
    },
  ];

  if (ctaText && ctaUrl) {
    blocks.push({
      type: 'actions',
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: ctaText,
        },
        url: ctaUrl,
        style: status === 'failed' ? 'danger' : 'primary',
      },
    } as SlackBlock);
  }

  blocks.push({
    type: 'context',
    fields: [
      {
        type: 'mrkdwn',
        text: `ProcessCore • ${new Date().toLocaleString()}`,
      },
    ],
  } as unknown as SlackBlock);

  return blocks;
}

/**
 * Pre-built Slack templates for common process events
 */
export const SLACK_TEMPLATES = {
  processStarted: (processName: string, startedBy: string, instanceUrl: string) => ({
    message: `🚀 Process "${processName}" has been started by ${startedBy}`,
    blocks: buildProcessBlock({
      title: 'Process Started',
      status: 'started',
      fields: [
        { label: 'Process', value: processName },
        { label: 'Started by', value: startedBy },
        { label: 'Time', value: '{{env.timestamp|date:datetime}}' },
      ],
      ctaText: 'View Process',
      ctaUrl: instanceUrl,
    }),
  }),

  stepCompleted: (stepName: string, processName: string, completedBy: string, instanceUrl: string) => ({
    message: `✅ Step "${stepName}" completed in "${processName}"`,
    blocks: buildProcessBlock({
      title: 'Step Completed',
      status: 'completed',
      fields: [
        { label: 'Step', value: stepName },
        { label: 'Process', value: processName },
        { label: 'Completed by', value: completedBy },
      ],
      ctaText: 'View Progress',
      ctaUrl: instanceUrl,
    }),
  }),

  processCompleted: (processName: string, duration: string, instanceUrl: string) => ({
    message: `✅ Process "${processName}" completed successfully`,
    blocks: buildProcessBlock({
      title: 'Process Completed',
      status: 'completed',
      fields: [
        { label: 'Process', value: processName },
        { label: 'Duration', value: duration },
        { label: 'Completed', value: '{{env.timestamp|date:datetime}}' },
      ],
      ctaText: 'View Summary',
      ctaUrl: instanceUrl,
    }),
  }),

  processFailed: (processName: string, errorMessage: string, instanceUrl: string) => ({
    message: `❌ Process "${processName}" failed: ${errorMessage}`,
    blocks: buildProcessBlock({
      title: 'Process Failed',
      status: 'failed',
      fields: [
        { label: 'Process', value: processName },
        { label: 'Error', value: errorMessage },
        { label: 'Time', value: '{{env.timestamp|date:datetime}}' },
      ],
      ctaText: 'Investigate',
      ctaUrl: instanceUrl,
    }),
  }),

  taskAssigned: (taskName: string, assignee: string, dueDate: string, taskUrl: string) => ({
    message: `📋 New task assigned to ${assignee}: "${taskName}"`,
    blocks: buildProcessBlock({
      title: 'Task Assigned',
      status: 'info',
      fields: [
        { label: 'Task', value: taskName },
        { label: 'Assigned to', value: `<@${assignee}>` },
        { label: 'Due', value: dueDate },
      ],
      ctaText: 'View Task',
      ctaUrl: taskUrl,
    }),
  }),
};

export default { postToSlack, buildProcessBlock, SLACK_TEMPLATES };
