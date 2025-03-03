import { Ref } from 'vue'

export interface BaseChatCompletionOptions {
  messages: any[] | string
  result: Ref<string>
  historyDialog: Ref<any[]>
  errorIssue: Ref<boolean>
  loading: Ref<boolean>
  maxTokens?: number
  temperature?: number
}

export interface CompletionResponse {
  content: string
  role?: string
}
