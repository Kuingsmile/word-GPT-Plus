type IStringKeyMap = Record<string, string>

type supportedPlatforms = 'official' | 'azure' | 'gemini' | 'ollama' | 'groq'

type insertTypes = 'replace' | 'append' | 'newLine' | 'NoAction'

interface ToolInputSchema {
  type: 'object'
  properties: Record<string, ToolProperty>
  required?: readonly string[]
}

interface ToolProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  description?: string
  enum?: readonly string[]
  items?: ToolProperty
  default?: unknown
}
interface WordToolDefinition {
  name: string
  description: string
  inputSchema: ToolInputSchema
  execute: (args: Record<string, unknown>) => Promise<string>
}
