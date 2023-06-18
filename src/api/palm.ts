import { Ref } from 'vue'
import axios from 'axios'

async function createChatCompletionStream (
  palmAPIKey: string,
  palmAPIEndpoint: string,
  palmModel: string,
  prompt: string,
  result: Ref<string>,
  errorIssue: Ref<boolean>,
  loading: Ref<boolean>,
  maxTokens?: number,
  temperature?: number
): Promise<void> {
  let formatedEndpoint = palmAPIEndpoint
  if (/^https?:\/\//.test(palmAPIEndpoint)) {
    formatedEndpoint = palmAPIEndpoint.replace(/^https?:\/\//, '')
  }
  formatedEndpoint = formatedEndpoint.replace(/\/$/, '')
  const url = `https://${formatedEndpoint}/models/${palmModel}:generateText`
  const headers = {
    'Content-Type': 'application/json'
  }
  const query = {
    key: palmAPIKey
  }
  const body = {
    prompt: {
      text: prompt
    },
    temperature,
    maxOutputTokens: maxTokens
  }
  let response
  try {
    response = await axios.post(url, body, {
      headers,
      params: query
    })
    if (response.status !== 200) {
      throw new Error(`Status code: ${response.status}`)
    } else {
      result.value = response.data?.candidates[0]?.output || ''
    }
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
