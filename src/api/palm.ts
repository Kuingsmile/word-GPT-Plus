import { Ref } from 'vue'
import axios from 'axios'

interface ChatCompletionStreamOptions {
  palmAPIKey: string
  palmAPIEndpoint: string
  palmModel: string
  prompt: string
  result: Ref<string>
  errorIssue: Ref<boolean>
  loading: Ref<boolean>
  maxTokens?: number
  temperature?: number
}

async function createChatCompletionStream(
  options: ChatCompletionStreamOptions
): Promise<void> {
  try {
    const formatedEndpoint = options.palmAPIEndpoint
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
    const response = await axios.post(
      `https://${formatedEndpoint}/models/${options.palmModel}:generateText`,
      {
        prompt: {
          text: prompt
        },
        temperature: options.temperature,
        maxOutputTokens: options.maxTokens
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        params: {
          key: options.palmAPIKey
        }
      }
    )
    if (response.status !== 200) {
      throw new Error(`Status code: ${response.status}`)
    }
    options.result.value = response.data?.candidates[0]?.output || ''
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
