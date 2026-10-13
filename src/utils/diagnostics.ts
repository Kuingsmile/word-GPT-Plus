type DiagnosticLevel = 'log' | 'warn' | 'error'
type DiagnosticRecord = Record<string, unknown>

const numericFields = [
  'status',
  'statusCode',
  'durationMs',
  'stepCount',
  'messageCount',
  'toolCallCount',
  'contentLength',
]
const idFields = ['threadId', 'checkpointId', 'toolCallId', 'requestId', 'request_id', 'correlationId']
const errorNames = new Set([
  'Error',
  'TypeError',
  'SyntaxError',
  'RangeError',
  'AggregateError',
  'AbortError',
  'GraphRecursionError',
  'APIError',
  'APIConnectionError',
  'APIConnectionTimeoutError',
  'AuthenticationError',
  'PermissionDeniedError',
  'NotFoundError',
  'BadRequestError',
  'RateLimitError',
  'InternalServerError',
  'GoogleGenerativeAIError',
  'GoogleGenerativeAIFetchError',
  'ResponseError',
  'DataCloneError',
  'QuotaExceededError',
  'DatabaseClosedError',
  'TransactionInactiveError',
])
const errorCodes = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'ERR_NETWORK',
  'ABORT_ERR',
  'invalid_api_key',
  'insufficient_quota',
  'rate_limit_exceeded',
  'context_length_exceeded',
  'InvalidArgument',
  'InvalidObjectPath',
  'ItemNotFound',
  'AccessDenied',
  'GeneralException',
])

// Do not invoke getters, toJSON or toString on errors supplied by SDKs or tools.
function readField(value: unknown, key: string): unknown {
  if (!value || typeof value !== 'object') return undefined
  try {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    return descriptor && 'value' in descriptor ? descriptor.value : undefined
  } catch {
    return undefined
  }
}

function safeId(value: unknown): string | undefined {
  // Accept only opaque ID syntax; reject URLs, query strings, whitespace and control characters.
  return typeof value === 'string' && /^[\w.-]{1,128}$/.test(value) ? value : undefined
}

function metadata(value: unknown): DiagnosticRecord {
  const result: DiagnosticRecord = {}
  for (const key of numericFields) {
    const item = readField(value, key)
    if (typeof item === 'number' && Number.isFinite(item) && item >= 0) result[key] = item
  }
  for (const key of idFields) {
    const item = safeId(readField(value, key))
    if (item) result[key] = item
  }
  return result
}

function errorMetadata(error: unknown, seen: WeakSet<object>, depth = 0): DiagnosticRecord {
  const result = metadata(error)
  if (!error || typeof error !== 'object' || seen.has(error) || depth >= 4) return result
  seen.add(error)

  const name = readField(error, 'name') ?? readField(Object.getPrototypeOf(error), 'name')
  if (typeof name === 'string' && errorNames.has(name)) result.name = name
  const code = readField(error, 'code')
  if (typeof code === 'number' && Number.isFinite(code)) result.code = code
  if (typeof code === 'string' && errorCodes.has(code)) result.code = code

  // Extract correlation headers individually; never forward a Headers instance or header map.
  const headers = readField(error, 'headers')
  for (const key of ['x-request-id', 'request-id', 'x-ms-request-id', 'x-correlation-id']) {
    const id = safeId(
      typeof Headers !== 'undefined' && headers instanceof Headers
        ? Headers.prototype.get.call(headers, key)
        : readField(headers, key),
    )
    if (id) result[key] = id
  }

  // Only inspect known error wrappers. Request/config/body/debugInfo and all
  // free text (including message, stack and URLs) are deliberately omitted at every depth.
  for (const key of ['cause', 'error', 'response', 'inner', 'innerError', 'originalError']) {
    const nested = readField(error, key)
    if (nested && typeof nested === 'object' && !seen.has(nested)) {
      const safe = errorMetadata(nested, seen, depth + 1)
      if (Object.keys(safe).length) result[key] = safe
    }
  }
  const errors = readField(error, 'errors')
  if (Array.isArray(errors) && depth < 4) {
    const safe = []
    for (let index = 0; index < Math.min(errors.length, 5); index++) {
      const item = errorMetadata(readField(errors, String(index)), seen, depth + 1)
      if (Object.keys(item).length) safe.push(item)
    }
    if (safe.length) result.errors = safe
  }
  return result
}

/** Local console diagnostics only. Event names must be static, source-controlled strings.
 * Unknown fields are dropped rather than trying to recognize every possible secret.
 */
export function logDiagnostic(level: DiagnosticLevel, event: string, details: DiagnosticRecord = {}): void {
  let safe: DiagnosticRecord = {}
  try {
    safe = metadata(details)
    const error = readField(details, 'error')
    if (error !== undefined) safe.error = errorMetadata(error, new WeakSet())
  } catch {
    // Malformed SDK objects must not turn diagnostics into an unhandled failure.
    safe = {}
  }
  console[level](event, safe)
}
