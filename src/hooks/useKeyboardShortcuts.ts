'use client';

import { useEffect, useCallback } from 'react';

export interface Shortcut {
  key: string;
  description: string;
  keys: string[];
  action: () => void;
  enabled?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: Shortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Escape to work even in inputs
        if (event.key !== 'Escape') {
          return;
        }
      }

      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;

        const keys = shortcut.keys;
        const modifiers = {
          meta: keys.includes('meta') || keys.includes('cmd'),
          ctrl: keys.includes('ctrl'),
          alt: keys.includes('alt'),
          shift: keys.includes('shift'),
        };

        const key = keys.find(
          (k) => !['meta', 'cmd', 'ctrl', 'alt', 'shift'].includes(k.toLowerCase())
        );

        if (!key) continue;

        const keyMatches = event.key.toLowerCase() === key.toLowerCase() ||
          event.code.toLowerCase() === `key${key.toLowerCase()}` ||
          event.code.toLowerCase() === key.toLowerCase();

        const modifiersMatch =
          event.metaKey === modifiers.meta &&
          event.ctrlKey === modifiers.ctrl &&
          event.altKey === modifiers.alt &&
          event.shiftKey === modifiers.shift;

        // For Mac, also check cmd vs ctrl
        const cmdOrCtrl = (event.metaKey || event.ctrlKey) && (modifiers.meta || modifiers.ctrl);
        const modifiersMatchWithCmdCtrl =
          cmdOrCtrl &&
          event.altKey === modifiers.alt &&
          event.shiftKey === modifiers.shift;

        if (keyMatches && (modifiersMatch || modifiersMatchWithCmdCtrl)) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Format shortcut keys for display
export function formatShortcutKeys(keys: string[]): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');
  
  return keys
    .map((key) => {
      const lower = key.toLowerCase();
      if (lower === 'meta' || lower === 'cmd') return isMac ? '⌘' : 'Ctrl';
      if (lower === 'ctrl') return isMac ? '⌃' : 'Ctrl';
      if (lower === 'alt') return isMac ? '⌥' : 'Alt';
      if (lower === 'shift') return '⇧';
      if (lower === 'enter') return '↵';
      if (lower === 'escape' || lower === 'esc') return 'Esc';
      if (lower === 'arrowup') return '↑';
      if (lower === 'arrowdown') return '↓';
      if (lower === 'arrowleft') return '←';
      if (lower === 'arrowright') return '→';
      return key.toUpperCase();
    })
    .join(' + ');
}
