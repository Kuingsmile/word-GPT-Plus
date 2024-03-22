import { Ref } from 'vue'
import axios from 'axios'

async function createChatCompletionStream (
  ollamaEndpoint: string,
  ollamaModel: string,
  messages: any[],
  result: Ref<string>,
  historyDialog: Ref<any[]>,
  errorIssue: Ref<boolean>,
  loading: Ref<boolean>,
  temperature?: number
): Promise<void> {
  const formatedEndpoint = ollamaEndpoint.replace(/\/$/, '')
  const url = `${formatedEndpoint}/api/chat`
  const headers = {
    'Content-Type': 'application/json'
  }
  const body = {
    model: ollamaModel,
    options: {
      temperature
    },
    stream: false,
    messages
  }
  let response
  try {
    response = await axios.post(url, body, {
      headers
    })
    if (response.status !== 200) {
      throw new Error(`Status code: ${response.status}`)
    }
    result.value = response.data?.message?.content?.replace(/\\n/g, '\n') ?? ''
    historyDialog.value.push({
      role: 'assistant',
      content: result.value
    })
  } catch (error) {
    console.error(error)
    result.value = String(error)
    errorIssue.value = true
  }
  loading.value = false
}

export default {
  createChatCompletionStream
}
