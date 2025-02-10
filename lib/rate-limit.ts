export interface RateLimitOptions {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval?: number; // Max number of unique tokens per interval
}

interface TokenBucket {
  tokens: Set<string>;
  timestamp: number;
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new Map<string, TokenBucket>();

  return {
    check: async (token: string): Promise<{ success: boolean; limit: number; remaining: number; reset: Date }> => {
      const now = Date.now();
      const bucket = tokenCache.get(token) || { tokens: new Set(), timestamp: now };
      const windowStart = now - options.interval;

      // Clear expired tokens
      if (bucket.timestamp < windowStart) {
        bucket.tokens.clear();
        bucket.timestamp = now;
      }

      // Check if limit is reached
      const maxTokens = options.uniqueTokenPerInterval || 500;
      const currentTokens = bucket.tokens.size;

      if (currentTokens >= maxTokens) {
        return {
          success: false,
          limit: maxTokens,
          remaining: 0,
          reset: new Date(bucket.timestamp + options.interval)
        };
      }

      // Add new token
      bucket.tokens.add(token);
      tokenCache.set(token, bucket);

      return {
        success: true,
        limit: maxTokens,
        remaining: maxTokens - bucket.tokens.size,
        reset: new Date(bucket.timestamp + options.interval)
      };
    }
  };
}
