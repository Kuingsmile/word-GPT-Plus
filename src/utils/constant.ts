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
  'gpt-3.5': 'gpt-3.5-turbo',
  'gpt-3.5-0613': 'gpt-3.5-turbo-0613',
  'gpt-3.5-16k': 'gpt-3.5-turbo-16k',
  'gpt-3.5-16k-0613': 'gpt-3.5-turbo-16k-0613',
  'text-davinci-003': 'text-davinci-003',
  gtp4: 'gpt-4',
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
    user: (text: string, language: string) => `I want you to act as an professional spelling and grammer corrector and improver.
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
  }
}
