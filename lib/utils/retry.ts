/**
 * Retry Logic with Exponential Backoff
 * 
 * For mobile-first Morocco with spotty connectivity
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number; // milliseconds
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: RegExp[];
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000, // 1 second
    maxDelay = 16000, // 16 seconds
    backoffMultiplier = 2,
    retryableErrors = [/network|timeout|connection/i]
  } = options;

  let lastError: Error | null = null;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Check if error is retryable
      const isRetryable = retryableErrors.some(pattern => 
        pattern.test(error?.message || '')
      );

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Fetch with automatic retry
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  return retryWithBackoff(
    () => fetch(url, options),
    {
      maxRetries: 3,
      initialDelay: 1000,
      backoffMultiplier: 2,
      retryableErrors: [/network|timeout|connection|failed to fetch/i],
      ...retryOptions
    }
  );
}

