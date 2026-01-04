/**
 * Error Recovery System
 * Provides automatic retry logic with exponential backoff for transient failures
 */

export interface RecoveryOptions {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
  shouldRetry?: (error: unknown, attempt: number) => boolean
  onRetry?: (attempt: number, delay: number, error: unknown) => void
}

const DEFAULT_OPTIONS: Required<RecoveryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  shouldRetry: (error: unknown) => {
    // Retry on network errors and rate limits
    if (error instanceof Error) {
      return (
        error.message.includes('network') ||
        error.message.includes('timeout') ||
        error.message.includes('429') || // Rate limit
        error.message.includes('503') // Service unavailable
      )
    }
    return false
  },
  onRetry: () => {},
}

export async function retryWithBackoff<T>(fn: () => Promise<T>, options: RecoveryOptions = {}): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: unknown = null
  let delay = opts.initialDelayMs

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Don't retry if it's the last attempt
      if (attempt === opts.maxRetries) {
        break
      }

      // Check if we should retry
      if (!opts.shouldRetry(error, attempt)) {
        throw error
      }

      // Call the onRetry callback
      opts.onRetry(attempt + 1, delay, error)

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))

      // Calculate next delay with exponential backoff
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelayMs)
    }
  }

  throw lastError
}

/**
 * Create a fallback chain - try multiple operations in order
 */
export async function withFallbacks<T>(
  operations: (() => Promise<T>)[],
  onFallback?: (index: number, error: unknown) => void,
): Promise<T> {
  let lastError: unknown = null

  for (let i = 0; i < operations.length; i++) {
    try {
      return await operations[i]()
    } catch (error) {
      lastError = error
      onFallback?.(i, error)

      // Continue to next fallback
      if (i < operations.length - 1) {
        console.warn(`Operation ${i} failed, trying fallback ${i + 1}:`, error)
      }
    }
  }

  throw lastError
}

/**
 * Execute operation with timeout
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number = 30000,
  timeoutMessage: string = 'Operation timed out',
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)),
  ])
}

/**
 * Circuit breaker pattern - fail fast after repeated failures
 */
export class CircuitBreaker {
  private failureCount = 0
  private lastFailureTime = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'

  constructor(
    private failureThreshold: number = 5,
    private resetTimeoutMs: number = 60000,
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should be reset
    if (this.state === 'open' && Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
      this.state = 'half-open'
      this.failureCount = 0
    }

    // Fail fast if circuit is open
    if (this.state === 'open') {
      throw new Error('Circuit breaker is open. Service is temporarily unavailable.')
    }

    try {
      const result = await fn()
      // Success - reset circuit
      if (this.state === 'half-open') {
        this.state = 'closed'
        this.failureCount = 0
      }
      return result
    } catch (error) {
      this.failureCount++
      this.lastFailureTime = Date.now()

      // Open circuit if threshold reached
      if (this.failureCount >= this.failureThreshold) {
        this.state = 'open'
        throw new Error(`Circuit breaker opened after ${this.failureCount} failures`)
      }

      throw error
    }
  }

  reset(): void {
    this.state = 'closed'
    this.failureCount = 0
    this.lastFailureTime = 0
  }

  getStatus(): {
    state: 'closed' | 'open' | 'half-open'
    failureCount: number
    lastFailureTime: number
  } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
    }
  }
}

/**
 * Memoize/cache result of expensive operation
 */
export function memoize<T>(fn: () => Promise<T>, ttlMs: number = 60000) {
  let cachedResult: T | null = null
  let cacheTime = 0

  return async (): Promise<T> => {
    const now = Date.now()

    // Return cached result if valid
    if (cachedResult !== null && now - cacheTime < ttlMs) {
      return cachedResult
    }

    // Fetch new result
    cachedResult = await fn()
    cacheTime = now

    return cachedResult
  }
}
