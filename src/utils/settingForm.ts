import { ref, Ref } from 'vue'
import { Setting_Names, SettingNames, settingPreset } from './settingPreset'
import { localStorageKey } from './enum'

type SettingForm = {
  [K in SettingNames]: (typeof settingPreset)[K]['defaultValue']
}

type SettingValue = string | number | string[]

function initializeSettings(): Record<string, SettingValue> {
  const settings: Record<string, SettingValue> = {}

  console.log('DEBUG initializeSettings: Starting initialization')

  for (const key of Setting_Names) {
    const preset = settingPreset[key]

    if (preset.getFunc) {
      settings[key] = preset.getFunc()
    } else {
      const storageKey = preset.saveKey || key
      const storedValue = localStorage.getItem(storageKey)
      settings[key] = storedValue ?? preset.defaultValue

      // Debug Mistral settings
      if (key.startsWith('mistral')) {
        console.log(`DEBUG initializeSettings: ${key}`, {
          storageKey,
          storedValue,
          defaultValue: preset.defaultValue,
          finalValue: settings[key]
        })
      }
    }
  }

  // Special case for legacy support
  if (settings.api === 'palm') {
    settings.api = 'gemini'
    localStorage.setItem(localStorageKey.api, 'gemini')
  }

  console.log('DEBUG initializeSettings: Mistral settings loaded:', {
    mistralAPIKey: settings.mistralAPIKey,
    mistralModelSelect: settings.mistralModelSelect,
    mistralTemperature: settings.mistralTemperature,
    mistralMaxTokens: settings.mistralMaxTokens
  })

  return settings
}

function useSettingForm() {
  return ref(initializeSettings()) as Ref<SettingForm>
}

export default useSettingForm
