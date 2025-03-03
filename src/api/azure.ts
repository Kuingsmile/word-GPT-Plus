import {
  OpenAIClient,
  AzureKeyCredential,
  GetChatCompletionsOptions
} from '@azure/openai'
import { BaseChatCompletionOptions } from './types'
import { updateResult, handleError, finishLoading } from './utils'

interface ChatCompletionStreamOptions extends BaseChatCompletionOptions {
  azureAPIKey: string
  azureAPIEndpoint: string
  azureDeploymentName: string
}

async function createChatCompletionStream(
  options: ChatCompletionStreamOptions
): Promise<void> {
  try {
    const client = new OpenAIClient(
      options.azureAPIEndpoint,
      new AzureKeyCredential(options.azureAPIKey)
    )

    const requestConfig: GetChatCompletionsOptions = {
      maxTokens: options.maxTokens ?? 800,
      temperature: options.temperature ?? 0.7,
      stream: false
    }

    const response = await client.getChatCompletions(
      options.azureDeploymentName,
      options.messages as any[],
      requestConfig
    )

    updateResult(
      {
        content:
          response.choices[0].message?.content?.replace(/\\n/g, '\n') ?? ''
      },
      options.result,
      options.historyDialog
    )
  } catch (error) {
    handleError(error as Error, options.result, options.errorIssue)
  } finally {
    finishLoading(options.loading)
  }
}

export default { createChatCompletionStream }
