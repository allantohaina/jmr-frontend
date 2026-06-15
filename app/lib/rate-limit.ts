// Rate limiting utilities for API endpoints
// Protect your API from spam and abuse!

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Simple in-memory rate limiter
class InMemoryRateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxRequests = maxRequests; // Max 5 requests per window
    this.windowMs = windowMs; // 15 minutes
  }

  public check(ip: string): { allowed: boolean; resetTime: number; remaining: number } {
    const now = Date.now();
    const entry = this.requests.get(ip);

    if (!entry || now > entry.resetTime) {
      // New entry or reset time passed
      const newResetTime = now + this.windowMs;
      this.requests.set(ip, { count: 1, resetTime: newResetTime });
      return { allowed: true, resetTime: newResetTime, remaining: this.maxRequests - 1 };
    }

    if (entry.count >= this.maxRequests) {
      return { allowed: false, resetTime: entry.resetTime, remaining: 0 };
    }

    // Increment count
    const newCount = entry.count + 1;
    this.requests.set(ip, { ...entry, count: newCount });
    
    return { 
      allowed: true, 
      resetTime: entry.resetTime, 
      remaining: this.maxRequests - newCount 
    };
  }

  // Cleanup old entries
  public cleanup(): void {
    const now = Date.now();
    for (const [ip, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(ip);
      }
    }
  }
}

// Create default rate limiters for common use cases
export const loginRateLimiter = new InMemoryRateLimiter(5, 15 * 60 * 1000); // 5 login attempts per 15 mins
export const quoteRequestRateLimiter = new InMemoryRateLimiter(3, 60 * 60 * 1000); // 3 quote requests per hour
export const contactFormRateLimiter = new InMemoryRateLimiter(2, 60 * 60 * 1000); // 2 contact requests per hour

// Periodically clean up old entries (every hour)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    loginRateLimiter.cleanup();
    quoteRequestRateLimiter.cleanup();
    contactFormRateLimiter.cleanup();
  }, 60 * 60 * 1000);
}
