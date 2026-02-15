'use client';

import { useRef, useCallback } from 'react';

interface LongPressConfig {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number; // Milliseconds to trigger long press
  enabled?: boolean;
}

export function useLongPress({
  onLongPress,
  onClick,
  delay = 500,
  enabled = true,
}: LongPressConfig) {
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const target = useRef<EventTarget | null>(null);
  const isLongPress = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const start = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    if (!enabled) return;
    
    // Store initial position
    if ('touches' in event) {
      startPos.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
    } else {
      startPos.current = {
        x: event.clientX,
        y: event.clientY,
      };
    }

    isLongPress.current = false;
    target.current = event.target;

    timeout.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress();
      
      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, delay);
  }, [enabled, delay, onLongPress]);

  const move = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    if (!timeout.current) return;
    
    // Get current position
    let currentX: number, currentY: number;
    if ('touches' in event) {
      currentX = event.touches[0].clientX;
      currentY = event.touches[0].clientY;
    } else {
      currentX = event.clientX;
      currentY = event.clientY;
    }
    
    // Cancel if moved too far (10px threshold)
    const deltaX = Math.abs(currentX - startPos.current.x);
    const deltaY = Math.abs(currentY - startPos.current.y);
    
    if (deltaX > 10 || deltaY > 10) {
      clear();
    }
  }, []);

  const clear = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (!isLongPress.current && onClick) {
      onClick();
    }
  }, [onClick]);

  return {
    onTouchStart: start,
    onTouchMove: move,
    onTouchEnd: clear,
    onTouchCancel: clear,
    onMouseDown: start,
    onMouseMove: move,
    onMouseUp: clear,
    onMouseLeave: clear,
    onClick: handleClick,
  };
}

export default useLongPress;
