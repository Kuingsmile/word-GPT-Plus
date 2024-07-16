import Groq from 'groq-sdk'
import { Ref } from 'vue'

interface ChatCompletionStreamOptions {
  groqAPIKey: string
  groqModel: string
  messages: any[]
  result: Ref<string>
  historyDialog: Ref<any[]>
  errorIssue: Ref<boolean>
  loading: Ref<boolean>
  maxTokens?: number
  temperature?: number
}

async function createChatCompletionStream(
  options: ChatCompletionStreamOptions
): Promise<void> {
  try {
    const groq = new Groq({
      apiKey: options.groqAPIKey,
      dangerouslyAllowBrowser: true
    })
    const requestConfig = {
      model: options.groqModel,
      messages: options.messages,
      temperature: options.temperature ?? 0.5,
      max_tokens: options.maxTokens ?? 1024
    }

    const response = await groq.chat.completions.create(requestConfig)
    options.result.value =
      response.choices[0].message?.content?.replace(/\\n/g, '\n') ?? ''
    options.historyDialog.value.push({
      role: 'assistant',
      content: options.result.value
    })
  } catch (error) {
    options.result.value = String(error)
    options.errorIssue.value = true
    console.error(error)
  }
  options.loading.value = false
}

export default {
  createChatCompletionStream
}
