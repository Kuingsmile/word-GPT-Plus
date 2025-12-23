// MCP (Model Context Protocol) Types and Interfaces

export interface MCPServer {
  id: string
  name: string
  url: string
  enabled: boolean
  apiKey?: string
  description?: string
  tools?: MCPTool[]
  status: 'connected' | 'disconnected' | 'error'
  lastConnected?: number
}

export interface MCPTool {
  name: string
  description: string
  inputSchema: MCPToolInputSchema
  serverId?: string // Which MCP server provides this tool
}

export interface MCPToolInputSchema {
  type: 'object'
  properties: Record<string, MCPToolProperty>
  required?: string[]
}

export interface MCPToolProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  description?: string
  enum?: string[]
  items?: MCPToolProperty
  default?: any
}

export interface MCPToolCall {
  id: string
  name: string
  arguments: Record<string, any>
}

export interface MCPToolResult {
  toolCallId: string
  result: any
  error?: string
}

// Tool definition for LangChain integration
export interface LangChainTool {
  name: string
  description: string
  schema: Record<string, any>
  func: (input: Record<string, any>) => Promise<string>
}

export interface WordToolDefinition {
  name: string
  description: string
  inputSchema: MCPToolInputSchema
  execute: (args: Record<string, any>) => Promise<string>
}

// Agent mode configuration
export interface AgentConfig {
  enabledTools: string[]
  mcpServers: MCPServer[]
  maxIterations: number
  verbose: boolean
}
