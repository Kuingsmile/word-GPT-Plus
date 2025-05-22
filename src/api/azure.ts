import { AzureOpenAI } from 'openai'
import { BaseChatCompletionOptions } from './types'
import { updateResult, handleError, finishLoading } from './utils'

interface ChatCompletionStreamOptions extends BaseChatCompletionOptions {
  azureAPIKey: string
  azureAPIEndpoint: string
  azureDeploymentName: string
  azureAPIVersion?: string
}

async function createChatCompletionStream(
  options: ChatCompletionStreamOptions
): Promise<void> {
  try {
    const client = new AzureOpenAI({
      dangerouslyAllowBrowser: true,
      apiKey: options.azureAPIKey,
      endpoint: options.azureAPIEndpoint,
      deployment: options.azureDeploymentName,
      apiVersion: options.azureAPIVersion ?? '2024-10-01'
    })

    const response = await client.chat.completions.create({
      model: options.azureDeploymentName,
      messages: options.messages as any[],
      max_tokens: options.maxTokens ?? 800,
      temperature: options.temperature ?? 0.7,
      stream: false
    })

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
