// MCP Client Manager - Manages MCP server connections and tools
import { MCPServer, MCPTool, MCPToolResult } from '@/types/mcp'
import { tool } from '@langchain/core/tools'
import { z } from 'zod'

const MCP_SERVERS_STORAGE_KEY = 'mcpServers'

class MCPManager {
  private servers: Map<string, MCPServer> = new Map()
  private toolsCache: Map<string, MCPTool[]> = new Map()

  constructor() {
    this.loadServersFromStorage()
  }

  // Load servers from localStorage
  private loadServersFromStorage(): void {
    try {
      const stored = localStorage.getItem(MCP_SERVERS_STORAGE_KEY)
      if (stored) {
        const servers: MCPServer[] = JSON.parse(stored)
        servers.forEach(server => {
          this.servers.set(server.id, { ...server, status: 'disconnected' })
        })
      }
    } catch (error) {
      console.error('Failed to load MCP servers from storage:', error)
    }
  }

  // Save servers to localStorage
  private saveServersToStorage(): void {
    const servers = Array.from(this.servers.values())
    localStorage.setItem(MCP_SERVERS_STORAGE_KEY, JSON.stringify(servers))
  }

  // Add a new MCP server
  addServer(server: Omit<MCPServer, 'id' | 'status'>): MCPServer {
    const newServer: MCPServer = {
      ...server,
      id: `mcp_${Date.now()}`,
      status: 'disconnected',
      tools: []
    }
    this.servers.set(newServer.id, newServer)
    this.saveServersToStorage()
    return newServer
  }

  // Remove an MCP server
  removeServer(serverId: string): boolean {
    const deleted = this.servers.delete(serverId)
    if (deleted) {
      this.toolsCache.delete(serverId)
      this.saveServersToStorage()
    }
    return deleted
  }

  // Update an MCP server
  updateServer(
    serverId: string,
    updates: Partial<MCPServer>
  ): MCPServer | null {
    const server = this.servers.get(serverId)
    if (!server) return null

    const updatedServer = { ...server, ...updates, id: serverId }
    this.servers.set(serverId, updatedServer)
    this.saveServersToStorage()
    return updatedServer
  }

  // Get all servers
  getServers(): MCPServer[] {
    return Array.from(this.servers.values())
  }

  // Get a specific server
  getServer(serverId: string): MCPServer | undefined {
    return this.servers.get(serverId)
  }

  // Connect to an MCP server and discover its tools
  async connectServer(serverId: string): Promise<MCPTool[]> {
    const server = this.servers.get(serverId)
    if (!server) {
      throw new Error(`Server ${serverId} not found`)
    }

    try {
      // Fetch tools from the MCP server
      const tools = await this.discoverTools(server)

      // Update server status and tools
      server.status = 'connected'
      server.tools = tools
      server.lastConnected = Date.now()
      this.servers.set(serverId, server)
      this.toolsCache.set(serverId, tools)
      this.saveServersToStorage()

      return tools
    } catch (error) {
      server.status = 'error'
      this.servers.set(serverId, server)
      this.saveServersToStorage()
      throw error
    }
  }

  // Disconnect from an MCP server
  disconnectServer(serverId: string): void {
    const server = this.servers.get(serverId)
    if (server) {
      server.status = 'disconnected'
      this.servers.set(serverId, server)
      this.toolsCache.delete(serverId)
      this.saveServersToStorage()
    }
  }

  // Discover tools from an MCP server
  private async discoverTools(server: MCPServer): Promise<MCPTool[]> {
    try {
      const response = await fetch(`${server.url}/tools`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(server.apiKey ? { Authorization: `Bearer ${server.apiKey}` } : {})
        }
      })

      if (!response.ok) {
        throw new Error(
          `Failed to fetch tools: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()
      const tools: MCPTool[] = (data.tools || []).map((t: any) => ({
        ...t,
        serverId: server.id
      }))

      return tools
    } catch (error) {
      console.error(`Failed to discover tools from ${server.name}:`, error)
      throw error
    }
  }

  // Execute a tool on an MCP server
  async executeTool(
    serverId: string,
    toolName: string,
    args: Record<string, any>
  ): Promise<MCPToolResult> {
    const server = this.servers.get(serverId)
    if (!server) {
      return {
        toolCallId: toolName,
        result: null,
        error: `Server ${serverId} not found`
      }
    }

    try {
      const response = await fetch(`${server.url}/tools/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(server.apiKey ? { Authorization: `Bearer ${server.apiKey}` } : {})
        },
        body: JSON.stringify({
          name: toolName,
          arguments: args
        })
      })

      if (!response.ok) {
        throw new Error(
          `Tool execution failed: ${response.status} ${response.statusText}`
        )
      }

      const result = await response.json()
      return {
        toolCallId: toolName,
        result: result.result || result
      }
    } catch (error: any) {
      return {
        toolCallId: toolName,
        result: null,
        error: error.message || 'Unknown error'
      }
    }
  }

  // Get all available tools from all enabled servers
  getAllTools(): MCPTool[] {
    const allTools: MCPTool[] = []

    for (const server of this.servers.values()) {
      if (server.enabled && server.tools) {
        allTools.push(...server.tools)
      }
    }

    return allTools
  }

  // Convert MCP tools to LangChain tools
  createLangChainTools(serverIds?: string[]): any[] {
    const tools: any[] = []

    for (const server of this.servers.values()) {
      if (!server.enabled || (serverIds && !serverIds.includes(server.id))) {
        continue
      }

      const serverTools = server.tools || []

      for (const mcpTool of serverTools) {
        // Create zod schema from MCP tool schema
        const schemaObj: Record<string, z.ZodTypeAny> = {}

        if (mcpTool.inputSchema?.properties) {
          for (const [propName, prop] of Object.entries(
            mcpTool.inputSchema.properties
          )) {
            let zodType: z.ZodTypeAny

            switch (prop.type) {
              case 'string':
                zodType = prop.enum
                  ? z.enum(prop.enum as [string, ...string[]])
                  : z.string()
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

            if (!mcpTool.inputSchema.required?.includes(propName)) {
              zodType = zodType.optional()
            }

            schemaObj[propName] = zodType
          }
        }

        const langChainTool = tool(
          async input => {
            const result = await this.executeTool(
              server.id,
              mcpTool.name,
              input
            )
            if (result.error) {
              return `Error: ${result.error}`
            }
            return typeof result.result === 'string'
              ? result.result
              : JSON.stringify(result.result)
          },
          {
            name: `${server.name}_${mcpTool.name}`,
            description: mcpTool.description || `Tool from ${server.name}`,
            schema: z.object(schemaObj)
          }
        )

        tools.push(langChainTool)
      }
    }

    return tools
  }

  // Toggle server enabled status
  toggleServer(serverId: string, enabled: boolean): MCPServer | null {
    return this.updateServer(serverId, { enabled })
  }
}

// Singleton instance
export const mcpManager = new MCPManager()

// Export for Vue composable usage
export function useMCPManager() {
  return {
    addServer: (server: Omit<MCPServer, 'id' | 'status'>) =>
      mcpManager.addServer(server),
    removeServer: (serverId: string) => mcpManager.removeServer(serverId),
    updateServer: (serverId: string, updates: Partial<MCPServer>) =>
      mcpManager.updateServer(serverId, updates),
    getServers: () => mcpManager.getServers(),
    getServer: (serverId: string) => mcpManager.getServer(serverId),
    connectServer: (serverId: string) => mcpManager.connectServer(serverId),
    disconnectServer: (serverId: string) =>
      mcpManager.disconnectServer(serverId),
    getAllTools: () => mcpManager.getAllTools(),
    createLangChainTools: (serverIds?: string[]) =>
      mcpManager.createLangChainTools(serverIds),
    toggleServer: (serverId: string, enabled: boolean) =>
      mcpManager.toggleServer(serverId, enabled)
  }
}
