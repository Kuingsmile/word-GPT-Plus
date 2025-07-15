import { AgentStep, AgentChatCompletionOptions } from './types'
import { AgentAPIClient } from './api-client'
import { AgentModeHelper } from './mode-helper'
import { TaskAnalyzer } from './task-analyzer'
import { SimpleTaskExecutor } from './simple-executor'
import { ResultSynthesizer } from './result-synthesizer'
import { handleError, finishLoading } from '../utils'

export class AgentWorkflowManager {
  private steps: AgentStep[] = []
  private currentStep = 0
  private options: AgentChatCompletionOptions
  private debugMode = true

  private apiClient: AgentAPIClient
  private taskAnalyzer: TaskAnalyzer
  private simpleExecutor: SimpleTaskExecutor
  private resultSynthesizer: ResultSynthesizer

  constructor(options: AgentChatCompletionOptions) {
    this.options = options
    
    this.apiClient = new AgentAPIClient(options, this.debugMode)
    this.taskAnalyzer = new TaskAnalyzer(options, this.debugMode)
    this.simpleExecutor = new SimpleTaskExecutor(options, this.debugMode)
    this.resultSynthesizer = new ResultSynthesizer(options, this.debugMode)
    
    this.debugLog('AgentWorkflowManager initialized', { 
      agentMode: options.agentMode,
      maxSteps: options.agentMaxSteps,
      thinkingDepth: options.agentThinkingDepth,
      autoExecute: options.agentAutoExecute,
      baseModeAPI: options.agentBaseModeAPI
    })
  }

  private debugLog(message: string, data?: any): void {
    if (this.debugMode) {
      console.log(`[Agent Workflow] ${message}`, data || '')
    }
  }

  async executeWorkflow(): Promise<void> {
    try {
      this.debugLog('Starting workflow execution')
      
      const userMessage = Array.isArray(this.options.messages) 
        ? this.options.messages[this.options.messages.length - 1]?.content 
        : this.options.messages

      if (!userMessage) {
        throw new Error('No user message provided')
      }

      this.debugLog('User message extracted', { message: userMessage })

      const agentMode = this.options.agentMode
      this.debugLog('Agent mode detected', { agentMode })

      if (AgentModeHelper.isSimpleTask(agentMode, userMessage)) {
        await this.simpleExecutor.executeSimpleTask(userMessage)
        return
      }
      await this.executeComplexWorkflow(userMessage)

    } catch (error) {
      this.debugLog('Workflow execution failed', error)
      handleError(error as Error, this.options.result, this.options.errorIssue)
    } finally {
      finishLoading(this.options.loading)
      this.debugLog('Workflow execution finished')
    }
  }

  private async executeComplexWorkflow(userMessage: string): Promise<void> {
    this.options.result.value = '🤖 Agent Mode: Analyzing task...\n\n'

    this.debugLog('Phase 1: Task analysis starting')
    this.steps = await this.taskAnalyzer.analyzeTask(userMessage)
    this.debugLog('Task analysis completed', { totalSteps: this.steps.length })
    
    this.options.result.value += '📋 **Task Breakdown:**\n'
    this.steps.forEach(step => {
      this.options.result.value += `${step.stepNumber}. ${step.action}\n   *${step.reasoning}*\n\n`
    })
    
    this.options.result.value += '⚡ **Executing Steps:**\n\n'

    this.debugLog('Phase 2: Step execution starting')
    await this.executeSteps(userMessage)

    const completedSteps = this.steps.filter(step => step.status === 'completed')
    
    this.debugLog('Workflow execution phase completed', { 
      totalSteps: this.steps.length,
      completedSteps: completedSteps.length,
      currentStep: this.currentStep
    })
    
    if (completedSteps.length === this.steps.length) {
      this.debugLog('Phase 3: Result synthesis starting')
      const finalResult = await this.resultSynthesizer.synthesizeResults(this.steps, userMessage)
      
      this.options.result.value = finalResult

      this.options.historyDialog.value.push({
        role: 'assistant',
        content: finalResult
      })
      
      this.debugLog('Workflow completed successfully', { 
        finalResult: finalResult 
      })
    } else {
      this.debugLog('Workflow paused or partially completed', {
        completedSteps: completedSteps.length,
        totalSteps: this.steps.length,
        currentStep: this.currentStep
      })
    }
  }

  private async executeSteps(userMessage: string): Promise<void> {
    const context: string[] = []
    
    for (let i = 0; i < this.steps.length; i++) {
      this.currentStep = i + 1
      const step = this.steps[i]
      
      this.debugLog(`Starting step execution`, { 
        currentStep: this.currentStep, 
        stepNumber: step.stepNumber,
        action: step.action 
      })
      
      step.status = 'executing'
      this.options.result.value += `🔄 **Step ${step.stepNumber}**: ${step.action}\n`
      
      try {
        const result = await this.executeStep(step, context, userMessage)
        step.result = result
        step.status = 'completed'
        context.push(`Step ${step.stepNumber} result: ${result}`)
        
        this.options.result.value += `✅ ${result}\n\n`
        
        this.options.historyDialog.value.push({
          role: 'assistant',
          content: `Step ${step.stepNumber} completed: ${result}`
        })
        
        this.debugLog(`Step ${step.stepNumber} completed successfully`, { 
          currentStep: this.currentStep,
          resultLength: result.length 
        })
        
      } catch (error) {
        step.status = 'failed'
        step.result = `Error: ${error}`
        this.options.result.value += `❌ Failed: ${error}\n\n`
        
        this.debugLog(`Step ${step.stepNumber} failed`, { 
          currentStep: this.currentStep,
          error: error 
        })
      }

      if (!this.options.agentAutoExecute && i < this.steps.length - 1) {
        this.debugLog('Pausing execution - auto-execute disabled', { 
          currentStep: this.currentStep,
          remainingSteps: this.steps.length - i - 1 
        })
        this.options.result.value += '⏸️ *Paused for user confirmation. Click "Continue" to proceed to the next step.*\n\n'
        break
      }
    }
  }

  private async executeStep(step: AgentStep, context: string[], originalTask: string): Promise<string> {
    this.debugLog(`Executing step ${step.stepNumber}`, { 
      action: step.action, 
      reasoning: step.reasoning,
      contextLength: context.length 
    })
    
    const executionPrompt = [
      {
        role: 'system',
        content: `You are executing step ${step.stepNumber} of a multi-step workflow to complete this task: "${originalTask}"
        
        Current step: ${step.action}
        Reasoning: ${step.reasoning}
        
        Context from previous steps:
        ${context.join('\n\n')}
        
        IMPORTANT: Execute this step directly and provide the actual work/content requested. Do NOT ask for more information or wait for user input. You have all the context you need from the original task.
        
        For example:
        - If the step is "Research about apples", provide actual research content about apples
        - If the step is "Create an outline", provide an actual outline
        - If the step is "Write content", provide the actual written content
        - If the step is "Review and refine", provide the refined version
        
        Be comprehensive and complete in your response.`
      },
      {
        role: 'user',
        content: `Original task: "${originalTask}"
        
        Execute this specific step: ${step.action}
        
        Provide the actual deliverable for this step, not instructions on how to do it.`
      }
    ]

    const result = await this.apiClient.callBaseAPI(executionPrompt)
    this.debugLog(`Step ${step.stepNumber} execution completed`, { resultLength: result.length })
    return result
  }

  getCurrentStepInfo(): { currentStep: number; totalSteps: number; stepInfo?: AgentStep } {
    return {
      currentStep: this.currentStep,
      totalSteps: this.steps.length,
      stepInfo: this.currentStep > 0 && this.currentStep <= this.steps.length 
        ? this.steps[this.currentStep - 1] 
        : undefined
    }
  }

  getAllSteps(): AgentStep[] {
    return [...this.steps]
  }

  async continueExecution(): Promise<void> {
    this.debugLog('Continuing execution from current step', { currentStep: this.currentStep })
    
    if (this.currentStep >= this.steps.length) {
      this.debugLog('No more steps to execute')
      return
    }

    const userMessage = Array.isArray(this.options.messages) 
      ? this.options.messages[this.options.messages.length - 1]?.content 
      : this.options.messages

    const context: string[] = []
    
    for (let i = 0; i < this.currentStep - 1; i++) {
      if (this.steps[i].status === 'completed') {
        context.push(`Step ${this.steps[i].stepNumber} result: ${this.steps[i].result}`)
      }
    }

    for (let i = this.currentStep - 1; i < this.steps.length; i++) {
      this.currentStep = i + 1
      const step = this.steps[i]
      
      if (step.status === 'completed') {
        continue
      }
      
      this.debugLog(`Continuing step execution`, { 
        currentStep: this.currentStep, 
        stepNumber: step.stepNumber,
        action: step.action 
      })
      
      step.status = 'executing'
      this.options.result.value += `🔄 **Step ${step.stepNumber}**: ${step.action}\n`
      
      try {
        const result = await this.executeStep(step, context, userMessage)
        step.result = result
        step.status = 'completed'
        context.push(`Step ${step.stepNumber} result: ${result}`)
        
        this.options.result.value += `✅ ${result}\n\n`
        
        this.options.historyDialog.value.push({
          role: 'assistant',
          content: `Step ${step.stepNumber} completed: ${result}`
        })
        
        this.debugLog(`Step ${step.stepNumber} completed successfully`, { 
          currentStep: this.currentStep,
          resultLength: result.length 
        })
        
      } catch (error) {
        step.status = 'failed'
        step.result = `Error: ${error}`
        this.options.result.value += `❌ Failed: ${error}\n\n`
        
        this.debugLog(`Step ${step.stepNumber} failed`, { 
          currentStep: this.currentStep,
          error: error 
        })
      }

      if (!this.options.agentAutoExecute && i < this.steps.length - 1) {
        this.debugLog('Pausing execution - auto-execute disabled', { 
          currentStep: this.currentStep,
          remainingSteps: this.steps.length - i - 1 
        })
        this.options.result.value += '⏸️ *Paused for user confirmation. Click "Continue" to proceed to the next step.*\n\n'
        break
      }
    }

    const completedSteps = this.steps.filter(step => step.status === 'completed')
    if (completedSteps.length === this.steps.length) {
      this.debugLog('All steps completed, starting final synthesis')
      const finalResult = await this.resultSynthesizer.synthesizeResults(this.steps, userMessage)
      
      this.options.result.value = finalResult

      this.options.historyDialog.value.push({
        role: 'assistant',
        content: finalResult
      })
    }
  }

  resetWorkflow(): void {
    this.debugLog('Resetting workflow state')
    this.steps = []
    this.currentStep = 0
  }
}
