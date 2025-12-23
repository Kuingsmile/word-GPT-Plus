import { i18n } from '@/i18n'
import { forceNumber, optionLists } from './common'
import {
  availableModels,
  availableModelsForGemini,
  availableModelsForGroq,
  availableModelsForOllama
} from './constant'
import { localStorageKey } from './enum'

type componentType = 'input' | 'select' | 'inputNum'

const getCustomModels = (key: string, oldKey: string): string[] => {
  const stored = localStorage.getItem(key)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }
  const oldModel = localStorage.getItem(oldKey)
  if (oldModel && oldModel.trim()) {
    const models = [oldModel]
    localStorage.setItem(key, JSON.stringify(models))
    return models
  }
  return []
}

const saveCustomModels = (key: string, models: string[]) => {
  localStorage.setItem(key, JSON.stringify(models))
}

interface ISettingOption {
  defaultValue: string | number | string[]
  saveKey?: string
  type?: componentType
  stepStyle?: 'temperature' | 'maxTokens'
  optionObj?: { label: string; value: string }[]
  optionList?: string[]
  saveFunc?: (value: any) => void
  getFunc?: () => any
}

export type SettingNames =
  | 'api'
  | 'localLanguage'
  | 'replyLanguage'
  | 'officialAPIKey'
  | 'officialBasePath'
  | 'officialCustomModel'
  | 'officialCustomModels'
  | 'officialTemperature'
  | 'officialMaxTokens'
  | 'officialModelSelect'
  | 'azureAPIKey'
  | 'azureAPIEndpoint'
  | 'azureDeploymentName'
  | 'azureTemperature'
  | 'azureMaxTokens'
  | 'azureAPIVersion'
  | 'geminiAPIKey'
  | 'geminiCustomModel'
  | 'geminiCustomModels'
  | 'geminiModelSelect'
  | 'geminiTemperature'
  | 'geminiMaxTokens'
  | 'ollamaEndpoint'
  | 'ollamaCustomModel'
  | 'ollamaCustomModels'
  | 'ollamaModelSelect'
  | 'ollamaTemperature'
  | 'groqAPIKey'
  | 'groqTemperature'
  | 'groqMaxTokens'
  | 'groqModelSelect'
  | 'groqCustomModel'
  | 'groqCustomModels'
  | 'systemPrompt'
  | 'userPrompt'

// Helper functions
const createStorageFuncs = (key: string, defaultValue: any) => ({
  getFunc: () => forceNumber(localStorage.getItem(key)) || defaultValue,
  saveFunc: (value: any) => localStorage.setItem(key, value.toString())
})

const inputSetting = (
  defaultValue: string,
  saveKey?: keyof typeof localStorageKey
): ISettingOption => ({
  defaultValue,
  saveKey,
  type: 'input'
})

const inputNumSetting = (
  defaultValue: number,
  saveKey: keyof typeof localStorageKey,
  stepStyle: 'temperature' | 'maxTokens'
) => ({
  defaultValue,
  saveKey,
  type: 'inputNum' as componentType,
  stepStyle,
  ...createStorageFuncs(localStorageKey[saveKey], defaultValue)
})

const selectSetting = (
  defaultValue: string,
  saveKey: keyof typeof localStorageKey,
  optionList: string[]
) => ({
  defaultValue,
  saveKey,
  type: 'select' as componentType,
  optionList,
  getFunc: () => {
    return localStorage.getItem(localStorageKey[saveKey]) || defaultValue
  }
})

const defaultInputSetting = inputSetting('')

export const settingPreset: Record<SettingNames, ISettingOption> = {
  api: {
    ...inputSetting('official'),
    type: 'select',
    optionObj: optionLists.apiList
  },
  localLanguage: {
    ...inputSetting('en'),
    type: 'select',
    optionObj: optionLists.localLanguageList,
    saveFunc: (value: string) => {
      i18n.global.locale.value = value as 'en' | 'zh-cn'
      localStorage.setItem(localStorageKey.localLanguage, value)
    }
  },
  replyLanguage: {
    ...inputSetting('English'),
    type: 'select',
    optionObj: optionLists.replyLanguageList
  },
  officialAPIKey: inputSetting('', 'apiKey'),
  officialBasePath: inputSetting('', 'basePath'),
  officialCustomModel: inputSetting('', 'customModel'),
  officialCustomModels: {
    defaultValue: [],
    saveKey: 'customModels',
    getFunc: () =>
      getCustomModels(
        localStorageKey.customModels,
        localStorageKey.customModel
      ),
    saveFunc: (value: string[]) =>
      saveCustomModels(localStorageKey.customModels, value)
  },
  officialTemperature: inputNumSetting(0.7, 'temperature', 'temperature'),
  officialMaxTokens: inputNumSetting(800, 'maxTokens', 'maxTokens'),
  officialModelSelect: selectSetting('gpt-5', 'model', availableModels),
  azureAPIKey: defaultInputSetting,
  azureAPIEndpoint: defaultInputSetting,
  azureDeploymentName: defaultInputSetting,
  azureTemperature: inputNumSetting(0.7, 'azureTemperature', 'temperature'),
  azureMaxTokens: inputNumSetting(800, 'azureMaxTokens', 'maxTokens'),
  azureAPIVersion: defaultInputSetting,
  geminiAPIKey: defaultInputSetting,
  geminiCustomModel: defaultInputSetting,
  geminiCustomModels: {
    defaultValue: [],
    saveKey: 'geminiCustomModels',
    getFunc: () =>
      getCustomModels(
        localStorageKey.geminiCustomModels,
        localStorageKey.geminiCustomModel
      ),
    saveFunc: (value: string[]) =>
      saveCustomModels(localStorageKey.geminiCustomModels, value)
  },
  geminiModelSelect: selectSetting(
    'gemini-3-pro-preview',
    'geminiModel',
    availableModelsForGemini
  ),
  geminiTemperature: inputNumSetting(0.7, 'geminiTemperature', 'temperature'),
  geminiMaxTokens: inputNumSetting(800, 'geminiMaxTokens', 'maxTokens'),
  ollamaEndpoint: defaultInputSetting,
  ollamaCustomModel: defaultInputSetting,
  ollamaCustomModels: {
    defaultValue: [],
    saveKey: 'ollamaCustomModels',
    getFunc: () =>
      getCustomModels(
        localStorageKey.ollamaCustomModels,
        localStorageKey.ollamaCustomModel
      ),
    saveFunc: (value: string[]) =>
      saveCustomModels(localStorageKey.ollamaCustomModels, value)
  },
  ollamaModelSelect: selectSetting(
    'qwen3:latest',
    'ollamaModel',
    availableModelsForOllama
  ),
  ollamaTemperature: inputNumSetting(0.7, 'ollamaTemperature', 'temperature'),
  groqAPIKey: defaultInputSetting,
  groqTemperature: inputNumSetting(0.5, 'groqTemperature', 'temperature'),
  groqMaxTokens: inputNumSetting(1024, 'groqMaxTokens', 'maxTokens'),
  groqModelSelect: selectSetting(
    'qwen/qwen3-32b',
    'groqModel',
    availableModelsForGroq
  ),
  groqCustomModel: defaultInputSetting,
  groqCustomModels: {
    defaultValue: [],
    saveKey: 'groqCustomModels',
    getFunc: () =>
      getCustomModels(
        localStorageKey.groqCustomModels,
        localStorageKey.groqCustomModel
      ),
    saveFunc: (value: string[]) =>
      saveCustomModels(localStorageKey.groqCustomModels, value)
  },
  systemPrompt: {
    ...inputSetting('', 'defaultSystemPrompt'),
    type: 'input'
  },
  userPrompt: {
    ...inputSetting('', 'defaultPrompt'),
    type: 'input'
  }
}
