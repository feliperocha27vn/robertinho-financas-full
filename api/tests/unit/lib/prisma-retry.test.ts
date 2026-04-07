import { describe, expect, it, vi } from 'vitest'
import { withPrismaRetry, isTransientPrismaError } from '../../../src/lib/prisma-retry'

function makeTransientError(message: string) {
  const err = new Error(message)
  ;(err as any).name = 'PrismaClientInitializationError'
  ;(err as any).clientVersion = '6.16.3'
  return err
}

function makePermanentError(message: string) {
  const err = new Error(message)
  ;(err as any).name = 'PrismaClientKnownRequestError'
  ;(err as any).clientVersion = '6.16.3'
  ;(err as any).code = 'P2025'
  return err
}

describe('isTransientPrismaError', () => {
  it('returns true for PrismaClientInitializationError with unreachable db message', () => {
    const err = makeTransientError("Can't reach database server at `ep-super-violet-acv7jft3-pooler.sa-east-1.aws.neon.tech:5432`")
    expect(isTransientPrismaError(err)).toBe(true)
  })

  it('returns true for PrismaClientInitializationError with timed out message', () => {
    const err = makeTransientError('Timed out connecting to database')
    expect(isTransientPrismaError(err)).toBe(true)
  })

  it('returns true for P1001 error code', () => {
    const err = new Error('Cannot reach database server')
    ;(err as any).name = 'PrismaClientKnownRequestError'
    ;(err as any).code = 'P1001'
    ;(err as any).clientVersion = '6.16.3'
    expect(isTransientPrismaError(err)).toBe(true)
  })

  it('returns false for known request errors with non-transient codes', () => {
    const err = makePermanentError('Record not found')
    expect(isTransientPrismaError(err)).toBe(false)
  })

  it('returns false for generic errors', () => {
    const err = new Error('Something went wrong')
    expect(isTransientPrismaError(err)).toBe(false)
  })
})

describe('withPrismaRetry', () => {
  it('returns result on first success', async () => {
    const operation = vi.fn().mockResolvedValue({ ok: true })

    const result = await withPrismaRetry(operation, 'test')

    expect(result).toEqual({ ok: true })
    expect(operation).toHaveBeenCalledTimes(1)
  })

  it('retries once on transient error and succeeds', async () => {
    const transientErr = makeTransientError("Can't reach database server")
    const operation = vi
      .fn()
      .mockRejectedValueOnce(transientErr)
      .mockResolvedValueOnce({ ok: true })

    const result = await withPrismaRetry(operation, 'test')

    expect(result).toEqual({ ok: true })
    expect(operation).toHaveBeenCalledTimes(2)
  })

  it('retries up to max attempts then throws', async () => {
    const transientErr = makeTransientError("Can't reach database server")
    const operation = vi.fn().mockRejectedValue(transientErr)

    await expect(withPrismaRetry(operation, 'test')).rejects.toThrow(
      "Can't reach database server"
    )
    // default maxRetries = 2, so 2 calls total
    expect(operation).toHaveBeenCalledTimes(2)
  })

  it('does not retry on non-transient errors', async () => {
    const permanentErr = makePermanentError('Record not found')
    const operation = vi.fn().mockRejectedValue(permanentErr)

    await expect(withPrismaRetry(operation, 'test')).rejects.toThrow(
      'Record not found'
    )
    expect(operation).toHaveBeenCalledTimes(1)
  })

  it('logs transient failures for observability', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const transientErr = makeTransientError("Can't reach database server")
    const operation = vi
      .fn()
      .mockRejectedValueOnce(transientErr)
      .mockResolvedValueOnce({ ok: true })

    await withPrismaRetry(operation, 'listItems')

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('listItems'),
      expect.stringContaining("Can't reach database server")
    )

    consoleSpy.mockRestore()
  })
})
