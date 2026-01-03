import { i18n } from '@/i18n'

import { forceNumber, optionLists } from './common'
import { availableModels, availableModelsForGemini, availableModelsForGroq, availableModelsForOllama } from './constant'
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
  if (oldModel?.trim()) {
    const models = [oldModel]
    localStorage.setItem(key, JSON.stringify(models))
    return models
  }
  return []
}

const saveCustomModels = (key: string, models: string[]) => localStorage.setItem(key, JSON.stringify(models))

interface ISettingOption<T> {
  defaultValue: T
  saveKey?: string
  type?: componentType
  stepStyle?: 'temperature' | 'maxTokens'
  optionObj?: { label: string; value: string }[]
  optionList?: string[]
  saveFunc?: (value: T) => void
  getFunc?: () => T
}

export const Setting_Names = [
  'api',
  'localLanguage',
  'replyLanguage',
  'officialAPIKey',
  'officialBasePath',
  'officialCustomModel',
  'officialCustomModels',
  'officialTemperature',
  'officialMaxTokens',
  'officialModelSelect',
  'azureAPIKey',
  'azureAPIEndpoint',
  'azureDeploymentName',
  'azureTemperature',
  'azureMaxTokens',
  'azureAPIVersion',
  'geminiAPIKey',
  'geminiCustomModel',
  'geminiCustomModels',
  'geminiModelSelect',
  'geminiTemperature',
  'geminiMaxTokens',
  'ollamaEndpoint',
  'ollamaCustomModel',
  'ollamaCustomModels',
  'ollamaModelSelect',
  'ollamaTemperature',
  'groqAPIKey',
  'groqTemperature',
  'groqMaxTokens',
  'groqModelSelect',
  'groqCustomModel',
  'groqCustomModels',
  'systemPrompt',
  'userPrompt',
  'agentMaxIterations',
] as const

export type SettingNames = (typeof Setting_Names)[number]

type keyOfLocalStorageKey = keyof typeof localStorageKey

// Helper functions
const createStorageFuncs = (key: string, defaultValue: number) => ({
  getFunc: () => forceNumber(localStorage.getItem(key)) || defaultValue,
  saveFunc: (value: number) => localStorage.setItem(key, value.toString()),
})

const inputSetting = (defaultValue: string, saveKey?: keyOfLocalStorageKey): ISettingOption<string> => ({
  defaultValue,
  saveKey,
  type: 'input',
})

const inputNumSetting = (
  defaultValue: number,
  saveKey: keyOfLocalStorageKey,
  stepStyle: 'temperature' | 'maxTokens',
): ISettingOption<number> => ({
  defaultValue,
  saveKey,
  type: 'inputNum',
  stepStyle,
  ...createStorageFuncs(localStorageKey[saveKey], defaultValue),
})

const selectSetting = (
  defaultValue: string,
  saveKey: keyOfLocalStorageKey,
  optionList: string[],
): ISettingOption<string> => ({
  defaultValue,
  saveKey,
  type: 'select',
  optionList,
  getFunc: () => localStorage.getItem(localStorageKey[saveKey]) || defaultValue,
})

const customModelsetting = (saveKey: keyOfLocalStorageKey, oldKey: keyOfLocalStorageKey): ISettingOption<string[]> => ({
  defaultValue: [],
  saveKey,
  getFunc: () => getCustomModels(localStorageKey[saveKey], localStorageKey[oldKey]),
  saveFunc: (value: string[]) => saveCustomModels(localStorageKey[saveKey], value),
})

export const settingPreset = {
  api: {
    ...inputSetting('official'),
    type: 'select',
    optionObj: optionLists.apiList,
  },
  localLanguage: {
    ...inputSetting('en'),
    type: 'select',
    optionObj: optionLists.localLanguageList,
    saveFunc: (value: string) => {
      i18n.global.locale.value = value as 'en' | 'zh-cn'
      localStorage.setItem(localStorageKey.localLanguage, value)
    },
  },
  replyLanguage: {
    ...inputSetting('English'),
    type: 'select',
    optionObj: optionLists.replyLanguageList,
  },
  officialAPIKey: inputSetting('', 'apiKey'),
  officialBasePath: inputSetting('', 'basePath'),
  officialCustomModel: inputSetting('', 'customModel'),
  officialCustomModels: customModelsetting('customModels', 'customModel'),
  officialTemperature: inputNumSetting(0.7, 'temperature', 'temperature'),
  officialMaxTokens: inputNumSetting(800, 'maxTokens', 'maxTokens'),
  officialModelSelect: selectSetting('gpt-5', 'model', availableModels),
  azureAPIKey: inputSetting(''),
  azureAPIEndpoint: inputSetting(''),
  azureDeploymentName: inputSetting(''),
  azureTemperature: inputNumSetting(0.7, 'azureTemperature', 'temperature'),
  azureMaxTokens: inputNumSetting(800, 'azureMaxTokens', 'maxTokens'),
  azureAPIVersion: inputSetting(''),
  geminiAPIKey: inputSetting(''),
  geminiCustomModel: inputSetting(''),
  geminiCustomModels: customModelsetting('geminiCustomModels', 'geminiCustomModel'),
  geminiModelSelect: selectSetting('gemini-3-pro-preview', 'geminiModel', availableModelsForGemini),
  geminiTemperature: inputNumSetting(0.7, 'geminiTemperature', 'temperature'),
  geminiMaxTokens: inputNumSetting(800, 'geminiMaxTokens', 'maxTokens'),
  ollamaEndpoint: inputSetting(''),
  ollamaCustomModel: inputSetting(''),
  ollamaCustomModels: customModelsetting('ollamaCustomModels', 'ollamaCustomModel'),
  ollamaModelSelect: selectSetting('qwen3:latest', 'ollamaModel', availableModelsForOllama),
  ollamaTemperature: inputNumSetting(0.7, 'ollamaTemperature', 'temperature'),
  groqAPIKey: inputSetting(''),
  groqTemperature: inputNumSetting(0.5, 'groqTemperature', 'temperature'),
  groqMaxTokens: inputNumSetting(1024, 'groqMaxTokens', 'maxTokens'),
  groqModelSelect: selectSetting('qwen/qwen3-32b', 'groqModel', availableModelsForGroq),
  groqCustomModel: inputSetting(''),
  groqCustomModels: customModelsetting('groqCustomModels', 'groqCustomModel'),
  systemPrompt: inputSetting('', 'defaultSystemPrompt'),
  userPrompt: inputSetting('', 'defaultPrompt'),
  agentMaxIterations: inputNumSetting(10, 'agentMaxIterations', 'maxTokens'),
} as const satisfies Record<SettingNames, ISettingOption<any>>
