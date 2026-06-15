'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface UseAutoSaveOptions<T> {
  initialData: T;
  saveFn: (data: T) => Promise<void>;
  debounceTime?: number;
  onSaveStart?: () => void;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

export function useAutoSave<T>({
  initialData,
  saveFn,
  debounceTime = 5000,
  onSaveStart,
  onSaveSuccess,
  onSaveError
}: UseAutoSaveOptions<T>) {
  const [data, setData] = useState<T>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savingRef = useRef(false);
  
  const saveData = useCallback(async (dataToSave: T) => {
    if (savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    onSaveStart?.();
    
    try {
      await saveFn(dataToSave);
      setLastSaved(new Date());
      onSaveSuccess?.();
      setIsDirty(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
      onSaveError?.(error as Error);
    } finally {
      setIsSaving(false);
      savingRef.current = false;
    }
  }, [saveFn, onSaveStart, onSaveSuccess, onSaveError]);
  
  const updateData = useCallback((newData: T | ((prev: T) => T)) => {
    setData((prev) => {
      const updated = typeof newData === 'function' 
        ? (newData as (prev: T) => T)(prev) 
        : newData;
        
      setIsDirty(true);
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        saveData(updated);
      }, debounceTime);
      
      return updated;
    });
  }, [debounceTime, saveData]);
  
  const flush = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Wait a tick for data to be set
    await new Promise(resolve => setTimeout(resolve, 0));
    // Then save the current data
    if (isDirty) {
      await saveData(data);
    }
  }, [data, isDirty, saveData]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return {
    data,
    updateData,
    flush,
    isSaving,
    isDirty,
    lastSaved
  };
}
