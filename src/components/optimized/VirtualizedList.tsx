/**
 * Virtualized list component for handling large datasets efficiently
 */
import React, { 
  memo, 
  useState, 
  useEffect, 
  useCallback, 
  useMemo,
  useRef,
  CSSProperties,
} from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  overscan?: number;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  className?: string;
  loading?: boolean;
}

/**
 * Calculate visible range based on scroll position
 */
function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  itemCount: number,
  overscan: number = 3
) {
  const start = Math.floor(scrollTop / itemHeight);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const end = start + visibleCount;

  // Add overscan items
  const startWithOverscan = Math.max(0, start - overscan);
  const endWithOverscan = Math.min(itemCount - 1, end + overscan);

  return {
    start: startWithOverscan,
    end: endWithOverscan,
    visibleStart: start,
    visibleEnd: end,
  };
}

/**
 * Default loading skeleton component
 */
const DefaultLoadingComponent = memo(() => (
  <div className="p-4 space-y-3">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-4 w-2/3" />
  </div>
));

DefaultLoadingComponent.displayName = 'DefaultLoadingComponent';

/**
 * Default empty state component
 */
const DefaultEmptyComponent = memo(() => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
      <span className="text-2xl">📋</span>
    </div>
    <h3 className="text-lg font-semibold text-heading mb-2">No items found</h3>
    <p className="text-body text-sm max-w-sm">
      There are no items to display at the moment.
    </p>
  </div>
));

DefaultEmptyComponent.displayName = 'DefaultEmptyComponent';

/**
 * Virtualized list component for performance optimization
 */
export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  keyExtractor,
  loadingComponent = <DefaultLoadingComponent />,
  emptyComponent = <DefaultEmptyComponent />,
  overscan = 3,
  onEndReached,
  onEndReachedThreshold = 0.8,
  className,
  loading = false,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);
  const lastEndReachedScrollTop = useRef(0);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    return calculateVisibleRange(
      scrollTop,
      containerHeight,
      itemHeight,
      items.length,
      overscan
    );
  }, [scrollTop, containerHeight, itemHeight, items.length, overscan]);

  // Get visible items
  const visibleItems = useMemo(() => {
    const result = [];
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      if (items[i]) {
        result.push({
          item: items[i],
          index: i,
          key: keyExtractor(items[i], i),
        });
      }
    }
    return result;
  }, [items, visibleRange, keyExtractor]);

  // Total height of all items
  const totalHeight = items.length * itemHeight;

  // Offset for visible items
  const offsetY = visibleRange.start * itemHeight;

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    
    // Set scrolling state
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);

    // Check for end reached
    if (onEndReached && items.length > 0) {
      const { scrollHeight, clientHeight } = event.currentTarget;
      const threshold = scrollHeight * onEndReachedThreshold;
      
      if (
        newScrollTop + clientHeight >= threshold &&
        newScrollTop > lastEndReachedScrollTop.current
      ) {
        lastEndReachedScrollTop.current = newScrollTop;
        onEndReached();
      }
    }
  }, [onEndReached, onEndReachedThreshold, items.length]);

  // Cleanup scroll timeout
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Reset scroll position when items change significantly
  useEffect(() => {
    if (containerRef.current && items.length === 0) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [items.length]);

  // Render loading state
  if (loading && items.length === 0) {
    return (
      <div className={cn('w-full', className)} style={{ height: containerHeight }}>
        {loadingComponent}
      </div>
    );
  }

  // Render empty state
  if (!loading && items.length === 0) {
    return (
      <div className={cn('w-full', className)} style={{ height: containerHeight }}>
        {emptyComponent}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'w-full overflow-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent',
        className
      )}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Virtual spacer */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map(({ item, index, key }) => (
            <div
              key={key}
              style={{
                height: itemHeight,
                overflow: 'hidden',
              }}
              className={cn(
                'transition-opacity duration-200',
                isScrolling ? 'opacity-80' : 'opacity-100'
              )}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>

      {/* Loading indicator for pagination */}
      {loading && items.length > 0 && (
        <div className="p-4 flex justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

export default memo(VirtualizedList) as typeof VirtualizedList;