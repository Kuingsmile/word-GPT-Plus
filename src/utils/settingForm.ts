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
  const settingFormKeys = Object.keys(settingForm.value) as SettingNames[]
  settingFormKeys.forEach(key => {
    if (settingPreset[key].getFunc) {
      settingForm.value[key] = settingPreset[key].getFunc!()
      return
    }
    settingForm.value[key as keyof typeof settingForm.value] =
      localStorage.getItem(settingPreset[key].saveKey || key) ||
      settingForm.value[key as keyof typeof settingForm.value]
  })
  return { settingForm, settingFormKeys }
}

export default useSettingForm
