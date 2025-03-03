import { ref } from 'vue'
import { SettingNames, settingPreset } from './settingPreset'

function useSettingForm() {
  const settingForm = ref<{ [key in SettingNames]: any }>(
    Object.keys(settingPreset).reduce(
      (acc, key) => {
        const presetKey = key as SettingNames
        acc[presetKey] = settingPreset[presetKey].defaultValue
        return acc
      },
      {} as { [key in SettingNames]: any }
    )
  )

  // Load values from storage
  Object.keys(settingForm.value).forEach(key => {
    const typedKey = key as SettingNames
    if (settingPreset[typedKey].getFunc) {
      settingForm.value[typedKey] = settingPreset[typedKey].getFunc!()
      return
    }

    const storageKey = settingPreset[typedKey].saveKey || key
    settingForm.value[typedKey] =
      localStorage.getItem(storageKey) || settingForm.value[typedKey]
  })

  // Special case for legacy support
  if (settingForm.value.api === 'palm') {
    settingForm.value.api = 'gemini'
    localStorage.setItem('api', 'gemini')
  }

  return {
    settingForm,
    settingFormKeys: Object.keys(settingForm.value) as SettingNames[]
  }
}

export default useSettingForm
