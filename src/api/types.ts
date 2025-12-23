import { Ref } from 'vue'

export interface BaseChatCompletionOptions {
  messages: any
  result: Ref<string>
  errorIssue: Ref<boolean>
  loading: Ref<boolean>
  maxTokens?: number
  temperature?: number
  abortSignal?: AbortSignal
  threadId: string
  onStream: (text: string) => void
}

export interface CompletionResponse {
  content: string
  role?: string
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