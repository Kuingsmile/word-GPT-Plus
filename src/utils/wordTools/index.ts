import { tool } from '@langchain/core/tools'
import { z, ZodTypeAny } from 'zod'

import { contentControlTools } from './content-control-tools'
import { documentTools } from './document-tools'
import { formattingTools } from './formatting-tools'
import { navigationTools } from './navigation-tools'
import { structureTools } from './structure-tools'
import { textTools } from './text-tools'
import { WordToolDefinition, WordToolName } from './types'

export const wordToolDefinitions: Record<WordToolName, WordToolDefinition> = {
  ...textTools,
  ...formattingTools,
  ...structureTools,
  ...documentTools,
  ...navigationTools,
  ...contentControlTools,
}

export function getWordToolDefinitions(): Record<WordToolName, WordToolDefinition> {
  return wordToolDefinitions
}

export function getWordToolByName(name: WordToolName): WordToolDefinition | undefined {
  return wordToolDefinitions[name]
}

export function getAllWordToolNames(): WordToolName[] {
  return Object.keys(wordToolDefinitions) as WordToolName[]
}

export function createWordTools(enabledTools?: WordToolName[]) {
  const tools = Object.entries(wordToolDefinitions)
    .filter(([name]) => !enabledTools || enabledTools.includes(name as WordToolName))
    .map(([, def]) => {
      const schemaObj: Record<string, z.ZodTypeAny> = {}

      for (const [propName, prop] of Object.entries(def.inputSchema.properties)) {
        let zodType: z.ZodTypeAny

        switch (prop.type) {
          case 'string':
            zodType = prop.enum ? z.enum(prop.enum as [string, ...string[]]) : z.string()
            break
          case 'number':
            zodType = z.number()
            break
          case 'boolean':
            zodType = z.boolean()
            break
          case 'array':
            zodType = z.array(z.any())
            break
          default:
            zodType = z.any()
        }

        if (prop.description) {
          zodType = zodType.describe(prop.description)
        }

        if (!def.inputSchema.required?.includes(propName)) {
          zodType = zodType.optional()
        }

        schemaObj[propName] = zodType
      }

      return tool(
        async input => {
          try {
            return await def.execute(input)
          } catch (error: any) {
            return `Error: ${error.message || 'Unknown error occurred'}`
          }
        },
        {
          name: def.name,
          description: def.description,
          schema: z.object(schemaObj),
        },
      )
    })

  return tools
}

export * from './types'
