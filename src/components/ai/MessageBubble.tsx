'use client';

import React from 'react';
import { AIMessage } from '@/types/ai';

interface MessageBubbleProps {
  message: AIMessage;
  onSuggestionClick?: (suggestion: string) => void;
}

export function MessageBubble({ message, onSuggestionClick }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    // Split by newlines first
    const lines = content.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Headers
      if (line.startsWith('## ')) {
        return (
          <h3 key={lineIndex} className="text-base font-semibold text-[var(--text-primary)] mt-3 mb-2 first:mt-0">
            {line.replace('## ', '')}
          </h3>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h4 key={lineIndex} className="text-sm font-medium text-[var(--text-primary)] mt-2 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      
      // List items
      if (line.startsWith('• ') || line.startsWith('- ')) {
        const text = line.replace(/^[•-]\s*/, '');
        return (
          <div key={lineIndex} className="flex items-start gap-2 ml-2 my-0.5">
            <span className="text-[var(--accent-cyan)] mt-1">•</span>
            <span>{renderInlineFormatting(text)}</span>
          </div>
        );
      }
      
      // Numbered list
      const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
      if (numberedMatch) {
        return (
          <div key={lineIndex} className="flex items-start gap-2 ml-2 my-0.5">
            <span className="text-[var(--accent-lime)] font-mono text-xs min-w-[1.5rem]">{numberedMatch[1]}.</span>
            <span>{renderInlineFormatting(numberedMatch[2])}</span>
          </div>
        );
      }
      
      // Indented help text (starts with spaces and _)
      if (line.match(/^\s+_.*_$/)) {
        return (
          <p key={lineIndex} className="text-xs text-[var(--text-tertiary)] italic ml-8 my-0.5">
            {line.trim().replace(/^_|_$/g, '')}
          </p>
        );
      }
      
      // Empty line
      if (line.trim() === '') {
        return <div key={lineIndex} className="h-2" />;
      }
      
      // Regular paragraph
      return (
        <p key={lineIndex} className="my-1">
          {renderInlineFormatting(line)}
        </p>
      );
    });
  };
  
  // Render bold and italic text
  const renderInlineFormatting = (text: string) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Match **bold**, *italic*, and _italic_
    const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(_(.+?)_)/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      
      // Bold
      if (match[1]) {
        parts.push(
          <strong key={match.index} className="font-semibold text-[var(--text-primary)]">
            {match[2]}
          </strong>
        );
      }
      // Italic (with asterisks)
      else if (match[3]) {
        parts.push(
          <em key={match.index} className="italic text-[var(--text-secondary)]">
            {match[4]}
          </em>
        );
      }
      // Italic (with underscores)
      else if (match[5]) {
        parts.push(
          <em key={match.index} className="italic text-[var(--text-secondary)]">
            {match[6]}
          </em>
        );
      }
      
      lastIndex = regex.lastIndex;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 animate-fade-in`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : ''}`}>
        {/* Avatar */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xs text-[var(--text-tertiary)]">ProcessCore AI</span>
          </div>
        )}
        
        {/* Message bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-[var(--accent-cyan)] text-black rounded-br-md'
              : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-bl-md'
          }`}
        >
          {renderContent(message.content)}
        </div>
        
        {/* Suggestion chips for AI messages */}
        {!isUser && message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="px-3 py-1.5 text-xs rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--accent-cyan)]/20 hover:text-[var(--accent-cyan)] border border-[var(--border-subtle)] transition-all hover:border-[var(--accent-cyan)]/50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        
        {/* Timestamp */}
        <div className={`text-[10px] text-[var(--text-tertiary)] mt-1 ${isUser ? 'text-right' : ''}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
