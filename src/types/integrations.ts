// ProcessCore - Integration & Webhook Types

// ============================================================
// API KEY TYPES
// ============================================================

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string; // First 8 chars for display (e.g., "pk_abc123...")
  keyHash: string;   // SHA256 hash of the full key
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  permissions: ApiKeyPermission[];
  rateLimit: number; // requests per minute
  isActive: boolean;
  createdBy: string;
  metadata?: Record<string, string>;
}

export type ApiKeyPermission = 
  | 'webhooks:trigger'
  | 'webhooks:callback'
  | 'webhooks:events'
  | 'processes:read'
  | 'processes:write'
  | 'instances:read'
  | 'instances:write'
  | 'keys:manage';

export interface ApiKeyCreateRequest {
  name: string;
  permissions: ApiKeyPermission[];
  expiresInDays?: number;
  rateLimit?: number;
  metadata?: Record<string, string>;
}

export interface ApiKeyResponse {
  id: string;
  name: string;
  key: string; // Full key, shown only once
  keyPrefix: string;
  permissions: ApiKeyPermission[];
  createdAt: string;
  expiresAt?: string;
}

// ============================================================
// WEBHOOK TYPES
// ============================================================

export interface WebhookConfig {
  id: string;
  name: string;
  description?: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  payloadTemplate?: string; // JSON template with {{variables}}
  authentication?: WebhookAuth;
  retryPolicy?: RetryPolicy;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookAuth {
  type: 'none' | 'bearer' | 'basic' | 'api_key' | 'hmac';
  credentials?: {
    token?: string;
    username?: string;
    password?: string;
    headerName?: string;
    apiKey?: string;
    secret?: string;
  };
}

export interface RetryPolicy {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

// ============================================================
// TRIGGER TYPES
// ============================================================

export type TriggerEvent = 
  | 'process.started'
  | 'process.completed'
  | 'process.failed'
  | 'step.started'
  | 'step.completed'
  | 'step.failed'
  | 'step.skipped'
  | 'decision.made'
  | 'manual.trigger';

export interface Trigger {
  id: string;
  name: string;
  description?: string;
  event: TriggerEvent;
  processId?: string;    // Optional: filter to specific process
  stepId?: string;       // Optional: filter to specific step
  conditions?: TriggerCondition[];
  actions: TriggerAction[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TriggerCondition {
  field: string;        // e.g., "input.priority", "step.owner"
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'gt' | 'lt' | 'exists';
  value: string | number | boolean;
}

export interface TriggerAction {
  id: string;
  type: ActionType;
  config: ActionConfig;
  order: number;
  onError: 'continue' | 'abort' | 'retry';
}

// ============================================================
// ACTION TYPES
// ============================================================

export type ActionType = 
  | 'send_email'
  | 'create_task'
  | 'update_crm'
  | 'slack_message'
  | 'webhook'
  | 'http_request'
  | 'log'
  | 'delay'
  | 'transform_data';

export interface ActionConfig {
  // Common
  name?: string;
  description?: string;

  // Email action
  to?: string;           // Can use {{variables}}
  cc?: string[];
  bcc?: string[];
  subject?: string;
  body?: string;         // HTML body with {{variables}}
  templateId?: string;

  // Task action
  taskTitle?: string;
  taskDescription?: string;
  assignee?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  projectId?: string;

  // CRM action
  crmEntity?: 'contact' | 'deal' | 'company' | 'ticket';
  crmAction?: 'create' | 'update' | 'link';
  crmFields?: Record<string, string>;
  crmId?: string;

  // Slack action
  channel?: string;
  message?: string;
  blocks?: SlackBlock[];
  webhookUrl?: string;

  // Generic webhook
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  payload?: string;
  timeout?: number;

  // Delay action
  delayMs?: number;

  // Transform action
  transformScript?: string;
  outputVariable?: string;
}

export interface SlackBlock {
  type: 'section' | 'divider' | 'header' | 'context' | 'actions';
  text?: {
    type: 'mrkdwn' | 'plain_text';
    text: string;
  };
  fields?: Array<{
    type: 'mrkdwn' | 'plain_text';
    text: string;
  }>;
  accessory?: Record<string, unknown>;
}

// ============================================================
// CONNECTION TYPES
// ============================================================

export interface Connection {
  id: string;
  name: string;
  type: ConnectionType;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  credentials?: EncryptedCredentials;
  lastSyncAt?: string;
  errorMessage?: string;
  metadata?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export type ConnectionType = 
  | 'slack'
  | 'email_resend'
  | 'email_sendgrid'
  | 'clickup'
  | 'asana'
  | 'jira'
  | 'hubspot'
  | 'salesforce'
  | 'pipedrive'
  | 'zapier'
  | 'make'
  | 'custom_webhook';

export interface EncryptedCredentials {
  encryptedData: string;
  iv: string;
  algorithm: string;
}

// ============================================================
// EXECUTION & LOGGING
// ============================================================

export interface ActionExecution {
  id: string;
  triggerId: string;
  actionId: string;
  actionType: ActionType;
  instanceId?: string;   // Process instance that triggered this
  stepId?: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'retrying';
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
  retryCount: number;
  metadata?: Record<string, string>;
}

export interface WebhookEvent {
  id: string;
  event: TriggerEvent;
  processId?: string;
  instanceId?: string;
  stepId?: string;
  timestamp: string;
  data: Record<string, unknown>;
  source: 'internal' | 'webhook' | 'api';
}

// ============================================================
// VARIABLE SYSTEM
// ============================================================

export interface VariableContext {
  // Process context
  process?: {
    id: string;
    name: string;
    status: string;
    startedAt?: string;
    completedAt?: string;
  };
  
  // Instance context
  instance?: {
    id: string;
    status: string;
    startedAt: string;
    completedAt?: string;
    currentStep?: string;
  };
  
  // Step context
  step?: {
    id: string;
    name: string;
    owner: string;
    status: string;
    startedAt?: string;
    completedAt?: string;
  };
  
  // Input data (from webhook trigger or form)
  input?: Record<string, unknown>;
  
  // Output data from previous steps
  output?: Record<string, unknown>;
  
  // User/actor context
  user?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
  
  // Environment
  env?: {
    baseUrl: string;
    timestamp: string;
    timezone: string;
  };
  
  // Custom variables
  vars?: Record<string, unknown>;
}

// ============================================================
// WEBHOOK PAYLOADS
// ============================================================

export interface WebhookTriggerPayload {
  processId: string;
  input?: Record<string, unknown>;
  metadata?: {
    source?: string;
    correlationId?: string;
    priority?: 'low' | 'normal' | 'high';
  };
}

export interface WebhookCallbackPayload {
  instanceId: string;
  stepId?: string;
  status: 'success' | 'failed' | 'pending';
  data?: Record<string, unknown>;
  error?: string;
}

export interface WebhookTriggerResponse {
  success: boolean;
  instanceId: string;
  processId: string;
  status: 'started' | 'queued';
  message?: string;
}

export interface WebhookCallbackResponse {
  success: boolean;
  instanceId: string;
  updated: boolean;
  message?: string;
}

// ============================================================
// SUPPORTED INTEGRATIONS REGISTRY
// ============================================================

export const SUPPORTED_ACTIONS: Record<ActionType, {
  name: string;
  description: string;
  icon: string;
  requiredFields: string[];
  optionalFields: string[];
  category: 'communication' | 'tasks' | 'crm' | 'automation' | 'utility';
}> = {
  send_email: {
    name: 'Send Email',
    description: 'Send an email via Resend, SendGrid, or SMTP',
    icon: '📧',
    requiredFields: ['to', 'subject', 'body'],
    optionalFields: ['cc', 'bcc', 'templateId'],
    category: 'communication',
  },
  create_task: {
    name: 'Create Task',
    description: 'Create a task in ClickUp, Asana, or Jira',
    icon: '✅',
    requiredFields: ['taskTitle', 'assignee'],
    optionalFields: ['taskDescription', 'dueDate', 'priority', 'projectId'],
    category: 'tasks',
  },
  update_crm: {
    name: 'Update CRM',
    description: 'Create or update records in HubSpot, Salesforce, or Pipedrive',
    icon: '📊',
    requiredFields: ['crmEntity', 'crmAction'],
    optionalFields: ['crmId', 'crmFields'],
    category: 'crm',
  },
  slack_message: {
    name: 'Slack Message',
    description: 'Post a message to a Slack channel',
    icon: '💬',
    requiredFields: ['channel', 'message'],
    optionalFields: ['blocks', 'webhookUrl'],
    category: 'communication',
  },
  webhook: {
    name: 'Webhook',
    description: 'Send HTTP request to any URL',
    icon: '🔗',
    requiredFields: ['url'],
    optionalFields: ['method', 'headers', 'payload', 'timeout'],
    category: 'automation',
  },
  http_request: {
    name: 'HTTP Request',
    description: 'Make a generic HTTP request',
    icon: '🌐',
    requiredFields: ['url', 'method'],
    optionalFields: ['headers', 'payload', 'timeout'],
    category: 'automation',
  },
  log: {
    name: 'Log',
    description: 'Log data for debugging',
    icon: '📝',
    requiredFields: ['message'],
    optionalFields: [],
    category: 'utility',
  },
  delay: {
    name: 'Delay',
    description: 'Wait before executing next action',
    icon: '⏱️',
    requiredFields: ['delayMs'],
    optionalFields: [],
    category: 'utility',
  },
  transform_data: {
    name: 'Transform Data',
    description: 'Transform data using a script',
    icon: '🔄',
    requiredFields: ['transformScript', 'outputVariable'],
    optionalFields: [],
    category: 'utility',
  },
};

export const SUPPORTED_CONNECTIONS: Record<ConnectionType, {
  name: string;
  description: string;
  icon: string;
  authType: 'oauth' | 'api_key' | 'webhook' | 'basic';
  docsUrl: string;
}> = {
  slack: {
    name: 'Slack',
    description: 'Post messages to Slack channels',
    icon: '💬',
    authType: 'webhook',
    docsUrl: 'https://api.slack.com/messaging/webhooks',
  },
  email_resend: {
    name: 'Resend',
    description: 'Send transactional emails via Resend',
    icon: '📧',
    authType: 'api_key',
    docsUrl: 'https://resend.com/docs',
  },
  email_sendgrid: {
    name: 'SendGrid',
    description: 'Send emails via SendGrid',
    icon: '📧',
    authType: 'api_key',
    docsUrl: 'https://docs.sendgrid.com/',
  },
  clickup: {
    name: 'ClickUp',
    description: 'Create tasks and manage projects',
    icon: '✅',
    authType: 'api_key',
    docsUrl: 'https://clickup.com/api',
  },
  asana: {
    name: 'Asana',
    description: 'Create tasks and manage projects',
    icon: '✅',
    authType: 'oauth',
    docsUrl: 'https://developers.asana.com/',
  },
  jira: {
    name: 'Jira',
    description: 'Create issues and manage projects',
    icon: '🎫',
    authType: 'oauth',
    docsUrl: 'https://developer.atlassian.com/cloud/jira/',
  },
  hubspot: {
    name: 'HubSpot',
    description: 'Manage CRM contacts, deals, and companies',
    icon: '📊',
    authType: 'oauth',
    docsUrl: 'https://developers.hubspot.com/',
  },
  salesforce: {
    name: 'Salesforce',
    description: 'Manage CRM records',
    icon: '☁️',
    authType: 'oauth',
    docsUrl: 'https://developer.salesforce.com/',
  },
  pipedrive: {
    name: 'Pipedrive',
    description: 'Manage deals and contacts',
    icon: '📈',
    authType: 'api_key',
    docsUrl: 'https://developers.pipedrive.com/',
  },
  zapier: {
    name: 'Zapier',
    description: 'Connect via Zapier webhooks',
    icon: '⚡',
    authType: 'webhook',
    docsUrl: 'https://zapier.com/apps/webhooks',
  },
  make: {
    name: 'Make (Integromat)',
    description: 'Connect via Make webhooks',
    icon: '🔧',
    authType: 'webhook',
    docsUrl: 'https://www.make.com/en/help/tools/webhooks',
  },
  custom_webhook: {
    name: 'Custom Webhook',
    description: 'Send data to any HTTP endpoint',
    icon: '🔗',
    authType: 'webhook',
    docsUrl: '',
  },
};
