import { ref, watch } from 'vue'

import { Settings } from './schema'
import { SettingsStorage } from './storage'

let settingsInstance: Ref<Settings> | null = null

export function useSettings() {
  if (!settingsInstance) {
    // Try to migrate from legacy settings first
    const migrated = SettingsStorage.migrateFromLegacy()

    // Load from storage (this will use migrated settings if they were saved)
    const stored = SettingsStorage.load()

    // Merge migrated settings with stored settings (stored takes precedence)
    const initialSettings = { ...migrated, ...stored }

    settingsInstance = ref(initialSettings)

    // Auto-save on changes
    watch(
      settingsInstance,
      newSettings => {
        SettingsStorage.save(newSettings)
      },
      { deep: true },
    )
  }

  return settingsInstance
}

// Helper function to get settings without reactivity
export function getCurrentSettings(): Settings {
  if (!settingsInstance) {
    return SettingsStorage.load()
  }
  return settingsInstance.value
}
