'use client';

/**
 * API Documentation Page
 * 
 * Technical documentation for the ProcessCore webhook and integration APIs.
 * Shows available endpoints, example curl commands, and payload schemas.
 */

import React, { useState } from 'react';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  permission: string;
  requestBody?: Record<string, FieldDoc>;
  responseBody?: Record<string, FieldDoc>;
  example: {
    curl: string;
    response: string;
  };
}

interface FieldDoc {
  type: string;
  required?: boolean;
  description: string;
  enum?: string[];
  example?: string | number | boolean | object;
}

const METHOD_COLORS = {
  GET: 'bg-green-100 text-green-800',
  POST: 'bg-blue-100 text-blue-800',
  PUT: 'bg-yellow-100 text-yellow-800',
  PATCH: 'bg-purple-100 text-purple-800',
  DELETE: 'bg-red-100 text-red-800',
};

const ENDPOINTS: Endpoint[] = [
  {
    method: 'POST',
    path: '/api/webhooks/trigger',
    description: 'Start a process instance via webhook. Returns immediately with an instance ID.',
    permission: 'webhooks:trigger',
    requestBody: {
      processId: {
        type: 'string',
        required: true,
        description: 'ID of the process to start',
        example: 'MKT-FLOW-001',
      },
      input: {
        type: 'object',
        required: false,
        description: 'Input data available as {{input.fieldName}} in actions',
        example: { client_name: 'Acme Corp', campaign_type: 'email' },
      },
      metadata: {
        type: 'object',
        required: false,
        description: 'Additional metadata (source, correlationId, priority)',
        example: { source: 'zapier', correlationId: 'ext-12345' },
      },
    },
    responseBody: {
      success: { type: 'boolean', description: 'Whether the request succeeded' },
      instanceId: { type: 'string', description: 'UUID of the created instance' },
      processId: { type: 'string', description: 'ID of the process' },
      status: { type: 'string', enum: ['started', 'queued'], description: 'Instance status' },
    },
    example: {
      curl: `curl -X POST https://your-domain.com/api/webhooks/trigger \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: pk_your_api_key_here" \\
  -d '{
    "processId": "MKT-FLOW-001",
    "input": {
      "client_name": "Acme Corp",
      "campaign_type": "email",
      "budget": 5000
    },
    "metadata": {
      "source": "crm",
      "correlationId": "deal-123"
    }
  }'`,
      response: `{
  "success": true,
  "instanceId": "550e8400-e29b-41d4-a716-446655440000",
  "processId": "MKT-FLOW-001",
  "status": "started",
  "message": "Process instance created successfully"
}`,
    },
  },
  {
    method: 'POST',
    path: '/api/webhooks/callback',
    description: 'Receive callbacks from external services. Update step or instance status.',
    permission: 'webhooks:callback',
    requestBody: {
      instanceId: {
        type: 'string',
        required: true,
        description: 'UUID of the process instance',
        example: '550e8400-e29b-41d4-a716-446655440000',
      },
      stepId: {
        type: 'string',
        required: false,
        description: 'ID of the specific step being updated',
        example: 'send-welcome-email',
      },
      status: {
        type: 'string',
        required: true,
        enum: ['success', 'failed', 'pending'],
        description: 'Status of the external operation',
      },
      data: {
        type: 'object',
        required: false,
        description: 'Data returned from the external service',
        example: { messageId: 'msg_12345' },
      },
      error: {
        type: 'string',
        required: false,
        description: 'Error message if status is failed',
      },
    },
    responseBody: {
      success: { type: 'boolean', description: 'Whether the request succeeded' },
      instanceId: { type: 'string', description: 'UUID of the instance' },
      updated: { type: 'boolean', description: 'Whether the instance was updated' },
    },
    example: {
      curl: `curl -X POST https://your-domain.com/api/webhooks/callback \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: pk_your_api_key_here" \\
  -d '{
    "instanceId": "550e8400-e29b-41d4-a716-446655440000",
    "stepId": "send-welcome-email",
    "status": "success",
    "data": {
      "messageId": "msg_12345",
      "deliveredAt": "2024-01-15T10:30:00Z"
    }
  }'`,
      response: `{
  "success": true,
  "instanceId": "550e8400-e29b-41d4-a716-446655440000",
  "updated": true,
  "message": "Callback processed successfully"
}`,
    },
  },
  {
    method: 'GET',
    path: '/api/webhooks/events',
    description: 'Server-Sent Events stream for real-time process updates.',
    permission: 'webhooks:events',
    requestBody: {},
    responseBody: {
      event: { type: 'string', description: 'Event type (process.started, step.completed, etc.)' },
      data: { type: 'object', description: 'Event data including processId, instanceId, timestamp' },
    },
    example: {
      curl: `curl -N -H "X-API-Key: pk_your_api_key_here" \\
  "https://your-domain.com/api/webhooks/events?processId=MKT-FLOW-001"`,
      response: `event: connected
data: {"connectionId":"abc123","timestamp":"2024-01-15T10:30:00Z"}

event: process.started
data: {"processId":"MKT-FLOW-001","instanceId":"550e...","timestamp":"..."}

event: step.completed
data: {"stepId":"step-1","status":"success","timestamp":"..."}`,
    },
  },
  {
    method: 'POST',
    path: '/api/keys/generate',
    description: 'Generate a new API key. Requires keys:manage permission.',
    permission: 'keys:manage',
    requestBody: {
      name: {
        type: 'string',
        required: true,
        description: 'Name/description for the key',
        example: 'Zapier Integration',
      },
      permissions: {
        type: 'array',
        required: true,
        description: 'Array of permission strings',
        example: ['webhooks:trigger', 'webhooks:callback'],
      },
      expiresInDays: {
        type: 'number',
        required: false,
        description: 'Days until the key expires (null = never)',
        example: 365,
      },
      rateLimit: {
        type: 'number',
        required: false,
        description: 'Max requests per minute (default: 60)',
        example: 100,
      },
    },
    responseBody: {
      id: { type: 'string', description: 'UUID of the key' },
      name: { type: 'string', description: 'Key name' },
      key: { type: 'string', description: 'The API key (shown only once!)' },
      keyPrefix: { type: 'string', description: 'First 11 characters for identification' },
      permissions: { type: 'array', description: 'Granted permissions' },
    },
    example: {
      curl: `curl -X POST https://your-domain.com/api/keys/generate \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: pk_admin_key_here" \\
  -d '{
    "name": "Zapier Integration",
    "permissions": ["webhooks:trigger", "webhooks:callback"],
    "expiresInDays": 365,
    "rateLimit": 100
  }'`,
      response: `{
  "success": true,
  "id": "key_abc123",
  "name": "Zapier Integration",
  "key": "pk_f8a3b2c1d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
  "keyPrefix": "pk_f8a3b2c1",
  "permissions": ["webhooks:trigger", "webhooks:callback"],
  "createdAt": "2024-01-15T10:30:00Z",
  "expiresAt": "2025-01-15T10:30:00Z",
  "warning": "Store this key securely. It will not be shown again."
}`,
    },
  },
  {
    method: 'GET',
    path: '/api/keys/list',
    description: 'List all API keys (without the actual key values).',
    permission: 'keys:manage',
    requestBody: {},
    responseBody: {
      keys: { type: 'array', description: 'Array of API key objects' },
      total: { type: 'number', description: 'Total number of keys' },
    },
    example: {
      curl: `curl -H "X-API-Key: pk_admin_key_here" \\
  https://your-domain.com/api/keys/list`,
      response: `{
  "success": true,
  "keys": [
    {
      "id": "key_abc123",
      "name": "Zapier Integration",
      "keyPrefix": "pk_f8a3b2c1",
      "permissions": ["webhooks:trigger", "webhooks:callback"],
      "createdAt": "2024-01-15T10:30:00Z",
      "lastUsedAt": "2024-01-16T14:22:00Z",
      "expiresAt": "2025-01-15T10:30:00Z",
      "isActive": true
    }
  ],
  "total": 1
}`,
    },
  },
  {
    method: 'DELETE',
    path: '/api/keys/[id]',
    description: 'Revoke an API key. The key will no longer work for authentication.',
    permission: 'keys:manage',
    requestBody: {},
    responseBody: {
      success: { type: 'boolean', description: 'Whether the request succeeded' },
      id: { type: 'string', description: 'UUID of the revoked key' },
      revoked: { type: 'boolean', description: 'Confirmation of revocation' },
    },
    example: {
      curl: `curl -X DELETE https://your-domain.com/api/keys/key_abc123 \\
  -H "X-API-Key: pk_admin_key_here"`,
      response: `{
  "success": true,
  "id": "key_abc123",
  "name": "Zapier Integration",
  "revoked": true,
  "message": "API key revoked successfully"
}`,
    },
  },
];

const VARIABLE_DOCS = [
  { variable: '{{process.id}}', description: 'Process definition ID', example: 'MKT-FLOW-001' },
  { variable: '{{process.name}}', description: 'Process name', example: 'Marketing Campaign Flow' },
  { variable: '{{process.status}}', description: 'Process status', example: 'active' },
  { variable: '{{instance.id}}', description: 'Instance UUID', example: '550e8400-e29b-41d4-a716-446655440000' },
  { variable: '{{instance.status}}', description: 'Instance status', example: 'running' },
  { variable: '{{instance.startedAt}}', description: 'Instance start time', example: '2024-01-15T10:30:00Z' },
  { variable: '{{step.id}}', description: 'Current step ID', example: 'send-welcome-email' },
  { variable: '{{step.name}}', description: 'Current step name', example: 'Send Welcome Email' },
  { variable: '{{step.owner}}', description: 'Step owner role', example: 'Marketing Lead' },
  { variable: '{{input.fieldName}}', description: 'Input data field', example: 'input.client_name → "Acme Corp"' },
  { variable: '{{output.fieldName}}', description: 'Output from previous actions', example: 'output.messageId' },
  { variable: '{{user.name}}', description: 'Current user name', example: 'John Doe' },
  { variable: '{{user.email}}', description: 'Current user email', example: 'john@example.com' },
  { variable: '{{env.timestamp}}', description: 'Current ISO timestamp', example: '2024-01-15T10:30:00Z' },
  { variable: '{{env.baseUrl}}', description: 'Application base URL', example: 'https://app.example.com' },
];

const VARIABLE_FILTERS = [
  { filter: '|upper', description: 'Convert to uppercase', example: '{{name|upper}} → "ACME CORP"' },
  { filter: '|lower', description: 'Convert to lowercase', example: '{{name|lower}} → "acme corp"' },
  { filter: '|capitalize', description: 'Capitalize first letter', example: '{{name|capitalize}} → "Acme corp"' },
  { filter: '|truncate:50', description: 'Truncate to length', example: '{{text|truncate:50}} → "Long text..."' },
  { filter: '|default:value', description: 'Default if empty', example: '{{name|default:Unknown}}' },
  { filter: '|date:datetime', description: 'Format date', example: '{{timestamp|date:datetime}}' },
  { filter: '|url_encode', description: 'URL encode', example: '{{query|url_encode}}' },
  { filter: '|json', description: 'Pretty print JSON', example: '{{data|json}}' },
];

function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-sm overflow-x-auto font-mono">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

function EndpointSection({ endpoint }: { endpoint: Endpoint }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="px-4 py-3 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100"
      >
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 text-xs font-bold rounded ${METHOD_COLORS[endpoint.method]}`}>
            {endpoint.method}
          </span>
          <code className="font-mono text-sm">{endpoint.path}</code>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
            {endpoint.permission}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-4 space-y-6">
          <p className="text-gray-600">{endpoint.description}</p>

          {/* Request Body */}
          {endpoint.requestBody && Object.keys(endpoint.requestBody).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Request Body</h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(endpoint.requestBody).map(([field, doc]) => (
                      <tr key={field}>
                        <td className="px-4 py-2 font-mono text-sm">
                          {field}
                          {doc.required && <span className="text-red-500 ml-1">*</span>}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {doc.type}
                          {doc.enum && <span className="text-xs text-gray-400 ml-1">({doc.enum.join(' | ')})</span>}
                        </td>
                        <td className="px-4 py-2 text-gray-600">{doc.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Response Body */}
          {endpoint.responseBody && Object.keys(endpoint.responseBody).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Response</h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(endpoint.responseBody).map(([field, doc]) => (
                      <tr key={field}>
                        <td className="px-4 py-2 font-mono text-sm">{field}</td>
                        <td className="px-4 py-2 text-gray-600">{doc.type}</td>
                        <td className="px-4 py-2 text-gray-600">{doc.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Example */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Example</h4>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Request</div>
                <CodeBlock code={endpoint.example.curl} />
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Response</div>
                <CodeBlock code={endpoint.example.response} language="json" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'variables' | 'authentication'>('endpoints');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">ProcessCore API</h1>
          <p className="mt-2 text-gray-600">
            Webhook and integration APIs for automating process workflows
          </p>
          <div className="mt-4 flex gap-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              v1.0
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              REST API
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              Server-Sent Events
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-6">
            {(['endpoints', 'variables', 'authentication'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Endpoints Tab */}
        {activeTab === 'endpoints' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Webhook Endpoints</h2>
              <p className="text-gray-600 mb-4">
                Trigger processes and receive callbacks via HTTP webhooks.
              </p>
              <div className="space-y-4">
                {ENDPOINTS.filter(e => e.path.includes('webhooks')).map((endpoint) => (
                  <EndpointSection key={`${endpoint.method}-${endpoint.path}`} endpoint={endpoint} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">API Key Management</h2>
              <p className="text-gray-600 mb-4">
                Create, list, and revoke API keys for authentication.
              </p>
              <div className="space-y-4">
                {ENDPOINTS.filter(e => e.path.includes('keys')).map((endpoint) => (
                  <EndpointSection key={`${endpoint.method}-${endpoint.path}`} endpoint={endpoint} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Variables Tab */}
        {activeTab === 'variables' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Template Variables</h2>
              <p className="text-gray-600 mb-4">
                Use these variables in webhook payloads, email templates, and action configurations.
                Variables are enclosed in double curly braces: <code className="bg-gray-100 px-1 rounded">{'{{'}<span className="text-blue-600">variable</span>{'}}'}</code>
              </p>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variable</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Example</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {VARIABLE_DOCS.map((v) => (
                      <tr key={v.variable}>
                        <td className="px-4 py-3 font-mono text-blue-600">{v.variable}</td>
                        <td className="px-4 py-3 text-gray-600">{v.description}</td>
                        <td className="px-4 py-3 font-mono text-gray-500">{v.example}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Variable Filters</h2>
              <p className="text-gray-600 mb-4">
                Transform variable values using filters with the pipe syntax: <code className="bg-gray-100 px-1 rounded">{'{{'}<span className="text-blue-600">variable|filter</span>{'}}'}</code>
              </p>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filter</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Example</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {VARIABLE_FILTERS.map((f) => (
                      <tr key={f.filter}>
                        <td className="px-4 py-3 font-mono text-purple-600">{f.filter}</td>
                        <td className="px-4 py-3 text-gray-600">{f.description}</td>
                        <td className="px-4 py-3 font-mono text-gray-500">{f.example}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Authentication Tab */}
        {activeTab === 'authentication' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">API Key Authentication</h2>
              <p className="text-gray-600 mb-4">
                All API requests require authentication using an API key. Include the key in your request using one of these methods:
              </p>
              
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Option 1: X-API-Key Header (Recommended)</h3>
                  <CodeBlock code={`curl -H "X-API-Key: pk_your_api_key_here" \\
  https://your-domain.com/api/webhooks/trigger`} />
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Option 2: Bearer Token</h3>
                  <CodeBlock code={`curl -H "Authorization: Bearer pk_your_api_key_here" \\
  https://your-domain.com/api/webhooks/trigger`} />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Permissions</h2>
              <p className="text-gray-600 mb-4">
                API keys can have different permissions. Each endpoint requires a specific permission.
              </p>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permission</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allows</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm">webhooks:trigger</td>
                      <td className="px-4 py-3 text-gray-600">Start process instances via POST /api/webhooks/trigger</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm">webhooks:callback</td>
                      <td className="px-4 py-3 text-gray-600">Send callbacks via POST /api/webhooks/callback</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm">webhooks:events</td>
                      <td className="px-4 py-3 text-gray-600">Subscribe to events via GET /api/webhooks/events</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm">processes:read</td>
                      <td className="px-4 py-3 text-gray-600">Read process definitions</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm">processes:write</td>
                      <td className="px-4 py-3 text-gray-600">Create and modify process definitions</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm">instances:read</td>
                      <td className="px-4 py-3 text-gray-600">Read process instance data</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm">instances:write</td>
                      <td className="px-4 py-3 text-gray-600">Modify process instances</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm">keys:manage</td>
                      <td className="px-4 py-3 text-gray-600">Create, list, and revoke API keys</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Rate Limiting</h2>
              <p className="text-gray-600 mb-4">
                Each API key has a rate limit (requests per minute). When exceeded, requests return HTTP 429.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="text-yellow-600 text-xl mr-3">⚠️</span>
                  <div>
                    <h4 className="font-medium text-yellow-800">Rate Limit Response</h4>
                    <p className="text-yellow-700 text-sm mt-1">
                      When rate limited, the API returns a 429 status with a <code className="bg-yellow-100 px-1 rounded">Retry-After</code> header indicating seconds to wait.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Responses</h2>
              <p className="text-gray-600 mb-4">
                All error responses follow a consistent format:
              </p>
              <CodeBlock code={`{
  "success": false,
  "error": "Human-readable error message"
}`} language="json" />
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <span className="font-mono text-red-600">400</span>
                  <span className="ml-2 text-gray-600">Bad Request - Invalid input</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <span className="font-mono text-red-600">401</span>
                  <span className="ml-2 text-gray-600">Unauthorized - Invalid/missing key</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <span className="font-mono text-red-600">403</span>
                  <span className="ml-2 text-gray-600">Forbidden - Missing permission</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <span className="font-mono text-red-600">404</span>
                  <span className="ml-2 text-gray-600">Not Found - Resource doesn&apos;t exist</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <span className="font-mono text-red-600">429</span>
                  <span className="ml-2 text-gray-600">Rate Limited - Too many requests</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <span className="font-mono text-red-600">500</span>
                  <span className="ml-2 text-gray-600">Server Error - Try again later</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-gray-500">
          ProcessCore API v1.0 • Need help? Contact <a href="mailto:support@example.com" className="text-blue-600 hover:underline">support@example.com</a>
        </div>
      </div>
    </div>
  );
}
