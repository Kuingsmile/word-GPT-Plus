import { GoogleGenerativeAI } from '@google/generative-ai'
import { BaseChatCompletionOptions } from './types'
import { handleError, finishLoading } from './utils'

interface ChatCompletionStreamOptions extends BaseChatCompletionOptions {
  geminiAPIKey: string
  geminiModel?: string
}

async function createChatCompletionStream(
  options: ChatCompletionStreamOptions
): Promise<void> {
  try {
    const genAI = new GoogleGenerativeAI(options.geminiAPIKey)
    const model = genAI.getGenerativeModel(
      { model: options.geminiModel ?? 'gemini-1.5-pro' },
      { apiVersion: 'v1beta' }
    )

    const chat = model.startChat({
      history: options.historyDialog.value,
      generationConfig: {
        maxOutputTokens: options.maxTokens ?? 800,
        temperature: options.temperature ?? 0.7
      }
    })

    const result = await chat.sendMessage(options.messages as string)
    const text = (await result.response).text()

    options.result.value = text
    options.historyDialog.value.push(
      {
        role: 'user',
        parts: [{ text: options.messages as string }]
      },
      {
        role: 'model',
        parts: [{ text }]
      }
    )
  } catch (error) {
    handleError(error as Error, options.result, options.errorIssue)
  } finally {
    finishLoading(options.loading)
  }
}

export default { createChatCompletionStream }
