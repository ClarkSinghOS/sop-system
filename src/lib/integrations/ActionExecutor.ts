/**
 * ActionExecutor - Central executor for all integration actions
 * 
 * Orchestrates:
 * - Action routing based on type
 * - Variable resolution
 * - Error handling
 * - Logging/audit trail
 */

import {
  ActionType,
  ActionConfig,
  ActionExecution,
  TriggerAction,
  VariableContext,
  SUPPORTED_ACTIONS,
} from '@/types/integrations';
import { sendEmail } from './EmailAction';
import { postToSlack } from './SlackAction';
import { executeWebhook } from './GenericWebhook';
import { resolveTemplate, createDefaultContext } from './VariableResolver';

interface ExecutionResult {
  success: boolean;
  output?: Record<string, unknown>;
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
  durationMs: number;
}

/**
 * Execute a single action
 */
export async function executeAction(
  actionType: ActionType,
  config: ActionConfig,
  context: VariableContext
): Promise<ExecutionResult> {
  const startTime = Date.now();

  // Ensure we have default context values
  const fullContext = {
    ...createDefaultContext(),
    ...context,
  };

  try {
    switch (actionType) {
      case 'send_email': {
        const result = await sendEmail(config, fullContext);
        return {
          success: result.success,
          output: result.success ? { messageId: result.messageId } : undefined,
          error: result.error ? { message: result.error } : undefined,
          durationMs: Date.now() - startTime,
        };
      }

      case 'slack_message': {
        const result = await postToSlack(config, fullContext);
        return {
          success: result.success,
          error: result.error ? { message: result.error } : undefined,
          durationMs: Date.now() - startTime,
        };
      }

      case 'webhook':
      case 'http_request': {
        const result = await executeWebhook(config, fullContext);
        return {
          success: result.success,
          output: result.response ? { response: result.response, statusCode: result.statusCode } : undefined,
          error: result.error ? { message: result.error } : undefined,
          durationMs: result.durationMs || Date.now() - startTime,
        };
      }

      case 'create_task': {
        // Placeholder - would integrate with ClickUp/Asana/Jira
        console.log('Creating task:', {
          title: resolveTemplate(config.taskTitle || '', fullContext),
          description: resolveTemplate(config.taskDescription || '', fullContext),
          assignee: resolveTemplate(config.assignee || '', fullContext),
          priority: config.priority,
        });
        
        return {
          success: true,
          output: { taskId: `task_${Date.now()}`, status: 'created' },
          durationMs: Date.now() - startTime,
        };
      }

      case 'update_crm': {
        // Placeholder - would integrate with HubSpot/Salesforce/Pipedrive
        console.log('Updating CRM:', {
          entity: config.crmEntity,
          action: config.crmAction,
          fields: config.crmFields,
        });

        return {
          success: true,
          output: { crmId: config.crmId || `crm_${Date.now()}`, action: config.crmAction },
          durationMs: Date.now() - startTime,
        };
      }

      case 'log': {
        const message = resolveTemplate(config.message || '', fullContext);
        console.log('[ProcessCore Action Log]', message);
        
        return {
          success: true,
          output: { logged: message },
          durationMs: Date.now() - startTime,
        };
      }

      case 'delay': {
        const delayMs = config.delayMs || 1000;
        await new Promise(resolve => setTimeout(resolve, delayMs));
        
        return {
          success: true,
          output: { delayedMs: delayMs },
          durationMs: Date.now() - startTime,
        };
      }

      case 'transform_data': {
        // Simple variable transformation
        const script = config.transformScript || '';
        const outputVar = config.outputVariable || 'result';
        
        // For safety, we only support simple expressions
        // A real implementation would use a sandboxed evaluator
        const result = resolveTemplate(script, fullContext);
        
        return {
          success: true,
          output: { [outputVar]: result },
          durationMs: Date.now() - startTime,
        };
      }

      default:
        return {
          success: false,
          error: { message: `Unknown action type: ${actionType}` },
          durationMs: Date.now() - startTime,
        };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      durationMs: Date.now() - startTime,
    };
  }
}

/**
 * Execute a sequence of trigger actions
 */
export async function executeTriggerActions(
  actions: TriggerAction[],
  context: VariableContext
): Promise<{
  executions: ActionExecution[];
  overallSuccess: boolean;
  failedAt?: string;
}> {
  const executions: ActionExecution[] = [];
  const sortedActions = [...actions].sort((a, b) => a.order - b.order);
  
  // Build up context with outputs from each action
  let runningContext = { ...context };

  for (const action of sortedActions) {
    const startedAt = new Date().toISOString();
    
    const execution: ActionExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      triggerId: '', // Will be set by caller
      actionId: action.id,
      actionType: action.type,
      status: 'running',
      startedAt,
      input: action.config as Record<string, unknown>,
      retryCount: 0,
    };

    const result = await executeAction(action.type, action.config, runningContext);

    execution.status = result.success ? 'success' : 'failed';
    execution.completedAt = new Date().toISOString();
    execution.durationMs = result.durationMs;
    execution.output = result.output;
    execution.error = result.error;

    executions.push(execution);

    // Add output to context for subsequent actions
    if (result.output) {
      runningContext = {
        ...runningContext,
        output: {
          ...(runningContext.output || {}),
          [action.id]: result.output,
        },
      };
    }

    // Handle failure
    if (!result.success) {
      if (action.onError === 'abort') {
        return {
          executions,
          overallSuccess: false,
          failedAt: action.id,
        };
      }
      // 'continue' or 'retry' - for now just continue
    }
  }

  const overallSuccess = executions.every(e => e.status === 'success');
  return { executions, overallSuccess };
}

/**
 * Validate action config has required fields
 */
export function validateActionConfig(
  actionType: ActionType,
  config: ActionConfig
): { valid: boolean; errors: string[] } {
  const actionDef = SUPPORTED_ACTIONS[actionType];
  if (!actionDef) {
    return { valid: false, errors: [`Unknown action type: ${actionType}`] };
  }

  const errors: string[] = [];

  for (const field of actionDef.requiredFields) {
    const value = config[field as keyof ActionConfig];
    if (value === undefined || value === null || value === '') {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get action metadata
 */
export function getActionInfo(actionType: ActionType) {
  return SUPPORTED_ACTIONS[actionType];
}

/**
 * List all supported actions
 */
export function listSupportedActions() {
  return Object.entries(SUPPORTED_ACTIONS).map(([type, info]) => ({
    type,
    ...info,
  }));
}

export default {
  executeAction,
  executeTriggerActions,
  validateActionConfig,
  getActionInfo,
  listSupportedActions,
};
