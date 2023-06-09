import { OpenAIClient, AzureKeyCredential, GetChatCompletionsOptions, ChatCompletions } from '@azure/openai'
import { Ref } from 'vue'

async function createChatCompletionStream (
  azureAPIKey: string,
  azureAPIEndpoint: string,
  azureDeploymentName: string,
  messages: any[],
  result: Ref<string>,
  historyDialog: Ref<any[]>,
  errorIssue: Ref<boolean>,
  loading: Ref<boolean>,
  maxTokens?: number,
  temperature?: number
): Promise<void> {
  const client = new OpenAIClient(
    azureAPIEndpoint,
    new AzureKeyCredential(azureAPIKey)
  )
  const requestConfig: GetChatCompletionsOptions = {
    maxTokens: maxTokens ?? 800,
    temperature: temperature ?? 0.7,
    stream: false
  }
  let response
  let data
  try {
    response = await client.getChatCompletions(azureDeploymentName, messages, requestConfig) as ChatCompletions
    data = response
    result.value = data.choices[0].message?.content?.replace(/\\n/g, '\n') ?? ''
    historyDialog.value.push({
      role: 'assistant',
      content: result.value
    })
  } catch (error) {
    result.value = String(error)
    errorIssue.value = true
    console.error(error)
  }
  loading.value = false
}

export default {
  createChatCompletionStream
}
