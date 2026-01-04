// Common utility types
export type IStringKeyMap = Record<string, any>

export type SupportedPlatforms = 'official' | 'azure' | 'gemini' | 'ollama' | 'groq' | 'mistral'

export type InsertTypes = 'replace' | 'append' | 'newLine' | 'NoAction'

export interface MessageOptions {
  message: string
  type?: 'error' | 'success' | 'info' | 'warning'
  duration?: number
}
