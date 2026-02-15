'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface SwipeableDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[]; // Heights as percentages (e.g., [30, 60, 95])
  initialSnap?: number; // Index of initial snap point
}

export default function SwipeableDrawer({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [40, 85],
  initialSnap = 0,
}: SwipeableDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const currentHeight = snapPoints[currentSnap];

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    startY.current = e.touches[0].clientY;
    startHeight.current = currentHeight;
  }, [currentHeight]);

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const deltaY = startY.current - e.touches[0].clientY;
    const deltaPercent = (deltaY / window.innerHeight) * 100;
    setDragOffset(deltaPercent);
  }, [isDragging]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    const newHeight = startHeight.current + dragOffset;
    
    // Find closest snap point
    let closestSnap = 0;
    let closestDistance = Math.abs(snapPoints[0] - newHeight);
    
    for (let i = 1; i < snapPoints.length; i++) {
      const distance = Math.abs(snapPoints[i] - newHeight);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestSnap = i;
      }
    }

    // If dragged below minimum, close
    if (newHeight < snapPoints[0] - 15) {
      onClose();
    } else {
      setCurrentSnap(closestSnap);
    }
    
    setDragOffset(0);
  }, [isDragging, dragOffset, snapPoints, onClose]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setCurrentSnap(initialSnap);
      setDragOffset(0);
    }
  }, [isOpen, initialSnap]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const displayHeight = isDragging 
    ? Math.max(20, Math.min(95, startHeight.current + dragOffset))
    : currentHeight;

  return (
    <div className="fixed inset-0 z-[100] md:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`absolute inset-x-0 bottom-0 bg-[var(--bg-secondary)] rounded-t-3xl border-t border-x border-[var(--border-default)] shadow-2xl flex flex-col ${
          isDragging ? '' : 'transition-all duration-300 ease-out'
        }`}
        style={{ 
          height: `${displayHeight}%`,
          maxHeight: 'calc(100% - env(safe-area-inset-top) - 20px)'
        }}
      >
        {/* Drag Handle */}
        <div
          ref={handleRef}
          className="flex-shrink-0 pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 bg-[var(--border-strong)] rounded-full mx-auto" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex-shrink-0 px-4 pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>

        {/* Safe area padding */}
        <div className="flex-shrink-0 h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}
