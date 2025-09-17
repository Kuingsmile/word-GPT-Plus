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
    const defaultModel = 'gpt-5'
    let model = options.model ?? defaultModel
    if (Object.keys(availableModels).includes(model)) {
      model = availableModels[model]
    }

    const isGpt5Family =
      model === 'gpt-5' || model === 'gpt-5-mini' || model === 'gpt-5-nano'

    const temperature = isGpt5Family ? 1 : options.temperature ?? 0.7

    const response = await openai.chat.completions.create({
      model,
      messages: options.messages as any[],
      temperature,
      ...(isGpt5Family
        ? { max_output_tokens: options.maxTokens ?? 5000 }
        : { max_tokens: options.maxTokens ?? 800 })
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
