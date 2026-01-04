import { z } from 'zod'

export type WordToolName =
  | 'getSelectedText'
  | 'getDocumentContent'
  | 'insertText'
  | 'replaceSelectedText'
  | 'appendText'
  | 'insertParagraph'
  | 'formatText'
  | 'searchAndReplace'
  | 'getDocumentProperties'
  | 'insertTable'
  | 'insertList'
  | 'deleteText'
  | 'clearFormatting'
  | 'setFontName'
  | 'insertPageBreak'
  | 'getRangeInfo'
  | 'selectText'
  | 'insertImage'
  | 'getTableInfo'
  | 'insertBookmark'
  | 'goToBookmark'
  | 'insertContentControl'
  | 'findText'

export interface ToolInputSchema {
  type: 'object'
  properties: Record<string, ToolProperty>
  required?: string[]
}

export interface ToolProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  description?: string
  enum?: string[]
  items?: ToolProperty
  default?: any
}

export interface WordToolDefinition {
  name: string
  description: string
  inputSchema: ToolInputSchema
  execute: (args: Record<string, any>) => Promise<string>
}
