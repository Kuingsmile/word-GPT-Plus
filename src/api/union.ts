import { availableModels } from '@/utils/constant'
import { AzureOptions, GeminiOptions, GroqOptions, OllamaOptions, OpenAIOptions, ProviderOptions } from './types'
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { ChatOpenAI, AzureChatOpenAI } from '@langchain/openai'
import { ChatGroq } from '@langchain/groq'
import { ChatOllama } from '@langchain/ollama'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'

const ModelCreators: Record<string, (opts: any) => BaseChatModel> = {
  openai: (opts: OpenAIOptions) => {
    const modelName =
      availableModels[opts.model ?? ''] || opts.model || 'gpt-3.5-turbo'
    return new ChatOpenAI({
      modelName,
      configuration: {
        apiKey: opts.config.apiKey,
        baseURL: opts.config.baseURL || 'https://api.openai.com/v1'
      },
      temperature: opts.temperature ?? 0.7,
      maxTokens: opts.maxTokens ?? 800
    })
  },

  ollama: (opts: OllamaOptions) => {
    return new ChatOllama({
      model: opts.ollamaModel,
      baseUrl:
        opts.ollamaEndpoint?.replace(/\/$/, '') || 'http://localhost:11434',
      temperature: opts.temperature
    })
  },

  groq: (opts: GroqOptions) => {
    return new ChatGroq({
      model: opts.groqModel,
      apiKey: opts.groqAPIKey,
      temperature: opts.temperature ?? 0.5,
      maxTokens: opts.maxTokens ?? 1024
    })
  },

  gemini: (opts: GeminiOptions) => {
    return new ChatGoogleGenerativeAI({
      model: opts.geminiModel ?? 'gemini-2.5-pro',
      apiKey: opts.geminiAPIKey,
      temperature: opts.temperature ?? 0.7,
      maxOutputTokens: opts.maxTokens ?? 800
    })
  },

  azure: (opts: AzureOptions) => {
    return new AzureChatOpenAI({
      model: opts.azureDeploymentName,
      temperature: opts.temperature ?? 0.7,
      maxTokens: opts.maxTokens ?? 800,
      azureOpenAIApiKey: opts.azureAPIKey,
      azureOpenAIEndpoint: opts.azureAPIEndpoint,
      azureOpenAIApiDeploymentName: opts.azureDeploymentName,
      azureOpenAIApiVersion: opts.azureAPIVersion ?? '2024-10-01'
    })
  }
}

async function executeChatFlow(
  model: BaseChatModel,
  options: ProviderOptions
): Promise<void> {
  try {
    const response = await model.invoke(options.messages)

    const content = (
      typeof response.content === 'string'
        ? response.content
        : (response as any).text || ''
    ).replace(/\\n/g, '\n')

    options.result.value = content
    if (options.provider === 'gemini') {
      options.historyDialog.value.push(
        {
          role: 'user',
          parts: [{ text: options.messages as string }]
        },
        {
          role: 'model',
          parts: [{ text: content }]
        }
      )
    } else {
      options.historyDialog.value.push({
        role: 'assistant',
        content: response.content
      })
    }
  } catch (error) {
    options.result.value = String(error)
    options.errorIssue.value = true
    console.error(error)
  } finally {
    options.loading.value = false
  }
}


export async function getChatResponse(options: ProviderOptions) {
  const creator = ModelCreators[options.provider]
  if (!creator) {
    throw new Error(`Unsupported provider: ${options.provider}`)
  }
  const model = creator(options)
  return executeChatFlow(model, options)
}
