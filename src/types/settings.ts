import { Settings } from '../settings/schema'

export { Settings }
export type { Settings as WordGptPlusSettings }

export type SupportedPlatforms = 'official' | 'azure' | 'gemini' | 'ollama' | 'groq' | 'mistral'

export type InsertTypes = 'replace' | 'append' | 'newLine' | 'NoAction'

export type IStringKeyMap = Record<string, any>
