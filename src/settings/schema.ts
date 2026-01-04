import { z } from 'zod'

// Define all settings in one place
export const SettingsSchema = z.object({
  // UI Settings
  localLanguage: z.enum(['en', 'zh-CN']).default('zh-CN'),
  replyLanguage: z.enum(['en', 'zh-CN', 'auto']).default('auto'),

  // Provider Settings
  provider: z.enum(['official', 'ollama', 'groq', 'gemini', 'azure', 'mistral', 'openwebui']),

  // OpenAI Settings
  openai: z.object({
    apiKey: z.string(),
    baseURL: z.string().default('https://api.openai.com/v1'),
    model: z.string().default('gpt-4'),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().min(1).max(32000).default(800),
  }),

  // OpenWebUI Settings
  openwebui: z.object({
    jwtToken: z.string(),
    baseURL: z.string(),
    model: z.string(),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().min(1).max(32000).default(1024),
    // NEW: RAG/Knowledge Base settings
    knowledgeBase: z.object({
      enabled: z.boolean().default(false),
      selectedCollections: z.array(z.string()).default([]),
      searchType: z.enum(['similarity', 'mmr', 'similarity_score_threshold']).default('similarity'),
      topK: z.number().min(1).max(20).default(5),
    }),
  }),

  // Tool Settings
  tools: z.object({
    wordTools: z.array(z.string()),
    generalTools: z.array(z.string()),
  }),
})

export type Settings = z.infer<typeof SettingsSchema>

export const defaultSettings: Settings = {
  localLanguage: 'zh-CN',
  replyLanguage: 'auto',
  provider: 'official',
  openai: {
    apiKey: '',
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 800,
  },
  openwebui: {
    jwtToken: '',
    baseURL: '',
    model: '',
    temperature: 0.7,
    maxTokens: 1024,
    knowledgeBase: {
      enabled: false,
      selectedCollections: [],
      searchType: 'similarity',
      topK: 5,
    },
  },
  tools: {
    wordTools: [],
    generalTools: [],
  },
}
