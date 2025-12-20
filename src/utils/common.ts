import {
  availableAPIs,
  availableModels,
  availableModelsForGemini,
  availableModelsForGroq,
  availableModelsForOllama,
  availableModelsForAgent,
  languageMap
} from './constant'

export interface Auth {
  type: supportedPlatforms
  [propName: string]: any
}

export function checkAuth(auth: Auth): boolean {
  if (!auth) return false

  switch (auth.type) {
    case 'official':
      return !!auth.apiKey
    case 'azure':
      return !!auth.azureAPIKey
    case 'gemini':
      return !!auth.geminiAPIKey
    case 'groq':
      return !!auth.groqAPIKey
    case 'ollama':
      return true
    case 'agent': {
      if (!auth.agentBaseModeAPI) return false
      const baseAuth: Auth = {
        type: auth.agentBaseModeAPI as supportedPlatforms,
        apiKey: auth.apiKey,
        azureAPIKey: auth.azureAPIKey,
        geminiAPIKey: auth.geminiAPIKey,
        groqAPIKey: auth.groqAPIKey
      }
      return checkAuth(baseAuth)
    }
    default:
      return false
  }
}

export function forceNumber(val: any): number {
  return Number(val) || 0
}

export function getOptionList(
  map: Record<string, string>,
  from: 'key' | 'value' = 'key',
  isUseValueAsLabel = false
) {
  return from === 'key'
    ? Object.keys(map).map(key => ({
        label: isUseValueAsLabel ? map[key] : key,
        value: map[key]
      }))
    : Object.values(map).map(key => ({
        label: key,
        value: key
      }))
}

const localLanguageList = [
  { label: 'English', value: 'en' },
  { label: '简体中文', value: 'zh-cn' }
]

export const optionLists = {
  localLanguageList,
  apiList: getOptionList(availableAPIs),
  replyLanguageList: getOptionList(languageMap, 'value'),
  officialModelList: getOptionList(availableModels),
  geminiModelList: getOptionList(availableModelsForGemini),
  ollamaModelList: getOptionList(availableModelsForOllama),
  groqModelList: getOptionList(availableModelsForGroq),
  agentModelList: getOptionList(availableModelsForAgent)
}

export const getLabel = (key: string) => `${key}Label`
export const getPlaceholder = (key: string) => `${key}Placeholder`
