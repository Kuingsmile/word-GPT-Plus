import Groq from 'groq-sdk'
import { BaseChatCompletionOptions } from './types'
import { updateResult, handleError, finishLoading } from './utils'

interface ChatCompletionStreamOptions extends BaseChatCompletionOptions {
  groqAPIKey: string
  groqModel: string
}

async function createChatCompletionStream(
  options: ChatCompletionStreamOptions
): Promise<void> {
  try {
    const groq = new Groq({
      apiKey: options.groqAPIKey,
      dangerouslyAllowBrowser: true
    })

    const response = await groq.chat.completions.create({
      model: options.groqModel,
      messages: options.messages as any[],
      temperature: options.temperature ?? 0.5,
      max_tokens: options.maxTokens ?? 1024
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
    handleError(error as Error, options.result, options.errorIssue)
  } finally {
    finishLoading(options.loading)
  }
}

export default { createChatCompletionStream }
