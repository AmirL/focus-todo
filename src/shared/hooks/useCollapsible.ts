import { useState, useEffect, useRef } from 'react';

export function useCollapsible() {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    setIsExpanded(!isExpanded);
  };

  const expand = () => {
    setIsExpanded(true);
  };

  const collapse = () => {
    setIsExpanded(false);
  };

  // Auto-collapse when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Don't collapse if clicking inside a dialog
        const target = event.target as Element;
        if (target.closest('[data-radix-popper-content-wrapper]') || 
            target.closest('[role="dialog"]') || 
            target.closest('[data-state="open"]')) {
          return;
        }
        collapse();
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  return {
    isExpanded,
    containerRef,
    toggle,
    expand,
    collapse,
  };
}