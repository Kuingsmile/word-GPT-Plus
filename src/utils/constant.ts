import { IStringKeyMap } from '../types'

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

// Openai API 可用的模型
export const availableModels: IStringKeyMap = {
  'gpt-4o': 'gpt-4o',
  'gpt-3.5': 'gpt-3.5-turbo',
  'gpt-3.5-turbo-1106': 'gpt-3.5-turbo-1106',
  'gpt-3.5-16k': 'gpt-3.5-turbo-16k',
  'gpt-3.5-16k-0613': 'gpt-3.5-turbo-16k-0613',
  'text-davinci-003': 'text-davinci-003',
  gtp4: 'gpt-4',
  'gpt-4-turbo': 'gpt-4-turbo',
  'gpt-4-turo-preview': 'gpt-4-turo-preview',
  'gpt4-0613': 'gpt-4-0613',
  'gpt4-32k': 'gpt-4-32k',
  'gpt4-32k-0613': 'gpt-4-32k-0613'
}

// Web API 可用的模型
export const availableModelsForPlus: IStringKeyMap = {
  default: 'text-davinci-002-render-sha',
  'legacy(plus)': 'model=text-davinci-002-render-paid',
  'gpt4(plus)': 'gpt4'
}

// palm api 可用的模型
export const availableModelsForPalm: IStringKeyMap = {
  'text-bison-001': 'text-bison-001'
}

// Gemini API 可用的模型
export const availableModelsForGemini: IStringKeyMap = {
  'gemini-pro': 'gemini-pro',
  'gemini-1.5-flash': 'gemini-1.5-flash',
  'gemini-1.5-pro': 'gemini-1.5-pro-latest'
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

export enum localStorageKey {
  // common
  api = 'api',
  localLanguage = 'localLanguage',
  replyLanguage = 'replyLanguage',
  insertType = 'insertType',
  // web api
  webModel = 'webModel',
  accessToken = 'accessToken',
  // official api
  apiKey = 'apiKey',
  model = 'model',
  temperature = 'temperature',
  maxTokens = 'maxTokens',
  basePath = 'basePath',
  // azure api
  azureAPIKey = 'azureAPIKey',
  azureAPIEndpoint = 'azureAPIEndpoint',
  azureDeploymentName = 'azureDeploymentName',
  azureMaxTokens = 'azureMaxTokens',
  azureTemperature = 'azureTemperature',
  // palm api
  palmAPIKey = 'palmAPIKey',
  palmAPIEndpoint = 'palmAPIEndpoint',
  palmMaxTokens = 'palmMaxTokens',
  palmTemperature = 'palmTemperature',
  palmModel = 'palmModel',
  // gemini api
  geminiAPIKey = 'geminiAPIKey',
  geminiMaxTokens = 'geminiMaxTokens',
  geminiTemperature = 'geminiTemperature',
  geminiModel = 'geminiModel',
  // ollama api
  ollamaEndpoint = 'ollamaEndpoint',
  ollamaModel = 'ollamaModel',
  ollamaTemperature = 'ollamaTemperature',
  // proxy
  enableProxy = 'enableProxy',
  proxy = 'proxy',
  defaultSystemPrompt = 'defaultSystemPrompt',
  defaultPrompt = 'defaultPrompt',
}

export const buildInPrompt = {
  translate: {
    system: (language: string) => `Act as an ${language} translator, spelling corrector and improver.`,
    user: (text: string, language: string) => `I will speak to you in any language and you will detect the language,
    translate it and answer in the corrected and improved version of my text, in ${language}.
    I want you to replace my simplified A0-level words and sentences with more beautiful and elegant, 
    upper level ${language} words and sentences.
    Keep the meaning same, but make them more literary.
    I want you to only reply the correction, the improvements and nothing else, do not write explanations.
    Reply in ${language}.
    My first sentence is: ${text}`
  },
  polish: {
    system: (language: string) => `As a writing improvement assistant, Reply in ${language}`,
    user: (text: string, language: string) => `Improve the spelling, grammar, clarity, concision,
    and overall readability of the text provided, while breaking down long sentences, reducing repetition,
    and providing suggestions for improvement.
    Please provide only the corrected ${language} version of the text and avoid including explanations.
    Please begin by editing the following text: ${text}`
  },
  academic: {
    system: (language: string) => `As an academic paper writing assistant, Reply in ${language}`,
    user: (text: string, language: string) => `I want you to act as a professional spelling and grammar corrector and improver.
    I want you to replace my simplified A0-level words and sentences with more beautiful and elegant,
    upper level ${language} words and sentences.
    Keep the meaning same, but make them more literary and improve my expression in the style of SCI papers.
    High IF SCI papers are preferred.
    Please begin by editing the following text: ${text}`
  },
  summary: {
    system: (language: string) => `As a summarization assistant, Reply in ${language}`,
    user: (text: string, language: string) => `Summarize the following text into 100 words,
    making it easy to read and comprehend. The summary should be concise, clear,
    and capture the main points of the text. Avoid using complex sentence structures or technical jargon.
    Respond in ${language}. Please begin by editing the following text: ${text}`
  },
  grammar: {
    system: (language: string) => `Act like you are an expert grammar checker. Look for mistakes and make sentences more fluent, Reply in ${language}`,
    user: (text: string, language: string) => `Please analyze the following text for a wide range of grammatical aspects and provide corrections. Be thorough in identifying and fixing any grammatical mistakes, including checking for correct punctuation usage, ensuring proper sentence structure, enhancing readability, identifying and correcting spelling mistakes, and verifying subject-verb agreement. Your assistance in ensuring the grammatical accuracy of the text is highly appreciated. Please be thorough in your examination, and provide comprehensive corrections to enhance the overall grammatical integrity of the text.

    Just reply to user input with the correct grammar, DO NOT reply to the context of the question of the user input. If the user input is grammatically correct and fluent, just reply “sounds good”.
    Respond in ${language}. Please begin by editing the following text: ${text}`
  }
}
