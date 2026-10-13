import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { z } from 'zod'

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function messageContentToText(content: unknown, separator = ''): string {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content
    .map((part: unknown) => {
      if (typeof part === 'string') return part
      if (!isRecord(part)) return ''
      if (typeof part.text === 'string') return part.text
      return typeof part.data === 'string' ? part.data : ''
    })
    .join(separator)
}

const storedMessageSchema = z.object({
  type: z.enum(['human', 'ai']),
  content: z.union([z.string(), z.array(z.object({ type: z.string() }).passthrough())]),
})

export function restoreChatMessages(value: unknown): (HumanMessage | AIMessage)[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item: unknown) => {
    const result = storedMessageSchema.safeParse(item)
    if (!result.success) return []
    const { type, content } = result.data
    return [type === 'human' ? new HumanMessage(content) : new AIMessage(content)]
  })
}
