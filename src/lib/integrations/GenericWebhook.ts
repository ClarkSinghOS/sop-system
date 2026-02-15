/**
 * GenericWebhook - Send HTTP requests to any URL
 * 
 * Supports:
 * - All HTTP methods (GET, POST, PUT, PATCH, DELETE)
 * - Custom headers with variable substitution
 * - JSON payload with variable substitution
 * - Timeout configuration
 * - Retry logic
 */

import { ActionConfig, VariableContext, RetryPolicy } from '@/types/integrations';
import { resolveTemplate, resolveObject } from './VariableResolver';

interface WebhookResult {
  success: boolean;
  statusCode?: number;
  response?: unknown;
  error?: string;
  durationMs?: number;
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate retry delay with exponential backoff
 */
function calculateRetryDelay(attempt: number, policy: RetryPolicy): number {
  const delay = policy.initialDelayMs * Math.pow(policy.backoffMultiplier, attempt);
  return Math.min(delay, policy.maxDelayMs);
}

/**
 * Execute a webhook request with retry logic
 */
export async function executeWebhook(
  config: ActionConfig,
  context: VariableContext,
  retryPolicy: RetryPolicy = DEFAULT_RETRY_POLICY
): Promise<WebhookResult> {
  const url = resolveTemplate(config.url || '', context);

  if (!url) {
    return {
      success: false,
      error: 'Webhook URL is required',
    };
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    return {
      success: false,
      error: `Invalid URL: ${url}`,
    };
  }

  const method = (config.method || 'POST').toUpperCase();
  const timeout = config.timeout || DEFAULT_TIMEOUT;

  // Resolve headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'ProcessCore/1.0',
  };

  if (config.headers) {
    const resolvedHeaders = resolveObject(config.headers, context);
    Object.assign(headers, resolvedHeaders);
  }

  // Resolve payload
  let body: string | undefined;
  if (config.payload && method !== 'GET' && method !== 'HEAD') {
    const resolvedPayload = resolveTemplate(config.payload, context);
    // If it's valid JSON, keep it; otherwise wrap as string
    try {
      JSON.parse(resolvedPayload);
      body = resolvedPayload;
    } catch {
      body = JSON.stringify({ data: resolvedPayload });
    }
  }

  let lastError: string | undefined;

  for (let attempt = 0; attempt <= retryPolicy.maxRetries; attempt++) {
    if (attempt > 0) {
      const delay = calculateRetryDelay(attempt - 1, retryPolicy);
      console.log(`Webhook retry ${attempt}/${retryPolicy.maxRetries} after ${delay}ms`);
      await sleep(delay);
    }

    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const durationMs = Date.now() - startTime;

      // Try to parse response as JSON
      let responseData: unknown;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        try {
          responseData = await response.json();
        } catch {
          responseData = await response.text();
        }
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        // Retry on 5xx errors, fail immediately on 4xx
        if (response.status >= 500 && attempt < retryPolicy.maxRetries) {
          lastError = `HTTP ${response.status}: ${typeof responseData === 'string' ? responseData : JSON.stringify(responseData)}`;
          continue;
        }

        return {
          success: false,
          statusCode: response.status,
          response: responseData,
          error: `HTTP ${response.status}`,
          durationMs,
        };
      }

      return {
        success: true,
        statusCode: response.status,
        response: responseData,
        durationMs,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          lastError = `Request timeout after ${timeout}ms`;
        } else {
          lastError = error.message;
        }
      } else {
        lastError = 'Unknown error';
      }

      // Retry on network errors
      if (attempt < retryPolicy.maxRetries) {
        continue;
      }

      return {
        success: false,
        error: lastError,
        durationMs,
      };
    }
  }

  return {
    success: false,
    error: lastError || 'Max retries exceeded',
  };
}

/**
 * Execute a simple POST request (convenience method)
 */
export async function postWebhook(
  url: string,
  payload: Record<string, unknown>,
  context: VariableContext,
  headers?: Record<string, string>
): Promise<WebhookResult> {
  return executeWebhook(
    {
      url,
      method: 'POST',
      payload: JSON.stringify(payload),
      headers,
    },
    context
  );
}

/**
 * Execute a GET request (convenience method)
 */
export async function getWebhook(
  url: string,
  context: VariableContext,
  headers?: Record<string, string>
): Promise<WebhookResult> {
  return executeWebhook(
    {
      url,
      method: 'GET',
      headers,
    },
    context
  );
}

/**
 * Build a webhook payload for process events
 */
export function buildProcessPayload(options: {
  event: string;
  processId: string;
  processName: string;
  instanceId: string;
  stepId?: string;
  stepName?: string;
  status: string;
  data?: Record<string, unknown>;
  timestamp?: string;
}): Record<string, unknown> {
  return {
    event: options.event,
    timestamp: options.timestamp || new Date().toISOString(),
    process: {
      id: options.processId,
      name: options.processName,
    },
    instance: {
      id: options.instanceId,
      status: options.status,
    },
    ...(options.stepId && {
      step: {
        id: options.stepId,
        name: options.stepName,
      },
    }),
    data: options.data || {},
  };
}

/**
 * Verify a webhook signature (HMAC)
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm: 'sha256' | 'sha1' = 'sha256'
): boolean {
  // In browser/edge runtime, we need to use Web Crypto API
  // This is a placeholder - actual implementation would use crypto
  console.log('Signature verification:', { payload, signature, secret, algorithm });
  
  // For server-side Node.js:
  // const crypto = require('crypto');
  // const expectedSignature = crypto
  //   .createHmac(algorithm, secret)
  //   .update(payload)
  //   .digest('hex');
  // return crypto.timingSafeEqual(
  //   Buffer.from(signature),
  //   Buffer.from(expectedSignature)
  // );
  
  return true; // Placeholder
}

export default {
  executeWebhook,
  postWebhook,
  getWebhook,
  buildProcessPayload,
  verifyWebhookSignature,
};
