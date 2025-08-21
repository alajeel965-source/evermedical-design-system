/**
 * Performance-optimized card component with lazy loading and memoization
 */
import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Analytics } from '@/lib/api';

interface PerformantCardProps {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  badges?: Array<{
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  }>;
  actions?: Array<{
    label: string;
    variant?: 'default' | 'secondary' | 'outline' | 'ghost';
    onClick: () => void;
    loading?: boolean;
  }>;
  metadata?: Record<string, any>;
  className?: string;
  lazy?: boolean;
  onVisible?: (id: string) => void;
}

/**
 * Lazy-loaded image component with placeholder
 */
const LazyImage = memo(({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setError(true);
  }, []);

  if (error) {
    return (
      <div className={cn('bg-muted flex items-center justify-center', className)}>
        <span className="text-muted-foreground text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {!loaded && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
        loading="lazy"
      />
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

/**
 * Performance-optimized card component
 */
export const PerformantCard = memo<PerformantCardProps>(({
  id,
  title,
  description,
  imageUrl,
  badges = [],
  actions = [],
  metadata,
  className,
  lazy = true,
  onVisible,
}) => {
  const [isVisible, setIsVisible] = useState(!lazy);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          onVisible?.(id);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isVisible, id, onVisible]);

  // Track card interactions
  const handleCardClick = useCallback(() => {
    Analytics.trackEvent('card_clicked', {
      cardId: id,
      cardType: 'performant_card',
      metadata,
    });
  }, [id, metadata]);

  const handleActionClick = useCallback((action: any, index: number) => {
    Analytics.trackEvent('card_action_clicked', {
      cardId: id,
      actionIndex: index,
      actionLabel: action.label,
      metadata,
    });
    action.onClick();
  }, [id, metadata]);

  // Render placeholder if not visible yet
  if (!isVisible) {
    return (
      <Card ref={cardRef} className={cn('h-64', className)}>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-8 w-20" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'group hover:shadow-medical transition-all duration-300 cursor-pointer',
        'transform hover:-translate-y-1',
        className
      )}
      onClick={handleCardClick}
    >
      {imageUrl && (
        <div className="aspect-video relative overflow-hidden rounded-t-medical-sm">
          <LazyImage
            src={imageUrl}
            alt={title}
            className="w-full h-full"
          />
          {badges.length > 0 && (
            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
              {badges.slice(0, 2).map((badge, index) => (
                <Badge
                  key={index}
                  variant={badge.variant || 'default'}
                  className="text-xs backdrop-blur-sm bg-background/80"
                >
                  {badge.label}
                </Badge>
              ))}
              {badges.length > 2 && (
                <Badge 
                  variant="secondary" 
                  className="text-xs backdrop-blur-sm bg-background/80"
                >
                  +{badges.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-2">
        <h3 className="font-semibold text-heading line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        {!imageUrl && badges.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {badges.slice(0, 3).map((badge, index) => (
              <Badge
                key={index}
                variant={badge.variant || 'default'}
                className="text-xs"
              >
                {badge.label}
              </Badge>
            ))}
            {badges.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{badges.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      {description && (
        <CardContent className="pt-0">
          <p className="text-body text-sm line-clamp-3">
            {description}
          </p>
        </CardContent>
      )}

      {actions.length > 0 && (
        <CardFooter className="pt-4 gap-2">
          {actions.slice(0, 2).map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'default'}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleActionClick(action, index);
              }}
              disabled={action.loading}
              className="flex-1"
            >
              {action.loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                action.label
              )}
            </Button>
          ))}
          {actions.length > 2 && (
            <Button
              variant="outline"
              size="sm"
              className="px-2"
              onClick={(e) => {
                e.stopPropagation();
                Analytics.trackEvent('card_more_actions_clicked', {
                  cardId: id,
                  totalActions: actions.length,
                });
              }}
            >
              +{actions.length - 2}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
});

PerformantCard.displayName = 'PerformantCard';

export default PerformantCard;