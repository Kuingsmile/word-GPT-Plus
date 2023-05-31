import { opts } from '@/types'
import { ChatGPTUnofficialProxyAPI, ChatMessage } from 'chatgpt'
import { Ref } from 'vue'
import API from '@/api'

const apiReverseProxyUrl = 'https://ai.fakeopen.com/api/conversation'

function setUnofficalConfig (accessToken: string): opts {
  const configParams: opts = {
    accessToken,
    apiReverseProxyUrl
  }
  return configParams
}

async function createChatCompletionUnoffical (
  config: opts,
  messages: any[],
  parentMessageId: Ref<string>,
  conversationId: Ref<string>,
  jsonIssue: Ref<boolean>,
  errorIssue: Ref<boolean>,
  result: Ref<string>,
  insertType: Ref<string>,
  loading: Ref<boolean>
) : Promise<void> {
  const unOfficalAPI = new ChatGPTUnofficialProxyAPI(config)
  let response
  try {
    response = await unOfficalAPI.sendMessage(
      messages[0] + '\n' + messages[1],
      {
        onProgress: (partialResponse: ChatMessage) => {
          result.value = partialResponse.text
        }
      }
    )
    parentMessageId.value = response.parentMessageId ?? ''
    conversationId.value = response.conversationId ?? ''
    loading.value = false
  } catch (error) {
    console.error(error)
    if (String(error).includes('SyntaxError') && String(error).includes('JSON')) {
      let count = 0
      let oldResult = ''
      jsonIssue.value = true
      const interval = setInterval(() => {
        if (count > 30) {
          clearInterval(interval)
          jsonIssue.value = false
          loading.value = false
          API.common.insertResult(result, insertType)
        }
        if (oldResult !== result.value) {
          oldResult = result.value
          count = 0
        } else {
          count++
        }
      }, 100)
    } else {
      result.value = String(error)
      errorIssue.value = true
      loading.value = false
    }
  }
}

export default {
  setUnofficalConfig,
  createChatCompletionUnoffical
}
