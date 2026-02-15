'use client';

/**
 * WebhookConfig - Configure webhook URLs and payloads
 * 
 * Provides a form for configuring webhook actions with:
 * - URL input with validation
 * - HTTP method selection
 * - Headers configuration
 * - Payload template with variable autocomplete
 * - Test functionality
 */

import React, { useState } from 'react';
import { WebhookConfig as WebhookConfigType, RetryPolicy } from '@/types/integrations';

interface WebhookConfigProps {
  config?: Partial<WebhookConfigType>;
  onChange?: (config: Partial<WebhookConfigType>) => void;
  onTest?: (config: Partial<WebhookConfigType>) => Promise<{ success: boolean; response?: unknown; error?: string }>;
  availableVariables?: string[];
}

const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

const COMMON_VARIABLES = [
  '{{process.id}}',
  '{{process.name}}',
  '{{instance.id}}',
  '{{instance.status}}',
  '{{step.id}}',
  '{{step.name}}',
  '{{step.owner}}',
  '{{user.name}}',
  '{{user.email}}',
  '{{env.timestamp}}',
  '{{input.fieldName}}',
  '{{output.fieldName}}',
];

export function WebhookConfig({
  config = {},
  onChange,
  onTest,
  availableVariables = COMMON_VARIABLES,
}: WebhookConfigProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');

  const updateConfig = (updates: Partial<WebhookConfigType>) => {
    onChange?.({ ...config, ...updates });
  };

  const handleTest = async () => {
    if (!onTest || !config.url) return;

    setTesting(true);
    setTestResult(null);

    try {
      const result = await onTest(config);
      setTestResult({
        success: result.success,
        message: result.success 
          ? 'Webhook test successful!' 
          : `Test failed: ${result.error || 'Unknown error'}`,
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const addHeader = () => {
    if (!newHeaderKey) return;
    const headers = { ...(config.headers || {}), [newHeaderKey]: newHeaderValue };
    updateConfig({ headers });
    setNewHeaderKey('');
    setNewHeaderValue('');
  };

  const removeHeader = (key: string) => {
    const headers = { ...(config.headers || {}) };
    delete headers[key];
    updateConfig({ headers });
  };

  const insertVariable = (variable: string, field: 'url' | 'payloadTemplate') => {
    const currentValue = config[field] || '';
    updateConfig({ [field]: currentValue + variable });
  };

  return (
    <div className="space-y-4">
      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Webhook URL
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={config.url || ''}
            onChange={(e) => updateConfig({ url: e.target.value })}
            placeholder="https://api.example.com/webhook"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
          />
          {onTest && (
            <button
              onClick={handleTest}
              disabled={testing || !config.url}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? 'Testing...' : 'Test'}
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Supports variables: {'{{'}<span className="text-blue-600">variable.path</span>{'}}'}
        </p>
      </div>

      {/* Test Result */}
      {testResult && (
        <div className={`p-3 rounded-md text-sm ${
          testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {testResult.message}
        </div>
      )}

      {/* Method Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          HTTP Method
        </label>
        <div className="flex gap-2">
          {(['POST', 'PUT', 'PATCH'] as const).map((method) => (
            <button
              key={method}
              onClick={() => updateConfig({ method })}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                (config.method || 'POST') === method
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* Payload Template */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Payload Template (JSON)
          </label>
          <div className="relative group">
            <button className="text-xs text-blue-600 hover:text-blue-800">
              Insert Variable ▾
            </button>
            <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <div className="p-2 max-h-48 overflow-y-auto">
                {availableVariables.map((variable) => (
                  <button
                    key={variable}
                    onClick={() => insertVariable(variable, 'payloadTemplate')}
                    className="w-full text-left px-2 py-1.5 text-xs font-mono text-gray-700 hover:bg-blue-50 rounded"
                  >
                    {variable}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <textarea
          value={config.payloadTemplate || '{\n  "event": "step.completed",\n  "processId": "{{process.id}}",\n  "instanceId": "{{instance.id}}",\n  "stepId": "{{step.id}}",\n  "timestamp": "{{env.timestamp}}"\n}'}
          onChange={(e) => updateConfig({ payloadTemplate: e.target.value })}
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder='{"key": "{{variable}}"}'
        />
      </div>

      {/* Advanced Settings Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <svg
          className={`w-4 h-4 mr-1.5 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Advanced Settings
      </button>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="space-y-4 pl-4 border-l-2 border-gray-200">
          {/* Headers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Headers
            </label>
            <div className="space-y-2">
              {Object.entries(config.headers || {}).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <code className="flex-1 px-2 py-1.5 bg-gray-100 rounded text-xs truncate">
                    {key}: {value}
                  </code>
                  <button
                    onClick={() => removeHeader(key)}
                    className="p-1.5 text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHeaderKey}
                  onChange={(e) => setNewHeaderKey(e.target.value)}
                  placeholder="Header name"
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
                <input
                  type="text"
                  value={newHeaderValue}
                  onChange={(e) => setNewHeaderValue(e.target.value)}
                  placeholder="Value"
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={addHeader}
                  className="px-3 py-1.5 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Retry Policy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Retry Policy
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max Retries</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={config.retryPolicy?.maxRetries ?? DEFAULT_RETRY_POLICY.maxRetries}
                  onChange={(e) => updateConfig({
                    retryPolicy: {
                      ...DEFAULT_RETRY_POLICY,
                      ...config.retryPolicy,
                      maxRetries: parseInt(e.target.value) || 0,
                    },
                  })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Initial Delay (ms)</label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={config.retryPolicy?.initialDelayMs ?? DEFAULT_RETRY_POLICY.initialDelayMs}
                  onChange={(e) => updateConfig({
                    retryPolicy: {
                      ...DEFAULT_RETRY_POLICY,
                      ...config.retryPolicy,
                      initialDelayMs: parseInt(e.target.value) || 1000,
                    },
                  })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>

          {/* Authentication */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Authentication
            </label>
            <select
              value={config.authentication?.type || 'none'}
              onChange={(e) => updateConfig({
                authentication: {
                  type: e.target.value as 'none' | 'bearer' | 'basic' | 'api_key',
                },
              })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="none">None</option>
              <option value="bearer">Bearer Token</option>
              <option value="basic">Basic Auth</option>
              <option value="api_key">API Key Header</option>
              <option value="hmac">HMAC Signature</option>
            </select>
          </div>
        </div>
      )}

      {/* Name and Description */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name (optional)
          </label>
          <input
            type="text"
            value={config.name || ''}
            onChange={(e) => updateConfig({ name: e.target.value })}
            placeholder="My Webhook"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <input
            type="text"
            value={config.description || ''}
            onChange={(e) => updateConfig({ description: e.target.value })}
            placeholder="Notify external service"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}

export default WebhookConfig;
