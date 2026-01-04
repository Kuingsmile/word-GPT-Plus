import { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { AIMessage, AIMessageChunk, BaseMessage } from '@langchain/core/messages'
import { ChatGeneration, ChatGenerationChunk, ChatResult } from '@langchain/core/outputs'

interface MistralChatParams {
  apiKey: string
  model: string
  temperature?: number
  maxTokens?: number
}

/**
 * Minimal Mistral Chat implementation using direct fetch
 * Avoids CORS issues by not using OpenAI SDK's custom headers
 */
export class MistralChat extends BaseChatModel {
  private apiKey: string
  private modelName: string
  private temperature: number
  private maxTokens: number

  constructor(params: MistralChatParams) {
    super({})
    this.apiKey = params.apiKey
    this.modelName = params.model
    this.temperature = params.temperature ?? 0.7
    this.maxTokens = params.maxTokens ?? 1024
  }

  _llmType(): string {
    return 'mistral'
  }

  async _generate(
    messages: BaseMessage[],
    options?: this['ParsedCallOptions'],
    runManager?: CallbackManagerForLLMRun,
  ): Promise<ChatResult> {
    const mistralMessages = messages.map(msg => {
      const type = msg._getType()
      if (type === 'human') {
        return { role: 'user' as const, content: msg.content as string }
      } else if (type === 'ai') {
        return { role: 'assistant' as const, content: msg.content as string }
      } else if (type === 'system') {
        return { role: 'system' as const, content: msg.content as string }
      }
      return { role: 'user' as const, content: msg.content as string }
    })

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: mistralMessages,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      }),
      signal: options?.signal,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Mistral API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    return {
      generations: [
        {
          text: content,
          message: new AIMessage(content),
        },
      ],
    }
  }

  async *_streamResponseChunks(
    messages: BaseMessage[],
    options?: this['ParsedCallOptions'],
    runManager?: CallbackManagerForLLMRun,
  ): AsyncGenerator<ChatGenerationChunk> {
    const mistralMessages = messages.map(msg => {
      const type = msg._getType()
      if (type === 'human') {
        return { role: 'user' as const, content: msg.content as string }
      } else if (type === 'ai') {
        return { role: 'assistant' as const, content: msg.content as string }
      } else if (type === 'system') {
        return { role: 'system' as const, content: msg.content as string }
      }
      return { role: 'user' as const, content: msg.content as string }
    })

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: mistralMessages,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        stream: true,
      }),
      signal: options?.signal,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Mistral API error: ${response.status} - ${error}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === 'data: [DONE]') continue

          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6))
              const content = data.choices?.[0]?.delta?.content

              if (content) {
                yield new ChatGenerationChunk({
                  text: content,
                  message: new AIMessageChunk(content),
                })
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  // Required by LangChain agent system
  bindTools(tools: any[]): this {
    return this
  }
}
