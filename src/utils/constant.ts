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
  groq: 'groq',
  agent: 'agent'
}

// official API 可用的模型
export const availableModels: IStringKeyMap = {
  'gpt-4o': 'gpt-4o',
  'gpt-4o-mini': 'gpt-4o-mini',
  'o1-preview': 'o1-preview',
  'o1-mini': 'o1-mini',
  'gpt-3.5': 'gpt-3.5-turbo',
  'gpt-3.5-turbo-1106': 'gpt-3.5-turbo-1106',
  gpt4: 'gpt-4',
  'gpt-4-turbo': 'gpt-4-turbo',
  'gpt-4-turbo-preview': 'gpt-4-turbo-preview',
  'gpt4-0613': 'gpt-4-0613'
}

// Gemini API 可用的模型
export const availableModelsForGemini: IStringKeyMap = {
  'gemini-2.0-flash': 'gemini-2.0-flash',
  'gemini-2.0-flash-lite': 'gemini-2.0-flash-lite',
  'gemini-1.5-flash': 'gemini-1.5-flash',
  'gemini-1.5-flash-8b': 'gemini-1.5-flash-8b',
  'gemini-1.0-pro': 'gemini-1.0-pro',
  'gemini-1.5-pro': 'gemini-1.5-pro',
  'gemini-exp-1114': 'gemini-exp-1114',
  aqa: 'aqa'
}

// Ollama API 可用的模型
export const availableModelsForOllama: IStringKeyMap = {
  llama3: 'llama3',
  llama2: 'llama2',
  phi3: 'phi3',
  wizardlm2: 'wizardlm2',
  mistral: 'mistral',
  'llama2-uncensored': 'llama2-uncensored',
  'llama2:13b': 'llama2:13b',
  'llama2:70b': 'llama2:70b',
  'gemma:2b': 'gemma:2b',
  'gemma:7b': 'gemma:7b',
  qwen: 'qwen',
  codegemma: 'codegemma',
  'command-r': 'command-r',
  'command-r-plus': 'command-r-plus',
  llava: 'llava',
  codellama: 'codellama',
  yi: 'yi',
  codeqwen: 'codeqwen',
  'dolphin-phi': 'dolphin-phi',
  phi: 'phi',
  'neural-chat': 'neural-chat',
  'starlinh-lm': 'starlinh-lm',
  'orca-mini': 'orca-mini',
  vicuna: 'vicuna'
}

export const availableModelsForGroq: IStringKeyMap = {
  'gemma2-9b-it': 'gemma2-9b-it',
  'gemma-7b-it': 'gemma-7b-it',
  'llama3-70b-8192': 'llama3-70b-8192',
  'llama3-8b-8192': 'llama3-8b-8192',
  'mixtral-8x7b-32768': 'mixtral-8x7b-32768',
  'whisper-large-v3': 'whisper-large-v3',
  'deepseek-r1-distill-llama-70b': 'deepseek-r1-distill-llama-70b'
}

// Agent API 可用的模型
export const availableModelsForAgent: IStringKeyMap = {
  'auto-workflow': 'auto-workflow',
  'multi-step': 'multi-step',
  'research-assistant': 'research-assistant',
  'writing-coach': 'writing-coach',
  'document-analyzer': 'document-analyzer'
}

export const buildInPrompt = {
  translate: {
    system: (language: string) =>
      `You are a professional ${language} translator focused on accuracy and natural-sounding translations.`,
    user: (
      text: string,
      language: string
    ) => `Translate the following text into ${language}. Maintain the original meaning while using natural, 
    elegant expressions appropriate for native ${language} speakers. Improve the language quality 
    from basic to sophisticated where appropriate. Provide only the translation without explanations.

    Text to translate: ${text}`
  },
  polish: {
    system: (language: string) =>
      `You are a professional writing improvement assistant. Respond in ${language}.`,
    user: (
      text: string,
      language: string
    ) => `Improve this text in ${language} for clarity, concision, and readability:
    - Fix spelling and grammar
    - Break down overly long sentences
    - Reduce repetition
    - Enhance overall flow
    
    Provide only the improved version without explanations and any additional information: ${text}`
  },
  academic: {
    system: (language: string) =>
      `You are an expert academic editor specializing in scholarly publications. Respond in ${language}.`,
    user: (
      text: string,
      language: string
    ) => `Transform the following text into academic-quality writing suitable for a high-impact scientific journal:
    - Elevate vocabulary and phrasing while preserving meaning
    - Apply formal academic tone consistent with scholarly publications
    - Structure sentences and paragraphs for logical flow
    - Use precise terminology appropriate for scientific literature

    Provide only the revised text without explanations and Reply in ${language}: ${text}`
  },
  summary: {
    system: (language: string) =>
      `You are a professional text summarization expert. Respond in ${language}.`,
    user: (
      text: string,
      language: string
    ) => `Create a concise 100-word summary of this text that:
    - Captures the main points and key information
    - Is easy to read and understand
    - Maintains the core message
    - Uses clear, straightforward language
    Respond in ${language}.
    Text to summarize: ${text}`
  },
  grammar: {
    system: (language: string) =>
      `You are an expert grammar checker with exceptional attention to detail. Respond in ${language}.`,
    user: (
      text: string,
      language: string
    ) => `Review and correct any grammatical issues in this text:
    - Fix punctuation, spelling, and syntax errors
    - Ensure proper sentence structure and flow
    - Correct subject-verb agreement issues
    - Improve overall readability
    Respond in ${language}.
    If the text is already grammatically correct, respond only with "Sounds good." 
    Otherwise, provide the corrected version: ${text}`
  }
}
