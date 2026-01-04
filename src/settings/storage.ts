import { defaultSettings, Settings, SettingsSchema } from './schema'

const STORAGE_KEY = 'word-gpt-plus-settings-v2'

export class SettingsStorage {
  static load(): Settings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        return defaultSettings
      }

      const parsed = JSON.parse(stored)

      // Auto-correct common issues before validation
      const corrected = this.autoCorrectSettings(parsed)

      // Validate and merge with defaults
      const validated = SettingsSchema.parse(corrected)
      return validated
    } catch (error) {
      console.error('Failed to load settings, attempting recovery:', error)

      // Try partial recovery
      const recovered = this.attemptPartialRecovery()
      if (recovered) {
        console.log('Settings partially recovered')
        return recovered
      }

      console.error('Settings recovery failed, using defaults')
      return defaultSettings
    }
  }

  static save(settings: Settings): void {
    try {
      const validated = SettingsSchema.parse(settings)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validated))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  static clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  }

  /**
   * Automatically correct common settings issues
   */
  private static autoCorrectSettings(raw: any): any {
    const corrected = { ...raw }

    // Fix missing provider structure
    if (corrected.provider === 'official' && !corrected.openai) {
      corrected.openai = { ...defaultSettings.openai }
      console.log('Auto-corrected: Added missing OpenAI settings')
    }

    if (corrected.provider === 'openwebui' && !corrected.openwebui) {
      corrected.openwebui = { ...defaultSettings.openwebui }
      console.log('Auto-corrected: Added missing OpenWebUI settings')
    }

    // Fix corrupted knowledge base settings
    if (corrected.openwebui?.knowledgeBase?.enabled) {
      if (!Array.isArray(corrected.openwebui.knowledgeBase.selectedCollections)) {
        corrected.openwebui.knowledgeBase.selectedCollections = []
        console.log('Auto-corrected: Fixed knowledge base collections format')
      }
    }

    // Fix missing temperature/maxTokens
    if (corrected.openai) {
      if (!corrected.openai.temperature || typeof corrected.openai.temperature !== 'number') {
        corrected.openai.temperature = defaultSettings.openai.temperature
      }
      if (!corrected.openai.maxTokens || typeof corrected.openai.maxTokens !== 'number') {
        corrected.openai.maxTokens = defaultSettings.openai.maxTokens
      }
    }

    if (corrected.openwebui) {
      if (!corrected.openwebui.temperature || typeof corrected.openwebui.temperature !== 'number') {
        corrected.openwebui.temperature = defaultSettings.openwebui.temperature
      }
      if (!corrected.openwebui.maxTokens || typeof corrected.openwebui.maxTokens !== 'number') {
        corrected.openwebui.maxTokens = defaultSettings.openwebui.maxTokens
      }
    }

    // Ensure all required fields exist
    if (!corrected.localLanguage) {
      corrected.localLanguage = defaultSettings.localLanguage
    }

    if (!corrected.replyLanguage) {
      corrected.replyLanguage = defaultSettings.replyLanguage
    }

    if (!corrected.provider) {
      corrected.provider = defaultSettings.provider
    }

    // Fix tools array
    if (!Array.isArray(corrected.tools?.wordTools)) {
      if (!corrected.tools) corrected.tools = {}
      corrected.tools.wordTools = []
    }
    if (!Array.isArray(corrected.tools?.generalTools)) {
      if (!corrected.tools) corrected.tools = {}
      corrected.tools.generalTools = []
    }

    return corrected
  }

  /**
   * Attempt to recover settings piece by piece if main recovery fails
   */
  private static attemptPartialRecovery(): Settings | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null

      const parsed = JSON.parse(stored)
      const recovered: Partial<Settings> = {}

      // Try to recover each field individually
      if (parsed.localLanguage && ['en', 'zh-CN'].includes(parsed.localLanguage)) {
        recovered.localLanguage = parsed.localLanguage
      }

      if (parsed.replyLanguage && ['en', 'zh-CN', 'auto'].includes(parsed.replyLanguage)) {
        recovered.replyLanguage = parsed.replyLanguage
      }

      if (parsed.provider) {
        recovered.provider = parsed.provider
      }

      if (parsed.openai && typeof parsed.openai === 'object') {
        recovered.openai = parsed.openai
      }

      if (parsed.openwebui && typeof parsed.openwebui === 'object') {
        recovered.openwebui = parsed.openwebui
      }

      if (Array.isArray(parsed.tools?.wordTools)) {
        if (!recovered.tools) recovered.tools = {}
        recovered.tools.wordTools = parsed.tools.wordTools
      }

      if (Array.isArray(parsed.tools?.generalTools)) {
        if (!recovered.tools) recovered.tools = {}
        recovered.tools.generalTools = parsed.tools.generalTools
      }

      // Merge with defaults
      const result = { ...defaultSettings, ...recovered }
      return result
    } catch (error) {
      console.error('Partial recovery failed:', error)
      return null
    }
  }

  static migrateFromLegacy(): Settings {
    // Try to migrate from old settings structure
    try {
      const legacySettings = {
        localLanguage: localStorage.getItem('localLanguage') || 'zh-CN',
        replyLanguage: localStorage.getItem('replyLanguage') || 'auto',
        provider: localStorage.getItem('provider') || 'official',
        openaiAPIKey: localStorage.getItem('openaiAPIKey') || '',
        openaiBaseURL: localStorage.getItem('openaiBaseURL') || 'https://api.openai.com/v1',
        openaiModel: localStorage.getItem('openaiModel') || 'gpt-4',
        openaiTemperature: localStorage.getItem('openaiTemperature') || '0.7',
        openaiMaxTokens: localStorage.getItem('openaiMaxTokens') || '800',
        openwebuiJWTToken: localStorage.getItem('openwebuiJWTToken') || '',
        openwebuiBaseURL: localStorage.getItem('openwebuiBaseURL') || '',
        openwebuiModel: localStorage.getItem('openwebuiModel') || '',
        openwebuiTemperature: localStorage.getItem('openwebuiTemperature') || '0.7',
        openwebuiMaxTokens: localStorage.getItem('openwebuiMaxTokens') || '1024',
      }

      const newSettings: Settings = {
        ...defaultSettings,
        localLanguage: legacySettings.localLanguage as 'en' | 'zh-CN',
        replyLanguage: legacySettings.replyLanguage as 'en' | 'zh-CN' | 'auto',
        provider: legacySettings.provider as any,
        openai: {
          apiKey: legacySettings.openaiAPIKey,
          baseURL: legacySettings.openaiBaseURL,
          model: legacySettings.openaiModel,
          temperature: parseFloat(legacySettings.openaiTemperature),
          maxTokens: parseInt(legacySettings.openaiMaxTokens),
        },
        openwebui: {
          jwtToken: legacySettings.openwebuiJWTToken,
          baseURL: legacySettings.openwebuiBaseURL,
          model: legacySettings.openwebuiModel,
          temperature: parseFloat(legacySettings.openwebuiTemperature),
          maxTokens: parseInt(legacySettings.openwebuiMaxTokens),
          knowledgeBase: {
            enabled: false,
            selectedCollections: [],
            searchType: 'similarity',
            topK: 5,
          },
        },
      }

      return newSettings
    } catch (error) {
      console.log('No legacy settings found or migration failed:', error)
      return defaultSettings
    }
  }
}
