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
  palm: 'palm',
  gemini: 'gemini',
  ollama: 'ollama',
  groq: 'groq'
}

// official API 可用的模型
export const availableModels: IStringKeyMap = {
  'gpt-4o': 'gpt-4o',
  'gpt-4o-mini': 'gpt-4o-mini',
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

export const availableModelsForGroq: IStringKeyMap = {
  'gemma2-9b-it': 'gemma2-9b-it',
  'gemma-7b-it': 'gemma-7b-it',
  'llama3-70b-8192': 'llama3-70b-8192',
  'llama3-8b-8192': 'llama3-8b-8192',
  'mixtral-8x7b-32768': 'mixtral-8x7b-32768',
  'whisper-large-v3': 'whisper-large-v3'
}

export const buildInPrompt = {
  translate: {
    system: (language: string) =>
      `Act as an ${language} translator, spelling corrector and improver.`,
    user: (
      text: string,
      language: string
    ) => `I will speak to you in any language and you will detect the language,
    translate it and answer in the corrected and improved version of my text, in ${language}.
    I want you to replace my simplified A0-level words and sentences with more beautiful and elegant,
    upper level ${language} words and sentences.
    Keep the meaning same, but make them more literary.
    I want you to only reply the correction, the improvements and nothing else, do not write explanations.
    Reply in ${language}.
    My first sentence is: ${text}`
  },
  polish: {
    system: (language: string) =>
      `As a writing improvement assistant, reply in ${language}`,
    user: (
      text: string,
      language: string
    ) => `You are tasked with improving a given text by enhancing its spelling, grammar, clarity, concision, and overall readability. Your goal is to produce a polished and refined version of the original text. Here is the text you need to improve:

      <original_text>
      ${text}
      </original_text>

      Follow these steps to improve the text:

      1. Correct any spelling and grammatical errors.
      2. Improve clarity by rephrasing unclear or ambiguous sentences.
      3. Enhance concision by removing unnecessary words or phrases.
      4. Break down long, complex sentences into shorter, more digestible ones.
      5. Reduce repetition by combining similar ideas or removing redundant information.
      6. Improve overall readability by ensuring a logical flow of ideas and smooth transitions between sentences and paragraphs.

      Provide only the corrected version of the text in ${language}. Do not include explanations, comparisons to the original text, or any additional commentary.`
  },
  academic: {
    system: (language: string) =>
      `As an academic paper writing assistant, Reply in ${language}`,
    user: (
      text: string,
      language: string
    ) => `I want you to act as a professional spelling and grammar corrector and improver.
    I want you to replace my simplified A0-level words and sentences with more beautiful and elegant,
    upper level ${language} words and sentences.
    Keep the meaning same, but make them more literary and improve my expression in the style of SCI papers.
    High IF SCI papers are preferred.
    Please provide only the revised ${language} version of the text and avoid including explanations.
    Please begin by editing the following text: ${text}`
  },
  summary: {
    system: (language: string) =>
      `As a summarization assistant, Reply in ${language}`,
    user: (
      text: string,
      language: string
    ) => `Summarize the following text into 100 words,
    making it easy to read and comprehend. The summary should be concise, clear,
    and capture the main points of the text. Avoid using complex sentence structures or technical jargon.
    Respond in ${language}. Please begin by editing the following text: ${text}`
  },
  grammar: {
    system: (language: string) =>
      `Act like you are an expert grammar checker. Look for mistakes and make sentences more fluent, Reply in ${language}`,
    user: (
      text: string,
      language: string
    ) => `Please analyze the following text for a wide range of grammatical aspects and provide corrections. Be thorough in identifying and fixing any grammatical mistakes, including checking for correct punctuation usage, ensuring proper sentence structure, enhancing readability, identifying and correcting spelling mistakes, and verifying subject-verb agreement. Your assistance in ensuring the grammatical accuracy of the text is highly appreciated. Please be thorough in your examination, and provide comprehensive corrections to enhance the overall grammatical integrity of the text.

    Just reply to user input with the correct grammar, DO NOT reply to the context of the question of the user input. If the user input is grammatically correct and fluent, just reply “sounds good”.
    Respond in ${language}. Please begin by editing the following text: ${text}`
  }
}
