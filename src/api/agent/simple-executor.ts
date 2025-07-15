import { AgentChatCompletionOptions } from './types'
import { AgentAPIClient } from './api-client'
import { AgentModeHelper } from './mode-helper'
import { handleError, finishLoading } from '../utils'

export class SimpleTaskExecutor {
  private apiClient: AgentAPIClient
  private options: AgentChatCompletionOptions
  private debugMode: boolean

  constructor(options: AgentChatCompletionOptions, debugMode = true) {
    this.options = options
    this.apiClient = new AgentAPIClient(options, debugMode)
    this.debugMode = debugMode
  }

  private debugLog(message: string, data?: any): void {
    if (this.debugMode) {
      console.log(`[Simple Task] ${message}`, data || '')
    }
  }

  async executeSimpleTask(userMessage: string): Promise<void> {
    this.debugLog('Executing simple task directly')
    
    const { systemPrompt, prefixesToRemove } = AgentModeHelper.getSimpleTaskOptimization(this.options.agentMode)
    
    const directPrompt = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userMessage
      }
    ]

    try {
      const result = await this.apiClient.callBaseAPI(directPrompt)
      
      let cleanResult = result.trim()
      
      for (const pattern of prefixesToRemove) {
        cleanResult = cleanResult.replace(pattern, '')
      }
      
      this.options.result.value = cleanResult
      
      this.options.historyDialog.value.push({
        role: 'assistant',
        content: cleanResult
      })
      
      this.debugLog('Simple task completed successfully', { resultLength: cleanResult.length })
      
    } catch (error) {
      this.debugLog('Simple task execution failed', error)
      handleError(error as Error, this.options.result, this.options.errorIssue)
    } finally {
      finishLoading(this.options.loading)
    }
  }
}
