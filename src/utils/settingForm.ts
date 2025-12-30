import { Ref, ref } from 'vue'

import { localStorageKey } from './enum'
import { Setting_Names, SettingNames, settingPreset } from './settingPreset'

type SettingForm = {
  [K in SettingNames]: (typeof settingPreset)[K]['defaultValue']
}

type SettingValue = string | number | string[]

function initializeSettings(): Record<string, SettingValue> {
  const settings: Record<string, SettingValue> = {}

  for (const key of Setting_Names) {
    const preset = settingPreset[key]

    if (preset.getFunc) {
      settings[key] = preset.getFunc()
    } else {
      const storageKey = preset.saveKey || key
      const storedValue = localStorage.getItem(storageKey)
      settings[key] = storedValue ?? preset.defaultValue
    }
  }

  // Special case for legacy support
  if (settings.api === 'palm') {
    settings.api = 'gemini'
    localStorage.setItem(localStorageKey.api, 'gemini')
  }

  return settings
}

function useSettingForm() {
  return ref(initializeSettings()) as Ref<SettingForm>
}

export default useSettingForm
