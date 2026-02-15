'use client';

import React, { useState, useEffect } from 'react';
import { useAI } from '@/contexts/AIContext';
import { ChatWindow } from './ChatWindow';

export function AIAssistant() {
  const { isOpen, toggleChat, messages, suggestions } = useAI();
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Track new messages
  useEffect(() => {
    if (messages.length > 0 && !isOpen) {
      setHasNewMessage(true);
    }
  }, [messages, isOpen]);
  
  // Clear notification when opened
  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false);
    }
  }, [isOpen]);
  
  // Show tooltip on first visit
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('ai-assistant-tooltip-seen');
    if (!hasSeenTooltip) {
      setTimeout(() => {
        setShowTooltip(true);
        localStorage.setItem('ai-assistant-tooltip-seen', 'true');
        setTimeout(() => setShowTooltip(false), 5000);
      }, 2000);
    }
  }, []);
  
  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleChat();
      }
      if (e.key === 'Escape' && isOpen) {
        toggleChat();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleChat, isOpen]);
  
  // Active suggestions count
  const activeSuggestions = suggestions.filter(s => !s.dismissed).length;
  
  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-fade-in"
            onClick={toggleChat}
          />
          
          {/* Chat Window */}
          <div className="fixed bottom-6 right-6 w-[420px] h-[600px] max-h-[80vh] z-50">
            <ChatWindow onClose={toggleChat} />
          </div>
        </>
      )}
      
      {/* Floating Chat Bubble */}
      <div className="fixed bottom-6 right-6 z-30">
        {/* Tooltip */}
        {showTooltip && !isOpen && (
          <div className="absolute bottom-full right-0 mb-3 w-64 p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] shadow-xl animate-slide-up">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                  Need help?
                </h4>
                <p className="text-xs text-[var(--text-tertiary)]">
                  I'm your AI assistant. Ask me about processes, timing, owners, and more!
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute top-2 right-2 p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* Arrow */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-[var(--bg-elevated)] border-r border-b border-[var(--border-default)] transform rotate-45" />
          </div>
        )}
        
        {/* Chat Button */}
        <button
          onClick={toggleChat}
          className={`
            group relative w-14 h-14 rounded-full
            bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)]
            shadow-lg shadow-[var(--accent-cyan)]/30
            hover:shadow-xl hover:shadow-[var(--accent-cyan)]/40
            hover:scale-110 active:scale-95
            transition-all duration-300 ease-out
            ${isOpen ? 'rotate-90 scale-95' : ''}
          `}
          title="AI Assistant (⌘K)"
        >
          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isOpen ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            )}
          </div>
          
          {/* Notification Badge */}
          {(hasNewMessage || activeSuggestions > 0) && !isOpen && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent-orange)] text-white text-xs font-bold flex items-center justify-center animate-bounce">
              {activeSuggestions > 0 ? activeSuggestions : '!'}
            </span>
          )}
          
          {/* Pulse Effect */}
          <span className={`
            absolute inset-0 rounded-full
            bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)]
            opacity-0 group-hover:opacity-30
            animate-ping pointer-events-none
          `} />
        </button>
        
        {/* Keyboard Hint */}
        <div className="absolute -left-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="px-2 py-1 rounded bg-[var(--bg-elevated)] text-[10px] text-[var(--text-tertiary)] font-mono">
            ⌘K
          </span>
        </div>
      </div>
    </>
  );
}

export default AIAssistant;
