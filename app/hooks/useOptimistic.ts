'use client';

import { useState, useCallback, useRef } from 'react';

interface UseOptimisticOptions<T, TResult = unknown> {
  initialData: T;
  onError?: (error: Error, rollbackData: T) => void;
  onSuccess?: (result: TResult) => void;
}

export function useOptimistic<T, TResult = unknown>({
  initialData,
  onError,
  onSuccess
}: UseOptimisticOptions<T, TResult>) {
  const [data, setData] = useState<T>(initialData);
  const pendingActionsRef = useRef<Set<string>>(new Set());
  const historyRef = useRef<T[]>([initialData]);

  const updateOptimistic = useCallback((
    newState: T | ((prev: T) => T),
    asyncAction: () => Promise<TResult>
  ) => {
    const previousState = data;
    const updatedState = typeof newState === 'function' 
      ? (newState as (prev: T) => T)(data) 
      : newState;
      
    setData(updatedState);
    historyRef.current.push(updatedState);
    
    const actionId = crypto.randomUUID();
    pendingActionsRef.current.add(actionId);
    
    asyncAction()
      .then((result) => {
        onSuccess?.(result);
      })
      .catch((error) => {
        console.error('Optimistic update failed, rolling back:', error);
        setData(previousState);
        historyRef.current = [previousState];
        onError?.(error as Error, previousState);
      })
      .finally(() => {
        pendingActionsRef.current.delete(actionId);
      });
  }, [data, onError, onSuccess]);
  
  return {
    data,
    updateOptimistic,
    isPending: () => pendingActionsRef.current.size > 0,
    rollback: useCallback(() => {
      if (historyRef.current.length > 1) {
        const previousState = historyRef.current[historyRef.current.length - 2];
        setData(previousState);
        historyRef.current.pop();
      }
    }, [])
  };
}
