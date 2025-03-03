import OpenAI, { ClientOptions } from 'openai'
import { availableModels } from '@/utils/constant'
import { BaseChatCompletionOptions } from './types'
import { updateResult, handleError, finishLoading } from './utils'

function setConfig(apiKey: string, basePath?: string): ClientOptions {
  return {
    apiKey,
    baseURL: basePath || 'https://api.openai.com/v1',
    dangerouslyAllowBrowser: true
  }
}

interface ChatCompletionStreamOptions extends BaseChatCompletionOptions {
  config: ClientOptions
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

    const response = await openai.chat.completions.create({
      model: options.model ?? 'gpt-3.5-turbo',
      messages: options.messages as any[],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 800
    })

    updateResult(
      {
        content:
          response.choices[0].message?.content?.replace(/\\n/g, '\n') ?? ''
      },
      options.result,
      options.historyDialog
    )
  } catch (error) {
    const message =
      error instanceof OpenAI.APIError ? error.message : String(error)
    handleError(new Error(message), options.result, options.errorIssue)
  } finally {
    finishLoading(options.loading)
  }
}

export default {
  setConfig,
  createChatCompletionStream
}
