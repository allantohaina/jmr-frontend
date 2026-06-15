
// Debounce utility function - perfect for search/filters/autocomplete
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Local storage helpers for caching
export function setLocalCache<T>(key: string, data: T, ttlSeconds: number = 3600): void {
  const now = new Date();
  const item = {
    value: data,
    expiry: now.getTime() + ttlSeconds * 1000,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

export function getLocalCache<T>(key: string): T | null {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }

  return item.value as T;
}

// Auto-save wrapper
export function createAutoSave<T>(
  saveFn: (data: T) => Promise<void>,
  debounceTime: number = 5000
) {
  let currentData: T | null = null;
  let saveTimeout: NodeJS.Timeout | null = null;
  let isSaving = false;
  
  const triggerSave = async () => {
    if (!currentData || isSaving) return;
    isSaving = true;
    try {
      await saveFn(currentData);
      currentData = null;
    } finally {
      isSaving = false;
    }
  };

  return {
    updateData: (newData: T) => {
      currentData = newData;
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(triggerSave, debounceTime);
    },
    flush: async () => {
      await triggerSave();
    },
    cancel: () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
        saveTimeout = null;
      }
    },
    isDirty: () => currentData !== null,
    isSaving: () => isSaving
  };
}

// Infinite scroll hook helper
export function useIntersectionObserver(
  target: React.RefObject<HTMLElement>,
  onIntersect: () => void,
  threshold: number = 0.1,
  rootMargin = "100px"
) {
  if (typeof window === 'undefined') return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          onIntersect();
        }
      });
    },
    { threshold, rootMargin }
  );
  
  if (target.current) observer.observe(target.current);
  
  return () => {
    observer.disconnect();
  };
}
