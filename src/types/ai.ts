// AI Assistant Types for ProcessCore

export type AIIntent = 
  | 'start_process'
  | 'find_process'
  | 'explain_step'
  | 'get_timing'
  | 'get_owner'
  | 'search_processes'
  | 'suggest_improvement'
  | 'get_next_step'
  | 'get_checklist'
  | 'general_question'
  | 'unknown';

export interface AIContext {
  currentProcessId?: string;
  currentStepId?: string;
  currentInstanceId?: string;
  viewMode?: string;
  recentActions?: string[];
}

export interface ExtractedEntity {
  type: 'person' | 'process' | 'step' | 'department' | 'time' | 'variable';
  value: string;
  confidence: number;
}

export interface AIAction {
  type: 'navigate' | 'create_instance' | 'filter' | 'highlight' | 'expand' | 'none';
  payload?: Record<string, unknown>;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  intent?: AIIntent;
  entities?: ExtractedEntity[];
  action?: AIAction;
  suggestions?: string[];
}

export interface AIChatRequest {
  message: string;
  context: AIContext;
  conversationHistory?: AIMessage[];
}

export interface AIChatResponse {
  message: string;
  intent: AIIntent;
  entities: ExtractedEntity[];
  action?: AIAction;
  suggestions: string[];
  confidence: number;
  data?: Record<string, unknown>;
}

export interface AISuggestion {
  id: string;
  type: 'automation' | 'improvement' | 'warning' | 'tip';
  title: string;
  description: string;
  stepId?: string;
  actionLabel?: string;
  priority: 'low' | 'medium' | 'high';
  dismissed?: boolean;
}

export interface AIAnalysis {
  processId: string;
  suggestions: AISuggestion[];
  bottlenecks: Array<{
    stepId: string;
    reason: string;
    impact: string;
  }>;
  automationOpportunities: Array<{
    stepId: string;
    currentLevel: string;
    potentialLevel: string;
    effort: string;
    savings: string;
  }>;
}
