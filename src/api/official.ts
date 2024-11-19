import OpenAI, { ClientOptions } from 'openai'
import { availableModels } from '@/utils/constant'
import { Ref } from 'vue'

function setConfig(apiKey: string, basePath?: string): ClientOptions {
  const config = {
    apiKey,
    baseURL: basePath || 'https://api.openai.com/v1',
    dangerouslyAllowBrowser: true
  }
  return config
}

interface ChatCompletionStreamOptions {
  config: ClientOptions
  messages: any[]
  result: Ref<string>
  historyDialog: Ref<any[]>
  errorIssue: Ref<boolean>
  loading: Ref<boolean>
  maxTokens?: number
  temperature?: number
  model?: string
}

async function createChatCompletionStream(
  options: ChatCompletionStreamOptions
): Promise<void> {
  try {
    const openai = new OpenAI(options.config)
    if (Object.keys(availableModels).includes(options.model ?? '')) {
      options.model = availableModels[options.model ?? '']
    }
    const requestConfig = {
      model: options.model ?? 'gpt-3.5-turbo',
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 800
    }
    const response = await openai.chat.completions.create(requestConfig)
    options.result.value =
      response.choices[0].message?.content?.replace(/\\n/g, '\n') ?? ''
    options.historyDialog.value.push({
      role: 'assistant',
      content: options.result.value
    })
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      options.result.value = error.message
      options.errorIssue.value = true
      console.error(error.message)
    } else {
      options.result.value = String(error)
      options.errorIssue.value = true
      console.error(error)
    }
  }
  options.loading.value = false
}

export default {
  setConfig,
  createChatCompletionStream
}
