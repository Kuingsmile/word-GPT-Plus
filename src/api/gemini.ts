import { GoogleGenAI } from '@google/genai'
import { BaseChatCompletionOptions } from './types'
import { handleError, finishLoading } from './utils'
import { toRaw } from 'vue'

interface ChatCompletionStreamOptions extends BaseChatCompletionOptions {
  geminiAPIKey: string
  geminiModel?: string
}

async function createChatCompletionStream(
  options: ChatCompletionStreamOptions
): Promise<void> {
  try {
    const genAI = new GoogleGenAI({
      apiKey: options.geminiAPIKey
    })

    const chat = genAI.chats.create({
      model: options.geminiModel ?? 'gemini-1.5-pro',
      history: toRaw(options.historyDialog.value),
      config: {
        maxOutputTokens: options.maxTokens ?? 800,
        temperature: options.temperature ?? 0.7
      }
    })

    const result = await chat.sendMessage({
      message: options.messages as string
    })
    if (result.text === undefined) {
      throw new Error('No response from Gemini API')
    }
    options.result.value = result.text

    options.historyDialog.value.push(
      {
        role: 'user',
        parts: [{ text: options.messages as string }]
      },
      {
        role: 'model',
        parts: [{ text: result.text }]
      }
    )
  } catch (error) {
    handleError(error as Error, options.result, options.errorIssue)
  } finally {
    finishLoading(options.loading)
  }
}

export default { createChatCompletionStream }
