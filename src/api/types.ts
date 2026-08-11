import { Messages } from '@langchain/langgraph'
import { Ref } from 'vue'

export interface BaseChatCompletionOptions {
  messages: Messages
  result: Ref<string>
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

export interface AtlasCloudOptions extends BaseChatCompletionOptions {
  provider: 'atlascloud'
  atlascloudAPIKey: string
  atlascloudBasePath?: string
  atlascloudModel?: string
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

export type ProviderOptions =
  | OpenAIOptions
  | AtlasCloudOptions
  | OllamaOptions
  | GroqOptions
  | GeminiOptions
  | AzureOptions

type supportedProviders = 'official' | 'atlascloud' | 'ollama' | 'groq' | 'gemini' | 'azure'
// Agent options with tools support
export interface AgentOptions extends BaseChatCompletionOptions {
  provider: supportedProviders
  tools?: any[]
  onToolCall?: (toolName: string, args: any) => void
  onToolResult?: (toolName: string, result: string) => void
  recursionLimit?: number
  checkpointId?: string
  // Provider-specific options
  model?: string
  config?: {
    apiKey: string
    baseURL?: string
    dangerouslyAllowBrowser?: boolean
  }
  atlascloudAPIKey?: string
  atlascloudBasePath?: string
  atlascloudModel?: string
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
}
