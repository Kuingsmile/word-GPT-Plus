import { ErrorMessages, ErrorType, LLMError } from '../types/errors'
import { CircuitBreaker, retryWithBackoff, withFallbacks, withTimeout } from './errorRecovery'

export function handleLLMError(error: unknown): LLMError {
  if (error instanceof LLMError) return error

  // Handle HTTP errors
  if (error instanceof Error && 'response' in error) {
    const httpError = error as { response?: { status?: number } }

    if (httpError.response?.status === 401 || httpError.response?.status === 403) {
      return new LLMError(
        ErrorType.AUTHENTICATION,
        'Auth failed',
        ErrorMessages[ErrorType.AUTHENTICATION],
        'https://docs.wordgptplus.com/troubleshooting/auth',
        error,
      )
    }

    if (httpError.response?.status === 429) {
      return new LLMError(
        ErrorType.RATE_LIMIT,
        'Rate limited',
        ErrorMessages[ErrorType.RATE_LIMIT],
        'https://docs.wordgptplus.com/troubleshooting/rate-limit',
        error,
      )
    }

    if (httpError.response?.status === 404) {
      return new LLMError(
        ErrorType.INVALID_MODEL,
        'Model not found',
        ErrorMessages[ErrorType.INVALID_MODEL],
        'https://docs.wordgptplus.com/troubleshooting/models',
        error,
      )
    }

    if (httpError.response?.status === 400) {
      return new LLMError(
        ErrorType.INVALID_REQUEST,
        'Invalid request',
        ErrorMessages[ErrorType.INVALID_REQUEST],
        'https://docs.wordgptplus.com/troubleshooting/requests',
        error,
      )
    }

    if (httpError.response?.status === 503) {
      return new LLMError(
        ErrorType.NETWORK,
        'Service unavailable',
        'The service is temporarily unavailable. Please try again in a moment.',
        'https://docs.wordgptplus.com/troubleshooting/service',
        error,
      )
    }
  }

  // Handle network errors
  if (error instanceof Error && error.message.includes('network')) {
    return new LLMError(
      ErrorType.NETWORK,
      'Network error',
      ErrorMessages[ErrorType.NETWORK],
      'https://docs.wordgptplus.com/troubleshooting/network',
      error,
    )
  }

  // Handle timeout errors
  if (error instanceof Error && error.message.includes('timeout')) {
    return new LLMError(
      ErrorType.NETWORK,
      'Request timeout',
      'The request took too long. Check your connection and try again.',
      'https://docs.wordgptplus.com/troubleshooting/timeout',
      error,
    )
  }

  // Handle quota errors
  if (error instanceof Error && error.message.includes('quota')) {
    return new LLMError(
      ErrorType.QUOTA_EXCEEDED,
      'Quota exceeded',
      ErrorMessages[ErrorType.QUOTA_EXCEEDED],
      'https://docs.wordgptplus.com/troubleshooting/quota',
      error,
    )
  }

  // Default to unknown error
  return new LLMError(ErrorType.UNKNOWN, 'Unknown error', ErrorMessages[ErrorType.UNKNOWN], undefined, error)
}

export function showUserFriendlyError(error: unknown): void {
  const llmError = handleLLMError(error)

  // Show error to user
  console.error(`[${llmError.type}] ${llmError.message}`, llmError.originalError)

  // In a real app, you would show this in a toast/notification
  // For now, we'll just log it
  console.log('User message:', llmError.userMessage)

  if (llmError.troubleshootingUrl) {
    console.log('Troubleshooting:', llmError.troubleshootingUrl)
  }
}

/**
 * Execute operation with automatic recovery
 * Retries transient failures and fails fast on permanent errors
 */
export async function executeWithRecovery<T>(
  operation: () => Promise<T>,
  operationName: string = 'Operation',
): Promise<T> {
  return retryWithBackoff(operation, {
    maxRetries: 3,
    initialDelayMs: 1000,
    backoffMultiplier: 2,
    shouldRetry: error => {
      const llmError = handleLLMError(error)
      // Only retry transient errors
      return [ErrorType.NETWORK, ErrorType.RATE_LIMIT].includes(llmError.type)
    },
    onRetry: (attempt, delay, error) => {
      console.warn(`[${operationName}] Attempt ${attempt} failed, retrying in ${delay}ms:`, error)
    },
  })
}

/**
 * Execute with timeout protection
 */
export async function executeWithTimeout<T>(operation: () => Promise<T>, timeoutMs: number = 30000): Promise<T> {
  return withTimeout(operation, timeoutMs, 'Operation timed out')
}

// Re-export recovery utilities for direct use
export { CircuitBreaker, retryWithBackoff, withFallbacks, withTimeout }
