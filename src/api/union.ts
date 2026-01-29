import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatGroq } from '@langchain/groq'
// import { MemorySaver } from '@langchain/langgraph'
import { ChatOllama } from '@langchain/ollama'
import { AzureChatOpenAI, ChatOpenAI } from '@langchain/openai'
import { createAgent } from 'langchain'

import { IndexedDBSaver } from '@/api/checkpoints'

import {
  AgentOptions,
  AzureOptions,
  GeminiOptions,
  GroqOptions,
  OllamaOptions,
  OpenAIOptions,
  ProviderOptions,
} from './types'

const ModelCreators: Record<string, (opts: any) => BaseChatModel> = {
  official: (opts: OpenAIOptions) => {
    const modelName = opts.model || 'gpt-5'
    return new ChatOpenAI({
      modelName,
      configuration: {
        apiKey: opts.config.apiKey,
        baseURL: opts.config.baseURL || 'https://api.openai.com/v1',
      },
      temperature: opts.temperature ?? 0.7,
      maxTokens: opts.maxTokens ?? 800,
    })
  },

  ollama: (opts: OllamaOptions) => {
    return new ChatOllama({
      model: opts.ollamaModel,
      baseUrl: opts.ollamaEndpoint?.replace(/\/$/, '') || 'http://localhost:11434',
      temperature: opts.temperature,
    })
  },

  groq: (opts: GroqOptions) => {
    return new ChatGroq({
      model: opts.groqModel,
      apiKey: opts.groqAPIKey,
      temperature: opts.temperature ?? 0.5,
      maxTokens: opts.maxTokens ?? 1024,
    })
  },

  gemini: (opts: GeminiOptions) => {
    return new ChatGoogleGenerativeAI({
      model: opts.geminiModel ?? 'gemini-3-pro-preview',
      apiKey: opts.geminiAPIKey,
      temperature: opts.temperature ?? 0.7,
      maxOutputTokens: opts.maxTokens ?? 800,
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
      azureOpenAIApiVersion: opts.azureAPIVersion ?? '2024-10-01',
    })
  },
}

// const checkpointer = new MemorySaver()
const checkpointer = new IndexedDBSaver()

async function executeChatFlow(model: BaseChatModel, options: ProviderOptions): Promise<void> {
  try {
    if (!options.threadId) {
      options.threadId = crypto.randomUUID()
      console.log(`[Chat] New thread started: ${options.threadId}`)
    }
    const agent = createAgent({
      model,
      tools: [],
      checkpointer,
    })
    const stream = await agent.stream(
      {
        messages: options.messages,
      },
      {
        signal: options.abortSignal,
        configurable: { thread_id: options.threadId },
        streamMode: 'messages',
      },
    )

    let fullContent = ''
    for await (const chunk of stream) {
      if (options.abortSignal?.aborted) {
        break
      }

      const content = typeof chunk[0].content === 'string' ? chunk[0].content : ''
      fullContent += content
      options.onStream(fullContent)
    }
  } catch (error: any) {
    if (error.name === 'AbortError' || options.abortSignal?.aborted) {
      // Don't mark as error if intentionally aborted
      throw error
    }
    options.errorIssue.value = true
    console.error(error)
  } finally {
    options.loading.value = false
  }
}

async function executeAgentFlow(model: BaseChatModel, options: AgentOptions): Promise<void> {
  try {
    if (!options.threadId) {
      options.threadId = crypto.randomUUID()
      console.log(`[Agent] New thread started: ${options.threadId}`)
    }
    const agent = createAgent({
      model,
      tools: options.tools || [],
      checkpointer,
    })

    const stream = await agent.stream(
      {
        messages: options.messages,
      },
      {
        recursionLimit: options.recursionLimit, //最大迭代次数
        signal: options.abortSignal,
        configurable: {
          thread_id: options.threadId,
          checkpoint_id: options.checkpointId,
        },
        streamMode: 'values',
      },
    )

    let fullContent = ''
    let stepCount = 0

    for await (const step of stream) {
      if (options.abortSignal?.aborted) {
        break
      }

      stepCount++
      console.log(`[Agent] Step ${stepCount}:`, {
        messageCount: step.messages?.length || 0,
        lastMessageType: step.messages?.[step.messages.length - 1]?.constructor?.name,
      })

      const messages = step.messages || []
      const lastMessage = messages[messages.length - 1]

      if (!lastMessage) continue

      // Cast to any for accessing tool-related properties
      const msg = lastMessage as any

      console.log(`[Agent] Message type: ${msg._getType?.() || 'unknown'}`)

      // Handle AI messages with tool calls
      if (msg._getType?.() === 'ai' && msg.tool_calls?.length > 0) {
        console.log('[Agent] Tool calls detected:', msg.tool_calls.length)
        for (const toolCall of msg.tool_calls) {
          console.log('[Agent] Tool call:', {
            name: toolCall.name,
            args: toolCall.args,
          })
          if (options.onToolCall) {
            options.onToolCall(toolCall.name, toolCall.args)
          }
        }
      }

      // Handle tool result messages
      if (msg._getType?.() === 'tool') {
        const toolName = msg.name || 'unknown'
        const toolContent = String(msg.content || '')
        console.log('[Agent] Tool result:', {
          name: toolName,
          contentLength: toolContent.length,
          contentPreview: toolContent.substring(0, 100),
        })
        if (options.onToolResult) {
          options.onToolResult(toolName, toolContent)
        }
      }

      // Handle AI message content (the final response)
      if (msg._getType?.() === 'ai' && msg.content) {
        const content = typeof msg.content === 'string' ? msg.content : ''
        if (content && (!msg.tool_calls || msg.tool_calls.length === 0)) {
          fullContent = content
          console.log('[Agent] AI response:', {
            content,
          })
          options.onStream(fullContent)
        }
      }
    }

    console.log('[Agent] Flow completed. Total steps:', stepCount)
  } catch (error: any) {
    console.error('[Agent] Error:', error)
    if (error.name === 'AbortError' || options.abortSignal?.aborted) {
      throw error
    }
    if (error.name === 'GraphRecursionError') {
      options.errorIssue.value = 'recursionLimitExceeded'
    }
    // TODO: more specific error handling based on LangGraph error
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

export async function getAgentResponse(options: AgentOptions) {
  const creator = ModelCreators[options.provider]
  if (!creator) {
    throw new Error(`Unsupported provider: ${options.provider}`)
  }
  const model = creator(options)
  return executeAgentFlow(model, options)
}
