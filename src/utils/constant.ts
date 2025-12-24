export const languageMap: IStringKeyMap = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  hi: 'हिन्दी',
  ar: 'العربية',
  'zh-cn': '简体中文',
  'zh-tw': '繁體中文',
  ja: '日本語',
  ko: '한국어',
  ru: 'Русский',
  nl: 'Nederlands',
  sv: 'Svenska',
  fi: 'Suomi',
  no: 'Norsk',
  da: 'Dansk',
  pl: 'Polski',
  tr: 'Türkçe',
  el: 'Ελληνικά',
  he: 'עברית',
  hu: 'Magyar',
  id: 'Bahasa Indonesia',
  ms: 'Bahasa Melayu',
  th: 'ไทย',
  vi: 'Tiếng Việt',
  uk: 'Українська',
  bg: 'Български',
  cs: 'Čeština',
  ro: 'Română',
  sk: 'Slovenčina',
  sl: 'Slovenščina',
  hr: 'Hrvatski',
  sr: 'Српски',
  bn: 'বাংলা',
  gu: 'ગુજરાતી',
  kn: 'ಕನ್ನಡ',
  mr: 'मराठी',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  ur: 'اردو'
}

export const availableAPIs: IStringKeyMap = {
  official: 'official',
  azure: 'azure',
  gemini: 'gemini',
  ollama: 'ollama',
  groq: 'groq'
}

// official API 可用的模型
export const availableModels: string[] = [
  'gpt-5',
  'gpt-5-mini',
  'gpt-5-nano',
  'gpt-4.1',
  'gpt-4.1-mini',
  'gpt-4.1-nano',
  'gpt-4o',
  'gpt-4o-mini',
  'o1',
  'o1-pro',
  'o1-mini',
  'o3',
  'o3-pro',
  'o3-mini'
]

// Gemini API 可用的模型
export const availableModelsForGemini: string[] = [
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'aqa'
]

// Ollama API 可用的模型
export const availableModelsForOllama: string[] = [
  'qwen3:latest',
  'llama4:latest',
  'deepseek-r1:latest',
  'gpt-oss:latest',
  'kimi-k2:1t-cloud',
  'gemini-3-flash-preview:latest',
  'ministral-3:latest'
]

export const availableModelsForGroq: string[] = [
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
  'meta-llama/llama-guard-4-12b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'whisper-large-v3',
  'whisper-large-v3-turbo',
  'meta-llama/llama-4-maverick-17b-128e-instruct',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'meta-llama/llama-prompt-guard-2-22m',
  'meta-llama/llama-prompt-guard-2-86m',
  'moonshotai/kimi-k2-instruct-0905',
  'qwen/qwen3-32b'
]
export const buildInPrompt = {
  translate: {
    system: (language: string) =>
      `You are an expert polyglot translator. Your task is to provide professional, context-aware translations into ${language}. 
      Maintain formatting, keep the original tone, and ensure the output is idiomatic and elegant.`,
    user: (text: string, language: string) =>
      `Task: Translate the following text into ${language}.
      Constraints:
      1. Provide a natural-sounding translation suitable for native speakers.
      2. If the text is technical, use appropriate terminology.
      3. OUTPUT ONLY the translated text. Do not include "Here is the translation" or any explanations.
      
      Text: ${text}`
  },

  polish: {
    system: (language: string) =>
      `You are a professional editor and stylist. Your goal is to make the text more professional, engaging, and clear in ${language}.`,
    user: (text: string, language: string) =>
      `Task: Polish the following text for better flow and impact.
      Improvements:
      - Correct grammar, spelling, and punctuation.
      - Enhance vocabulary while maintaining the original meaning.
      - Improve sentence structure and eliminate redundancy.
      - Ensure the tone is consistent and professional.
      Constraints: 
      1. Respond in ${language}.
      2. OUTPUT ONLY the polished text without any commentary.
      
      Text: ${text}`
  },

  academic: {
    system: (language: string) =>
      `You are a senior academic editor for high-impact journals (e.g., Nature, Science). You specialize in formal, precise, and objective scholarly writing in ${language}.`,
    user: (text: string, language: string) =>
      `Task: Rewrite the following text to meet professional academic standards.
      Requirements:
      - Use formal, objective language and avoid colloquialisms.
      - Ensure logical transitions and precise scientific terminology.
      - Maintain a third-person perspective unless the context requires otherwise.
      - Optimize for clarity and conciseness as per peer-review expectations.
      Constraints:
      1. Respond in ${language}.
      2. OUTPUT ONLY the revised text. No pre-amble or meta-talk.
      
      Text: ${text}`
  },

  summary: {
    system: (language: string) =>
      `You are an expert document analyst. You excel at distilling complex information into clear, actionable summaries in ${language}.`,
    user: (text: string, language: string) =>
      `Task: Summarize the following text.
      Structure:
      - Capture the core message and primary supporting points.
      - Aim for approximately 100 words (or 3-5 key bullet points).
      - Ensure the summary is self-contained and easy to understand.
      Constraints:
      1. Respond in ${language}.
      2. OUTPUT ONLY the summary.
      
      Text: ${text}`
  },

  grammar: {
    system: (language: string) =>
      `You are a meticulous proofreader. Your sole focus is linguistic accuracy, including syntax, morphology, and orthography in ${language}.`,
    user: (text: string, language: string) =>
      `Task: Check and correct the grammar of the following text.
      Focus:
      - Fix all spelling and punctuation errors.
      - Correct subject-verb agreement and tense inconsistencies.
      - Ensure proper sentence structure.
      Constraints:
      1. If the text is already perfect, respond exactly with: "No grammatical issues found."
      2. Otherwise, provide ONLY the corrected text without explaining the changes.
      3. Respond in ${language}.
      
      Text: ${text}`
  }
}
