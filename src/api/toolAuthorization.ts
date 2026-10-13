import { ToolMessage } from '@langchain/core/messages'
import type { StructuredToolInterface } from '@langchain/core/tools'
import { createMiddleware } from 'langchain'

import { loadActiveToolNames } from '@/utils/activeTools'
import { resolveToolSelection, toolPermissionError } from '@/utils/toolPermissions'

export function createToolAuthorization(
  tools: StructuredToolInterface[],
  readAllowedNames: () => readonly string[] = loadActiveToolNames,
) {
  const registeredNames = tools.map(tool => tool.name)
  const allowedNames = () => resolveToolSelection(readAllowedNames, registeredNames, [])

  return createMiddleware({
    name: 'ActiveToolAllowlist',
    wrapModelCall: (request, handler) => {
      const allowed = allowedNames()
      return handler({
        ...request,
        tools: request.tools.filter(tool => typeof tool.name === 'string' && allowed.includes(tool.name)),
      })
    },
    wrapToolCall: (request, handler) => {
      const { name, id } = request.toolCall
      // A model or checkpoint can request tools that were never exposed, or have been revoked.
      if (!request.tool || !allowedNames().includes(name)) {
        return new ToolMessage({
          name,
          tool_call_id: id ?? '',
          status: 'error',
          content: toolPermissionError(name),
        })
      }
      return handler(request)
    },
  })
}
