const TRANSIENT_ERROR_NAMES = new Set([
  'PrismaClientInitializationError',
])

const TRANSIENT_ERROR_CODES = new Set(['P1001'])

const TRANSIENT_PATTERNS = [
  "Can't reach database server",
  'Timed out',
  'Connection refused',
  'ECONNREFUSED',
  'ETIMEDOUT',
]

export function isTransientPrismaError(error: unknown): boolean {
  if (!(error instanceof Error)) return false

  if (TRANSIENT_ERROR_NAMES.has(error.name)) return true

  if (
    'code' in error &&
    typeof (error as any).code === 'string' &&
    TRANSIENT_ERROR_CODES.has((error as any).code)
  ) {
    return true
  }

  const message = error.message ?? ''
  return TRANSIENT_PATTERNS.some(pattern => message.includes(pattern))
}

const DEFAULT_MAX_RETRIES = 2
const DEFAULT_DELAY_MS = 300

export async function withPrismaRetry<T>(
  operation: () => Promise<T>,
  context: string,
  options?: { maxRetries?: number; delayMs?: number }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES
  const delayMs = options?.delayMs ?? DEFAULT_DELAY_MS

  let lastError: unknown

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      if (!isTransientPrismaError(error)) {
        throw error
      }

      if (attempt < maxRetries) {
        console.warn(
          `[prisma-retry] ${context}: transient error on attempt ${attempt}, retrying in ${delayMs}ms`,
          (error as Error).message
        )
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
      }
    }
  }

  throw lastError
}
