export type GeneralToolName = 'fetchWebContent' | 'searchWeb' | 'getCurrentDate' | 'calculateMath'

export interface GeneralToolDefinition {
  name: string
  description: string
  execute: (args: Record<string, any>) => Promise<string>
}

export type WordToolName =
  | 'getSelectedText'
  | 'insertText'
  | 'replaceText'
  | 'formatText'
  | 'clearFormatting'
  | 'setFont'
  | 'setFontSize'
  | 'setFontColor'
  | 'setBackgroundColor'
  | 'findText'
  | 'replaceAllText'
  | 'goToPage'
  | 'goToBookmark'
  | 'createBookmark'
  | 'deleteBookmark'
  | 'getDocumentContent'
  | 'getDocumentProperties'
  | 'getDocumentRange'
  | 'setParagraphAlignment'
  | 'setLineSpacing'
  | 'insertPageBreak'
  | 'insertTable'
  | 'insertList'
  | 'insertImage'
  | 'addContentControl'
  | 'removeContentControl'
  | 'getContentControls'

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
