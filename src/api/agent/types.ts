import { BaseChatCompletionOptions } from '../types'

export interface AgentChatCompletionOptions extends BaseChatCompletionOptions {
  agentMode: 'auto-workflow' | 'multi-step' | 'research-assistant' | 'writing-coach' | 'document-analyzer' | string
  agentMaxSteps: number
  agentThinkingDepth: number
  agentAutoExecute: boolean
  agentBaseModeAPI: string

  apiKey?: string
  azureAPIKey?: string
  azureAPIEndpoint?: string
  azureDeploymentName?: string
  azureAPIVersion?: string
  geminiAPIKey?: string
  geminiModel?: string
  groqAPIKey?: string
  groqModel?: string
  ollamaEndpoint?: string
  ollamaModel?: string
  officialModel?: string
  officialBasePath?: string
}

export interface AgentStep {
  stepNumber: number
  action: string
  reasoning: string
  result: string
  status: 'pending' | 'executing' | 'completed' | 'failed'
}

export type AgentMode = 'auto-workflow' | 'multi-step' | 'research-assistant' | 'writing-coach' | 'document-analyzer'

export interface WorkflowExecutionContext {
  userMessage: string
  agentMode: string
  steps: AgentStep[]
  currentStep: number
  context: string[]
}
