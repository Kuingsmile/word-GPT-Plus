import axios from 'axios'
import { BaseChatCompletionOptions } from './types'
import { updateResult, handleError, finishLoading } from './utils'

interface ChatCompletionStreamOptions extends BaseChatCompletionOptions {
  ollamaEndpoint: string
  ollamaModel: string
}

async function createChatCompletionStream(
  options: ChatCompletionStreamOptions
): Promise<void> {
  try {
    const formatedEndpoint = options.ollamaEndpoint.replace(/\/$/, '')
    const response = await axios.post(
      `${formatedEndpoint}/api/chat`,
      {
        model: options.ollamaModel,
        options: { temperature: options.temperature },
        stream: false,
        messages: options.messages
      },
      { headers: { 'Content-Type': 'application/json' } }
    )

    if (response.status !== 200) {
      throw new Error(`Status code: ${response.status}`)
    }

    updateResult(
      { content: response.data?.message?.content?.replace(/\\n/g, '\n') ?? '' },
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
