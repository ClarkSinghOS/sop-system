'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AIContext as AIContextType, AIMessage, AISuggestion, AIChatResponse } from '@/types/ai';
import { Process, ProcessStep } from '@/types/process';

interface AIContextValue {
  // Chat state
  messages: AIMessage[];
  isLoading: boolean;
  isOpen: boolean;
  
  // Context awareness
  context: AIContextType;
  suggestions: AISuggestion[];
  
  // Actions
  sendMessage: (message: string) => Promise<AIChatResponse | null>;
  setContext: (ctx: Partial<AIContextType>) => void;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  clearMessages: () => void;
  dismissSuggestion: (id: string) => void;
  
  // Process awareness
  currentProcess: Process | null;
  currentStep: ProcessStep | null;
  setCurrentProcess: (process: Process | null) => void;
  setCurrentStep: (step: ProcessStep | null) => void;
}

const AIContextProvider = createContext<AIContextValue | undefined>(undefined);

interface AIProviderProps {
  children: ReactNode;
  initialProcess?: Process | null;
}

export function AIProvider({ children, initialProcess = null }: AIProviderProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContextState] = useState<AIContextType>({});
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [currentProcess, setCurrentProcess] = useState<Process | null>(initialProcess);
  const [currentStep, setCurrentStep] = useState<ProcessStep | null>(null);

  const setContext = useCallback((ctx: Partial<AIContextType>) => {
    setContextState(prev => ({ ...prev, ...ctx }));
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const dismissSuggestion = useCallback((id: string) => {
    setSuggestions(prev => 
      prev.map(s => s.id === id ? { ...s, dismissed: true } : s)
    );
  }, []);

  const sendMessage = useCallback(async (message: string): Promise<AIChatResponse | null> => {
    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context: {
            ...context,
            currentProcessId: currentProcess?.processId,
            currentStepId: currentStep?.stepId,
          },
          conversationHistory: messages.slice(-10), // Last 10 messages for context
          processData: currentProcess, // Send current process for analysis
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data: AIChatResponse = await response.json();

      const assistantMessage: AIMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        intent: data.intent,
        entities: data.entities,
        action: data.action,
        suggestions: data.suggestions,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update suggestions if provided
      if (data.suggestions && data.suggestions.length > 0) {
        // Create quick action suggestions
        const newSuggestions: AISuggestion[] = data.suggestions.slice(0, 3).map((s, i) => ({
          id: `sug-${Date.now()}-${i}`,
          type: 'tip' as const,
          title: 'Quick Action',
          description: s,
          priority: 'low' as const,
        }));
        setSuggestions(prev => [...prev.filter(s => !s.dismissed), ...newSuggestions].slice(-5));
      }

      return data;
    } catch (error) {
      console.error('AI chat error:', error);
      
      const errorMessage: AIMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context, currentProcess, currentStep, messages]);

  const value: AIContextValue = {
    messages,
    isLoading,
    isOpen,
    context,
    suggestions,
    sendMessage,
    setContext,
    toggleChat,
    openChat,
    closeChat,
    clearMessages,
    dismissSuggestion,
    currentProcess,
    currentStep,
    setCurrentProcess,
    setCurrentStep,
  };

  return (
    <AIContextProvider.Provider value={value}>
      {children}
    </AIContextProvider.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContextProvider);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}

export default AIProvider;
