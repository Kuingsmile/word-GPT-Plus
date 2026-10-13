import type { StructuredToolInterface } from '@langchain/core/tools'
import type { Messages } from '@langchain/langgraph'
import type { Ref } from 'vue'

export interface BaseChatCompletionOptions {
  messages: Messages
  errorIssue: Ref<boolean | string | null> // extends string for specific issues
  loading: Ref<boolean>
  maxTokens?: number
  temperature?: number
  abortSignal?: AbortSignal
  threadId: string
  onStream: (text: string) => void
}

export interface OpenAIOptions extends BaseChatCompletionOptions {
  provider: 'official'
  model?: string
  config: {
    apiKey: string
    baseURL?: string
    dangerouslyAllowBrowser?: boolean
  }
}

export interface OllamaOptions extends BaseChatCompletionOptions {
  provider: 'ollama'
  ollamaModel: string
  ollamaEndpoint?: string
}

export interface GroqOptions extends BaseChatCompletionOptions {
  provider: 'groq'
  groqModel: string
  groqAPIKey: string
}

export interface GeminiOptions extends BaseChatCompletionOptions {
  provider: 'gemini'
  geminiModel?: string
  geminiAPIKey: string
}

export interface AzureOptions extends BaseChatCompletionOptions {
  provider: 'azure'
  azureAPIKey: string
  azureAPIEndpoint: string
  azureDeploymentName: string
  azureAPIVersion?: string
}

export type ProviderOptions = OpenAIOptions | OllamaOptions | GroqOptions | GeminiOptions | AzureOptions

export type ProviderConfig = {
  [P in ProviderOptions['provider']]: Omit<Extract<ProviderOptions, { provider: P }>, keyof BaseChatCompletionOptions> &
    Pick<BaseChatCompletionOptions, 'maxTokens' | 'temperature'>
}[ProviderOptions['provider']]

export type AgentOptions = ProviderOptions & {
  tools?: StructuredToolInterface[]
  onToolCall?: (toolName: string, args: Record<string, unknown>) => void
  onToolResult?: (toolName: string, result: string, status?: 'success' | 'error') => void
  recursionLimit?: number
  checkpointId?: string
}
