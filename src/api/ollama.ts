import { Ref } from 'vue'
import axios from 'axios'

interface ChatCompletionStreamOptions {
  ollamaEndpoint: string
  ollamaModel: string
  messages: any[]
  result: Ref<string>
  historyDialog: Ref<any[]>
  errorIssue: Ref<boolean>
  loading: Ref<boolean>
  temperature?: number
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
        options: {
          temperature: options.temperature
        },
        stream: false,
        messages: options.messages
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    if (response.status !== 200) {
      throw new Error(`Status code: ${response.status}`)
    }
    options.result.value =
      response.data?.message?.content?.replace(/\\n/g, '\n') ?? ''
    options.historyDialog.value.push({
      role: 'assistant',
      content: options.result.value
    })
  } catch (error) {
    console.error(error)
    options.result.value = String(error)
    options.errorIssue.value = true
  }
  options.loading.value = false
}

export default {
  createChatCompletionStream
}
