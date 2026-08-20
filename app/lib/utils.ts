
// Debounce utility function - perfect for search/filters/autocomplete
export function debounce<TArgs extends unknown[], TResult>(
  func: (...args: TArgs) => TResult,
  wait: number = 300
): (...args: TArgs) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (...args: TArgs) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

const SAFE_URL_SCHEME = /^(https?:|mailto:|tel:|data:image\/)/i;

export function safeUrl(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return undefined;
  if (trimmed.startsWith("/")) {
    if (trimmed.startsWith("//") || trimmed.startsWith("/\\")) return undefined;
    return trimmed;
  }
  if (SAFE_URL_SCHEME.test(trimmed)) return trimmed;
  return undefined;
}

// Throttle utility
export function throttle<TArgs extends unknown[], TResult>(
  func: (...args: TArgs) => TResult,
  limit: number = 300
): (...args: TArgs) => void {
  let inThrottle: boolean = false;
  return function (...args: TArgs) {
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
