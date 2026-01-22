import React, { useRef, useEffect, useMemo } from 'react';

interface PickerProps {
  items: (string | number)[];
  value: string | number;
  onChange: (value: any) => void;
  label?: string;
}

export const Picker: React.FC<PickerProps> = ({ items, value, onChange, label }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const scrollTimeout = useRef<number | null>(null);

  const ITEM_HEIGHT = 32; // Matches h-8 class (2rem)
  const COPIES = 21; 

  const extendedItems = useMemo(() => {
    let res: (string | number)[] = [];
    for (let i = 0; i < COPIES; i++) {
      res = res.concat(items);
    }
    return res;
  }, [items]);

  const itemLength = items.length;
  const loopHeight = itemLength * ITEM_HEIGHT;
  const centerSetIndex = Math.floor(COPIES / 2);
  const centerSetTop = centerSetIndex * loopHeight;

  // Initialize scroll position to center
  useEffect(() => {
    if (containerRef.current) {
        // Find the specific item index to align
        const valIndex = items.indexOf(value);
        const offset = valIndex !== -1 ? valIndex * ITEM_HEIGHT : 0;
        containerRef.current.scrollTop = centerSetTop + offset;
    }
  }, []); // Run once on mount

  // Handle external value changes (only when not scrolling)
  useEffect(() => {
    if (isScrolling.current || !containerRef.current) return;
    
    // Check if we are already aligned visually to this value
    const currentScroll = containerRef.current.scrollTop;
    const currentIndex = Math.round(currentScroll / ITEM_HEIGHT) % itemLength;
    if (items[currentIndex] === value) return;

    const index = items.indexOf(value);
    if (index !== -1) {
        // Smooth scroll to value
        containerRef.current.scrollTo({
            top: centerSetTop + (index * ITEM_HEIGHT),
            behavior: 'smooth'
        });
    }
  }, [value, items, centerSetTop, itemLength]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    isScrolling.current = true;

    const container = containerRef.current;
    let scrollTop = container.scrollTop;

    // Infinite Scroll Reset:
    // If we drift more than 1 loop height away from the center set, jump back instantly.
    if (Math.abs(scrollTop - centerSetTop) >= loopHeight) {
       const offset = scrollTop % loopHeight;
       scrollTop = centerSetTop + offset;
       container.scrollTop = scrollTop;
    }

    if (scrollTimeout.current) {
      window.clearTimeout(scrollTimeout.current);
    }

    // Debounce to detect scroll end
    scrollTimeout.current = window.setTimeout(() => {
      isScrolling.current = false;
      
      // Calculate selected item based on final snap position
      const finalScrollTop = containerRef.current?.scrollTop || 0;
      const index = Math.round(finalScrollTop / ITEM_HEIGHT);
      const wrappedIndex = index % itemLength;
      
      // Handle negative modulo result just in case
      const safeIndex = wrappedIndex < 0 ? wrappedIndex + itemLength : wrappedIndex;
      
      const newValue = items[safeIndex];
      
      if (newValue !== undefined && newValue !== value) {
        onChange(newValue);
      }
    }, 100);
  };

  const handleClick = (indexInExtended: number) => {
    if (!containerRef.current) return;
    const targetTop = indexInExtended * ITEM_HEIGHT;
    containerRef.current.scrollTo({ top: targetTop, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col items-center">
      {label && <span className="text-[10px] font-bold text-text-secondary-light uppercase mb-1">{label}</span>}
      <div className="relative h-32 w-16 bg-background-light dark:bg-background-dark/50 rounded-lg border border-border-light dark:border-border-dark group select-none">
        
        {/* Selection Indicator (No Blur) */}
        <div className="absolute top-12 left-0 right-0 h-8 bg-primary/5 dark:bg-primary/20 border-y border-primary/20 pointer-events-none z-10"></div>
        
        {/* Gradients */}
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-surface-light dark:from-surface-dark to-transparent pointer-events-none z-20 opacity-90"></div>
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-surface-light dark:from-surface-dark to-transparent pointer-events-none z-20 opacity-90"></div>
        
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto no-scrollbar snap-y snap-mandatory py-12 relative z-0"
        >
          {extendedItems.map((item, i) => (
            <div 
              key={i}
              onClick={() => handleClick(i)}
              className={`h-8 flex items-center justify-center text-xs font-bold snap-center cursor-pointer transition-all duration-200 ${
                item === value 
                  ? 'text-primary scale-125 opacity-100' 
                  : 'text-text-secondary-light hover:text-text-main-light dark:hover:text-text-main-dark opacity-40 scale-90'
              }`}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};