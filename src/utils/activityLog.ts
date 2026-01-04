/**
 * Activity Logging System
 * Tracks agent activities, tool calls, and operations for debugging and transparency
 */

export type ActivityType = 'tool_call' | 'tool_result' | 'thinking' | 'error'
export type ActivityStatus = 'pending' | 'success' | 'error'

export interface Activity {
  id: string
  type: ActivityType
  timestamp: Date
  status?: ActivityStatus
  toolName?: string
  args?: Record<string, any>
  result?: any
  thought?: string
  error?: string
  executionTimeMs?: number
  metadata?: Record<string, any>
}

type ActivityListener = (activity: Activity) => void

class ActivityLog {
  private activities: Activity[] = []
  private listeners = new Set<ActivityListener>()
  private readonly maxActivities = 100
  private sessionStartTime = Date.now()

  /**
   * Log a new activity
   */
  log(activity: Omit<Activity, 'id' | 'timestamp'>): Activity {
    const completeActivity: Activity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date(),
      ...activity,
    }

    this.activities.push(completeActivity)

    // Trim if exceeding max
    if (this.activities.length > this.maxActivities) {
      this.activities = this.activities.slice(-this.maxActivities)
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(completeActivity))

    return completeActivity
  }

  /**
   * Log tool call
   */
  logToolCall(toolName: string, args: Record<string, any>): Activity {
    return this.log({
      type: 'tool_call',
      status: 'pending',
      toolName,
      args,
    })
  }

  /**
   * Log tool result
   */
  logToolResult(toolName: string, result: any, executionTimeMs?: number, success: boolean = true): Activity {
    return this.log({
      type: 'tool_result',
      status: success ? 'success' : 'error',
      toolName,
      result,
      executionTimeMs,
    })
  }

  /**
   * Log agent thinking
   */
  logThinking(thought: string): Activity {
    return this.log({
      type: 'thinking',
      status: 'success',
      thought,
    })
  }

  /**
   * Log error
   */
  logError(error: string, context?: Record<string, any>): Activity {
    return this.log({
      type: 'error',
      status: 'error',
      error,
      metadata: context,
    })
  }

  /**
   * Update activity status (e.g., mark pending tool call as completed)
   */
  updateActivity(id: string, updates: Partial<Omit<Activity, 'id' | 'timestamp'>>): Activity | null {
    const activity = this.activities.find(a => a.id === id)
    if (!activity) return null

    Object.assign(activity, updates)
    this.listeners.forEach(listener => listener(activity))

    return activity
  }

  /**
   * Get all activities
   */
  getActivities(): Activity[] {
    return [...this.activities]
  }

  /**
   * Get activities of specific type
   */
  getActivitiesByType(type: ActivityType): Activity[] {
    return this.activities.filter(a => a.type === type)
  }

  /**
   * Get recent activities
   */
  getRecent(count: number = 10): Activity[] {
    return this.activities.slice(-count)
  }

  /**
   * Clear all activities
   */
  clear(): void {
    this.activities = []
    this.sessionStartTime = Date.now()
  }

  /**
   * Add listener for real-time activity updates
   */
  subscribe(listener: ActivityListener): () => void {
    this.listeners.add(listener)

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Get activity statistics
   */
  getStats(): {
    total: number
    byType: Record<ActivityType, number>
    byStatus: Record<ActivityStatus, number>
    successRate: number
    averageExecutionTimeMs: number
    sessionDurationMs: number
  } {
    const byType: Record<ActivityType, number> = {
      tool_call: 0,
      tool_result: 0,
      thinking: 0,
      error: 0,
    }

    const byStatus: Record<ActivityStatus, number> = {
      pending: 0,
      success: 0,
      error: 0,
    }

    let totalExecutionTime = 0
    let executionCount = 0

    this.activities.forEach(activity => {
      byType[activity.type]++

      if (activity.status) {
        byStatus[activity.status]++
      }

      if (activity.executionTimeMs) {
        totalExecutionTime += activity.executionTimeMs
        executionCount++
      }
    })

    const successCount = byStatus['success'] || 0
    const errorCount = byStatus['error'] || 0
    const totalComplete = successCount + errorCount

    return {
      total: this.activities.length,
      byType,
      byStatus,
      successRate: totalComplete > 0 ? (successCount / totalComplete) * 100 : 100,
      averageExecutionTimeMs: executionCount > 0 ? totalExecutionTime / executionCount : 0,
      sessionDurationMs: Date.now() - this.sessionStartTime,
    }
  }

  /**
   * Export activities as JSON
   */
  export(): string {
    return JSON.stringify(
      {
        activities: this.activities,
        stats: this.getStats(),
        exportedAt: new Date().toISOString(),
      },
      null,
      2,
    )
  }

  /**
   * Export activities as CSV for spreadsheet analysis
   */
  exportAsCSV(): string {
    const headers = ['timestamp', 'type', 'status', 'toolName', 'executionTimeMs', 'result']

    const rows = this.activities.map(a => [
      a.timestamp.toISOString(),
      a.type,
      a.status || '',
      a.toolName || '',
      a.executionTimeMs || '',
      typeof a.result === 'string' ? a.result : JSON.stringify(a.result || ''),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row
          .map(cell => (typeof cell === 'string' && cell.includes(',') ? `"${cell.replace(/"/g, '""')}"` : cell))
          .join(','),
      ),
    ].join('\n')

    return csvContent
  }
}

// Global instance
export const activityLog = new ActivityLog()

// Make available globally for debugging
if (typeof window !== 'undefined') {
  ;(window as any).__wordGptActivityLog = activityLog
}

export default activityLog
