export enum ErrorType {
  AUTHENTICATION = 'AUTHENTICATION',
  RATE_LIMIT = 'RATE_LIMIT',
  NETWORK = 'NETWORK',
  INVALID_MODEL = 'INVALID_MODEL',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  TIMEOUT = 'TIMEOUT',
  SERVICE_ERROR = 'SERVICE_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export class LLMError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public userMessage: string,
    public troubleshootingUrl?: string,
    public originalError?: Error,
    public suggestedAction?: string,
  ) {
    super(message)
    this.name = 'LLMError'
  }
}

export const ErrorMessages: Record<ErrorType, string> = {
  [ErrorType.AUTHENTICATION]:
    'Your API credentials are invalid or expired. Please check your API key or JWT token in settings.',
  [ErrorType.RATE_LIMIT]: 'You have made too many requests. Please wait a moment and try again.',
  [ErrorType.NETWORK]: 'There is a network connection issue. Please check your internet connection and try again.',
  [ErrorType.INVALID_MODEL]:
    'The selected model is not available. Please check that the model name is correct in settings.',
  [ErrorType.QUOTA_EXCEEDED]: 'Your API quota has been exceeded. Please check your account and upgrade if needed.',
  [ErrorType.INVALID_REQUEST]: 'The request was invalid. Please check your settings and try again.',
  [ErrorType.TIMEOUT]: 'The request took too long and timed out. This might be due to a slow connection.',
  [ErrorType.SERVICE_ERROR]: 'The service is temporarily unavailable. Please try again in a moment.',
  [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please check the troubleshooting guide.',
}

export const SuggestedActions: Record<ErrorType, string> = {
  [ErrorType.AUTHENTICATION]: 'Go to settings and verify your API credentials',
  [ErrorType.RATE_LIMIT]: 'Wait a few seconds and try again',
  [ErrorType.NETWORK]: 'Check your internet connection',
  [ErrorType.INVALID_MODEL]: 'Update the model name in settings',
  [ErrorType.QUOTA_EXCEEDED]: 'Upgrade your API plan or account',
  [ErrorType.INVALID_REQUEST]: 'Check your settings configuration',
  [ErrorType.TIMEOUT]: 'Check your internet connection or try again',
  [ErrorType.SERVICE_ERROR]: 'Wait a moment and try again',
  [ErrorType.UNKNOWN]: 'Check the troubleshooting guide or contact support',
}
