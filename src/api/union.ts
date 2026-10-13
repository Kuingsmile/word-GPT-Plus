import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { isAIMessage, isToolMessage } from '@langchain/core/messages'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatGroq } from '@langchain/groq'
// import { MemorySaver } from '@langchain/langgraph'
import { ChatOllama } from '@langchain/ollama'
import { AzureChatOpenAI, ChatOpenAI } from '@langchain/openai'
import { createAgent } from 'langchain'

import { IndexedDBSaver } from '@/api/checkpoints'
import { logDiagnostic } from '@/utils/diagnostics'

import { createToolAuthorization } from './toolAuthorization'
import type {
  AgentOptions,
  AzureOptions,
  GeminiOptions,
  GroqOptions,
  OllamaOptions,
  OpenAIOptions,
  ProviderOptions,
} from './types'

const ModelCreators = {
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
  const startedAt = performance.now()
  try {
    if (!options.threadId) {
      options.threadId = crypto.randomUUID()
      logDiagnostic('log', '[Chat] New thread started', { threadId: options.threadId })
    }
    const agent = createAgent({
      model,
      tools: [],
      middleware: [createToolAuthorization([], () => [])],
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
  } catch (error) {
    if ((error instanceof Error && error.name === 'AbortError') || options.abortSignal?.aborted) {
      // Don't mark as error if intentionally aborted
      throw error
    }
    options.errorIssue.value = true
    logDiagnostic('error', '[Chat] Error', { error, threadId: options.threadId })
  } finally {
    logDiagnostic('log', '[Chat] Flow ended', {
      threadId: options.threadId,
      durationMs: performance.now() - startedAt,
    })
    options.loading.value = false
  }
}

async function executeAgentFlow(model: BaseChatModel, options: AgentOptions): Promise<void> {
  const startedAt = performance.now()
  try {
    if (!options.threadId) {
      options.threadId = crypto.randomUUID()
      logDiagnostic('log', '[Agent] New thread started', { threadId: options.threadId })
    }
    const tools = options.tools ?? []
    const agent = createAgent({
      model,
      tools,
      middleware: [createToolAuthorization(tools)],
      checkpointer,
    })

    const stream = await agent.stream(
      {
        messages: options.messages,
      },
      {
        recursionLimit: Number(options.recursionLimit), //最大迭代次数
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
      logDiagnostic('log', '[Agent] Step', {
        threadId: options.threadId,
        stepCount,
        messageCount: step.messages?.length || 0,
      })

      const messages = step.messages || []
      const lastMessage = messages[messages.length - 1]

      if (!lastMessage) continue

      const msg = lastMessage

      // Handle AI messages with tool calls
      if (isAIMessage(msg) && msg.tool_calls?.length) {
        logDiagnostic('log', '[Agent] Tool calls detected', {
          threadId: options.threadId,
          toolCallCount: msg.tool_calls.length,
        })
        for (const toolCall of msg.tool_calls) {
          logDiagnostic('log', '[Agent] Tool call', {
            threadId: options.threadId,
            toolCallId: toolCall.id,
          })
          if (options.onToolCall) {
            options.onToolCall(toolCall.name, toolCall.args)
          }
        }
      }

      // Handle tool result messages
      if (isToolMessage(msg)) {
        const toolName = msg.name || 'unknown'
        const toolContent = String(msg.content || '')
        logDiagnostic('log', '[Agent] Tool result', {
          threadId: options.threadId,
          toolCallId: msg.tool_call_id,
          contentLength: toolContent.length,
        })
        if (options.onToolResult) {
          options.onToolResult(toolName, toolContent, msg.status)
        }
      }

      // Handle AI message content (the final response)
      if (isAIMessage(msg) && msg.content) {
        const content = typeof msg.content === 'string' ? msg.content : ''
        if (content && (!msg.tool_calls || msg.tool_calls.length === 0)) {
          fullContent = content
          logDiagnostic('log', '[Agent] AI response', {
            threadId: options.threadId,
            contentLength: content.length,
          })
          options.onStream(fullContent)
        }
      }
    }

    logDiagnostic('log', '[Agent] Flow completed', { threadId: options.threadId, stepCount })
  } catch (error) {
    if ((error instanceof Error && error.name === 'AbortError') || options.abortSignal?.aborted) {
      throw error
    }
    if (error instanceof Error && error.name === 'GraphRecursionError') {
      options.errorIssue.value = 'recursionLimitExceeded'
    } else {
      options.errorIssue.value = true
    }
    // TODO: more specific error handling based on LangGraph error
    logDiagnostic('error', '[Agent] Error', { error, threadId: options.threadId })
  } finally {
    logDiagnostic('log', '[Agent] Flow ended', {
      threadId: options.threadId,
      durationMs: performance.now() - startedAt,
    })
    options.loading.value = false
  }
}

function createModel(options: ProviderOptions): BaseChatModel {
  switch (options.provider) {
    case 'official':
      return ModelCreators.official(options)
    case 'ollama':
      return ModelCreators.ollama(options)
    case 'groq':
      return ModelCreators.groq(options)
    case 'gemini':
      return ModelCreators.gemini(options)
    case 'azure':
      return ModelCreators.azure(options)
  }
}

export async function getChatResponse(options: ProviderOptions) {
  return executeChatFlow(createModel(options), options)
}

export async function getAgentResponse(options: AgentOptions) {
  return executeAgentFlow(createModel(options), options)
}
