/**
 * ProcessCore Integrations
 * 
 * Central export for all integration functionality
 */

// Action executors
export { executeAction, executeTriggerActions, validateActionConfig, getActionInfo, listSupportedActions } from './ActionExecutor';

// Individual actions
export { sendEmail, buildEmailTemplate, EMAIL_TEMPLATES } from './EmailAction';
export { postToSlack, buildProcessBlock, SLACK_TEMPLATES } from './SlackAction';
export { executeWebhook, postWebhook, getWebhook, buildProcessPayload, verifyWebhookSignature } from './GenericWebhook';

// Variable resolution
export { 
  resolveVariable, 
  resolveTemplate, 
  resolveObject, 
  extractVariables, 
  validateVariables,
  createDefaultContext,
  VariableResolver,
} from './VariableResolver';
