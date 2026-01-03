import { Messages } from '@langchain/langgraph'
import { Ref } from 'vue'

export interface BaseChatCompletionOptions {
  messages: Messages
  result: Ref<string>
  errorIssue: Ref<boolean>
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

export interface MistralOptions extends BaseChatCompletionOptions {
  provider: 'mistral'
  mistralModel: string
  mistralAPIKey: string
}

export interface OpenWebUIOptions extends BaseChatCompletionOptions {
  provider: 'openwebui'
  openwebuiBaseURL: string
  openwebuiAPIKey: string
  openwebuiModel: string
}

export type ProviderOptions =
  | OpenAIOptions
  | OllamaOptions
  | GroqOptions
  | GeminiOptions
  | AzureOptions
  | MistralOptions
  | OpenWebUIOptions

type supportedProviders = 'official' | 'ollama' | 'groq' | 'gemini' | 'azure' | 'mistral' | 'openwebui'
// Agent options with tools support
export interface AgentOptions extends BaseChatCompletionOptions {
  provider: supportedProviders
  tools?: any[]
  onToolCall?: (toolName: string, args: any) => void
  onToolResult?: (toolName: string, result: string) => void
  // Provider-specific options
  model?: string
  config?: {
    apiKey: string
    baseURL?: string
    dangerouslyAllowBrowser?: boolean
  }
  ollamaModel?: string
  ollamaEndpoint?: string
  groqModel?: string
  groqAPIKey?: string
  geminiModel?: string
  geminiAPIKey?: string
  azureAPIKey?: string
  azureAPIEndpoint?: string
  azureDeploymentName?: string
  azureAPIVersion?: string
  mistralModel?: string
  mistralAPIKey?: string
  openwebuiBaseURL?: string
  openwebuiAPIKey?: string
  openwebuiModel?: string
}
