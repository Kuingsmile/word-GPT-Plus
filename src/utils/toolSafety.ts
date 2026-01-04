/**
 * Tool Execution Safety Layer
 * Provides rate limiting, cooldowns, and safe execution of tools
 */

import { activityLog } from './activityLog'

export interface ToolExecutionStats {
  name: string
  lastExecutionTime: number | null
  executionCount: number
  successCount: number
  errorCount: number
  averageExecutionTimeMs: number
  onCooldown: boolean
}

export interface SafeExecutionOptions {
  maxRetries?: number
  timeoutMs?: number
  cooldownMs?: number
  maxExecutionsPerMinute?: number
}

const DEFAULT_OPTIONS: Required<SafeExecutionOptions> = {
  maxRetries: 2,
  timeoutMs: 30000,
  cooldownMs: 1000,
  maxExecutionsPerMinute: 60,
}

class ToolSafetyManager {
  private executionStats = new Map<string, ToolExecutionStats>()
  private cooldowns = new Map<string, number>()
  private executionTimestamps = new Map<string, number[]>()
  private abortControllers = new Map<string, AbortController>()

  /**
   * Execute a tool safely with protection against common issues
   */
  async executeSafely<T>(
    toolName: string,
    executeFn: () => Promise<T>,
    options: SafeExecutionOptions = {},
  ): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    const stats = this.getOrCreateStats(toolName)
    const startTime = Date.now()

    // Check if on cooldown
    if (this.checkCooldown(toolName)) {
      const remainingMs = (this.cooldowns.get(toolName) || 0) - Date.now()
      throw new Error(`Tool "${toolName}" is on cooldown. Wait ${Math.ceil(remainingMs / 1000)}s`)
    }

    // Check rate limit
    this.checkRateLimit(toolName, opts.maxExecutionsPerMinute)

    // Set up timeout and abort controller
    const abortController = new AbortController()
    this.abortControllers.set(toolName, abortController)

    let lastError: unknown
    let executionTimeMs = 0

    try {
      // Log tool call
      activityLog.logToolCall(toolName, {})

      // Execute with timeout and retries
      for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
        try {
          const result = await Promise.race([
            executeFn(),
            new Promise<T>((_, reject) =>
              setTimeout(() => reject(new Error('Tool execution timeout')), opts.timeoutMs),
            ),
          ])

          executionTimeMs = Date.now() - startTime
          stats.executionCount++
          stats.successCount++
          stats.lastExecutionTime = Date.now()
          stats.averageExecutionTimeMs =
            (stats.averageExecutionTimeMs * (stats.successCount - 1) + executionTimeMs) / stats.successCount

          // Set cooldown
          this.cooldowns.set(toolName, Date.now() + opts.cooldownMs)

          // Log success
          activityLog.logToolResult(toolName, result, executionTimeMs, true)

          return result
        } catch (error) {
          lastError = error
          executionTimeMs = Date.now() - startTime

          // Retry if not last attempt and error is retryable
          if (attempt < opts.maxRetries && this.isRetryable(error)) {
            const delayMs = Math.min(1000 * Math.pow(2, attempt), 5000)
            console.warn(`Tool "${toolName}" attempt ${attempt + 1} failed, retrying in ${delayMs}ms:`, error)
            await new Promise(resolve => setTimeout(resolve, delayMs))
          } else {
            break
          }
        }
      }

      // If we get here, all retries failed
      stats.errorCount++
      stats.lastExecutionTime = Date.now()

      // Log error
      activityLog.logToolResult(toolName, String(lastError), executionTimeMs, false)

      throw lastError
    } finally {
      // Clean up abort controller
      this.abortControllers.delete(toolName)
    }
  }

  /**
   * Cancel an in-flight tool execution
   */
  cancel(toolName: string): void {
    const controller = this.abortControllers.get(toolName)
    if (controller) {
      controller.abort()
      this.abortControllers.delete(toolName)
    }
  }

  /**
   * Cancel all in-flight executions
   */
  cancelAll(): void {
    this.abortControllers.forEach(controller => controller.abort())
    this.abortControllers.clear()
  }

  /**
   * Check if tool is on cooldown
   */
  private checkCooldown(toolName: string): boolean {
    const cooldownUntil = this.cooldowns.get(toolName)
    if (!cooldownUntil) return false

    if (Date.now() >= cooldownUntil) {
      this.cooldowns.delete(toolName)
      return false
    }

    return true
  }

  /**
   * Check rate limit (max executions per minute)
   */
  private checkRateLimit(toolName: string, maxPerMinute: number): void {
    const now = Date.now()
    const oneMinuteAgo = now - 60000

    // Get or create timestamps array
    let timestamps = this.executionTimestamps.get(toolName) || []

    // Remove timestamps older than 1 minute
    timestamps = timestamps.filter(t => t > oneMinuteAgo)

    // Check if at limit
    if (timestamps.length >= maxPerMinute) {
      const oldestTimestamp = Math.min(...timestamps)
      const waitMs = oldestTimestamp + 60000 - now
      throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitMs / 1000)}s before next execution`)
    }

    // Add current timestamp
    timestamps.push(now)
    this.executionTimestamps.set(toolName, timestamps)
  }

  /**
   * Determine if error is retryable
   */
  private isRetryable(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      return (
        message.includes('timeout') ||
        message.includes('network') ||
        message.includes('econnreset') ||
        message.includes('econnrefused') ||
        message.includes('429') || // Rate limit
        message.includes('503') // Service unavailable
      )
    }
    return false
  }

  /**
   * Get or create stats for a tool
   */
  private getOrCreateStats(toolName: string): ToolExecutionStats {
    if (!this.executionStats.has(toolName)) {
      this.executionStats.set(toolName, {
        name: toolName,
        lastExecutionTime: null,
        executionCount: 0,
        successCount: 0,
        errorCount: 0,
        averageExecutionTimeMs: 0,
        onCooldown: false,
      })
    }
    return this.executionStats.get(toolName)!
  }

  /**
   * Get stats for a specific tool
   */
  getStats(toolName: string): ToolExecutionStats {
    const stats = this.getOrCreateStats(toolName)
    stats.onCooldown = this.checkCooldown(toolName)
    return { ...stats }
  }

  /**
   * Get stats for all tools
   */
  getAllStats(): ToolExecutionStats[] {
    const allStats: ToolExecutionStats[] = []
    this.executionStats.forEach((stats, toolName) => {
      const updatedStats = { ...stats }
      updatedStats.onCooldown = this.checkCooldown(toolName)
      allStats.push(updatedStats)
    })
    return allStats
  }

  /**
   * Reset stats for a tool
   */
  resetStats(toolName: string): void {
    this.executionStats.delete(toolName)
    this.cooldowns.delete(toolName)
    this.executionTimestamps.delete(toolName)
  }

  /**
   * Reset all stats
   */
  resetAllStats(): void {
    this.executionStats.clear()
    this.cooldowns.clear()
    this.executionTimestamps.clear()
  }

  /**
   * Get health report
   */
  getHealthReport(): {
    toolsInUse: number
    toolsOnCooldown: number
    totalExecutions: number
    successRate: number
    averageExecutionTimeMs: number
  } {
    let totalExecutions = 0
    let totalSuccesses = 0
    let totalExecutionTime = 0
    let cooldownCount = 0

    this.executionStats.forEach(stats => {
      totalExecutions += stats.executionCount
      totalSuccesses += stats.successCount
      totalExecutionTime += stats.averageExecutionTimeMs * stats.executionCount

      if (this.checkCooldown(stats.name)) {
        cooldownCount++
      }
    })

    return {
      toolsInUse: this.executionStats.size,
      toolsOnCooldown: cooldownCount,
      totalExecutions,
      successRate: totalExecutions > 0 ? (totalSuccesses / totalExecutions) * 100 : 100,
      averageExecutionTimeMs: totalExecutions > 0 ? totalExecutionTime / totalExecutions : 0,
    }
  }
}

// Global instance
export const toolSafetyManager = new ToolSafetyManager()

// Make available globally for debugging
if (typeof window !== 'undefined') {
  ;(window as any).__wordGptToolSafetyManager = toolSafetyManager
}

export default toolSafetyManager
