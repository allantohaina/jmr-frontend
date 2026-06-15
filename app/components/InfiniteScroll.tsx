'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Skeleton } from './Skeleton';

interface InfiniteScrollProps<T> {
  loadMore: (page: number) => Promise<T[]>;
  initialItems?: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  renderSkeleton?: () => React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  itemsPerPage?: number;
}

export function InfiniteScroll<T>({
  loadMore,
  initialItems = [],
  renderItem,
  renderSkeleton = () => <Skeleton height="120px" className="mb-4" />,
  threshold = 0.1,
  rootMargin = "100px",
  itemsPerPage = 20
}: InfiniteScrollProps<T>) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const observerTarget = useRef<HTMLDivElement>(null);
  
  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      const newItems = await loadMore(page + 1);
      
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...newItems]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, loadMore, page]);
  
  useEffect(() => {
    if (typeof window === 'undefined' || !observerTarget.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          handleLoadMore();
        }
      },
      { threshold, rootMargin }
    );
    
    observer.observe(observerTarget.current);
    
    return () => {
      observer.disconnect();
    };
  }, [handleLoadMore, hasMore, isLoading, rootMargin, threshold]);
  
  return (
    <div className="w-full">
      {items.map((item, index) => renderItem(item, index))}
      
      {isLoading && (
        <div className="space-y-2 mt-4">
          {[...Array(3)].map((_, i) => (
            <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>
          ))}
        </div>
      )}
      
      {!hasMore && items.length > 0 && (
        <p className="text-[#eccc90]/40 text-center py-8 text-xs uppercase tracking-[0.2em]">
          Plus d'éléments
        </p>
      )}
      
      <div ref={observerTarget} className="h-1" />
    </div>
  );
}
