import { GoogleGenerativeAI } from '@google/generative-ai'
import { Ref } from 'vue'

interface ChatCompletionStreamOptions {
  geminiAPIKey: string
  messages: string
  result: Ref<string>
  historyDialog: Ref<any[]>
  errorIssue: Ref<boolean>
  loading: Ref<boolean>
  maxTokens?: number
  temperature?: number
  geminiModel?: string
}

async function createChatCompletionStream (options: ChatCompletionStreamOptions): Promise<void> {
  const apiKey = options.geminiAPIKey
  const generationConfig = {
    maxOutputTokens: options.maxTokens ?? 800,
    temperature: options.temperature ?? 0.7
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: options.geminiModel ?? 'gemini-pro'
    },
    {
      apiVersion: 'v1beta'
    })
    const chat = model.startChat({
      history: options.historyDialog.value,
      generationConfig
    })
    const result = await chat.sendMessage(options.messages)
    const response = await result.response
    const text = response.text()
    updateResultAndHistory(text, options.messages, options.result, options.historyDialog)
  } catch (error: any) {
    handleError(error, options.result, options.errorIssue)
  }
  options.loading.value = false
}

function updateResultAndHistory (
  text: string,
  userText: string,
  result: Ref<string>,
  historyDialog: Ref<any[]>
): void {
  result.value = text
  historyDialog.value.push(...[
    {
      role: 'user',
      parts: [
        {
          text: userText
        }
      ]
    },
    {
      role: 'model',
      parts: [
        {
          text
        }
      ]
    }])
}

function handleError (error: Error, result: Ref<string>, errorIssue: Ref<boolean>): void {
  result.value = String(error)
  errorIssue.value = true
  console.error(error)
}

export default {
  createChatCompletionStream
}
