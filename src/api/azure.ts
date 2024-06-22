import {
  OpenAIClient,
  AzureKeyCredential,
  GetChatCompletionsOptions,
  ChatCompletions
} from '@azure/openai'
import { Ref } from 'vue'

interface ChatCompletionStreamOptions {
  azureAPIKey: string
  azureAPIEndpoint: string
  azureDeploymentName: string
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
  const client = createOpenAIClient(
    options.azureAPIKey,
    options.azureAPIEndpoint
  )
  const requestConfig: GetChatCompletionsOptions = createRequestConfig(
    options.maxTokens,
    options.temperature
  )
  try {
    const response = await getChatCompletions(
      client,
      options.azureDeploymentName,
      options.messages,
      requestConfig
    )
    updateResultAndHistory(response, options.result, options.historyDialog)
  } catch (error: any) {
    handleError(error, options.result, options.errorIssue)
  }
  options.loading.value = false
}

function createOpenAIClient(apiKey: string, apiEndpoint: string): OpenAIClient {
  return new OpenAIClient(apiEndpoint, new AzureKeyCredential(apiKey))
}

function createRequestConfig(
  maxTokens?: number,
  temperature?: number
): GetChatCompletionsOptions {
  return {
    maxTokens: maxTokens ?? 800,
    temperature: temperature ?? 0.7,
    stream: false
  }
}

async function getChatCompletions(
  client: OpenAIClient,
  deploymentName: string,
  messages: any[],
  config: GetChatCompletionsOptions
): Promise<ChatCompletions> {
  return (await client.getChatCompletions(
    deploymentName,
    messages,
    config
  )) as ChatCompletions
}

function updateResultAndHistory(
  response: ChatCompletions,
  result: Ref<string>,
  historyDialog: Ref<any[]>
): void {
  const content =
    response.choices[0].message?.content?.replace(/\\n/g, '\n') ?? ''
  result.value = content
  historyDialog.value.push({
    role: 'assistant',
    content
  })
}

function handleError(
  error: Error,
  result: Ref<string>,
  errorIssue: Ref<boolean>
): void {
  result.value = String(error)
  errorIssue.value = true
  console.error(error)
}

export default {
  createChatCompletionStream
}
