<template>
  <div class="settings-page">
    <!-- Header -->
    <div class="header">
      <div class="brand">
        <Settings class="brand-icon" />
        <h1 class="brand-title">{{ $t('settings') }}</h1>
      </div>
      <button 
        class="back-btn"
        @click="backToHome"
      >
        <ArrowLeft class="icon" />
        {{ $t('backToHome') }}
      </button>
    </div>

    <!-- Quick Settings Section -->
    <div class="section">
      <div class="section-header">
        <Sliders class="section-icon" />
        <h2 class="section-title">{{ $t('quickSettings') }}</h2>
      </div>
      <div class="settings-content">
        <div class="settings-row">
          <div class="setting-item">
            <label class="setting-label">{{ $t('localLanguageLabel') }}</label>
            <div class="select-wrapper">
              <select 
                v-model="settingForm.localLanguage"
                class="select-input"
              >
                <option value="" disabled>{{ getPlaceholder('localLanguage') }}</option>
                <option
                  v-for="item in settingPreset.localLanguage.optionList"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </option>
              </select>
              <ChevronDown class="select-icon" />
            </div>
          </div>
          <div class="setting-item">
            <label class="setting-label">{{ $t('replyLanguageLabel') }}</label>
            <div class="select-wrapper">
              <select 
                v-model="settingForm.replyLanguage"
                class="select-input"
              >
                <option value="" disabled>{{ getPlaceholder('replyLanguage') }}</option>
                <option
                  v-for="item in settingPreset.replyLanguage.optionList"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </option>
              </select>
              <ChevronDown class="select-icon" />
            </div>
          </div>
        </div>
        <div class="setting-item full-width">
          <label class="setting-label">{{ $t('apiLabel') }}</label>
          <div class="select-wrapper">
            <select 
              v-model="settingForm.api"
              class="select-input"
            >
              <option value="" disabled>{{ getPlaceholder('api') }}</option>
              <option
                v-for="item in settingPreset.api.optionList"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </option>
            </select>
            <ChevronDown class="select-icon" />
          </div>
        </div>
      </div>
    </div>

    <!-- API Configuration Sections -->
    <div
      v-for="platform in Object.keys(availableAPIs)"
      v-show="settingForm.api === platform"
      :key="platform"
      class="section"
    >
      <div class="section-header">
        <Settings class="section-icon" />
        <h2 class="section-title">{{ platform.toUpperCase() }} {{ $t('configuration') || 'Configuration' }}</h2>
      </div>
      <div class="settings-content">
        <!-- Input Settings -->
        <template
          v-for="item in getApiInputSettings(platform)"
          :key="item"
        >
          <div class="setting-item">
            <label class="setting-label">{{ $t(getLabel(item)) }}</label>
            <input
              v-model="settingForm[item as SettingNames]"
              class="text-input"
              :type="item.toLowerCase().includes('key') || item.toLowerCase().includes('token') ? 'password' : 'text'"
              :placeholder="$t(getPlaceholder(item))"
            />
          </div>
        </template>

        <!-- Select Settings -->
        <template
          v-for="item in getApiSelectSettings(platform)"
          :key="item"
        >
          <div class="setting-item">
            <label class="setting-label">{{ $t(getLabel(item)) }}</label>
            <div class="select-wrapper">
              <select 
                v-model="settingForm[item as SettingNames]"
                class="select-input"
              >
                <option value="" disabled>{{ $t(getPlaceholder(item)) }}</option>
                <option
                  v-for="option in settingPreset[item as SettingNames].optionList"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              <ChevronDown class="select-icon" />
            </div>
          </div>
        </template>

        <!-- Number Settings -->
        <template
          v-for="item in getApiNumSettings(platform)"
          :key="item"
        >
          <div class="setting-item">
            <label class="setting-label">{{ $t(getLabel(item)) }}</label>
            <input
              v-model.number="settingForm[item as SettingNames]"
              class="number-input"
              type="number"
              :min="0"
              :max="item.includes('Temperature') ? 2 : 4000"
              :step="item.includes('Temperature') ? 0.1 : 1"
              :placeholder="$t(getPlaceholder(item))"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Settings, ArrowLeft, Sliders, ChevronDown } from 'lucide-vue-next'

import { getLabel, getPlaceholder } from '@/utils/common'
import { availableAPIs } from '@/utils/constant'
import { SettingNames, settingPreset } from '@/utils/settingPreset'
import useSettingForm from '@/utils/settingForm'

const router = useRouter()
const { settingForm, settingFormKeys } = useSettingForm()

const getApiInputSettings = (platform: string) => {
  return Object.keys(settingForm.value).filter(
    key =>
      key.startsWith(platform) &&
      settingPreset[key as SettingNames].type === 'input'
  )
}

const getApiNumSettings = (platform: string) => {
  return Object.keys(settingForm.value).filter(
    key =>
      key.startsWith(platform) &&
      settingPreset[key as SettingNames].type === 'inputNum'
  )
}

const getApiSelectSettings = (platform: string) => {
  return Object.keys(settingForm.value).filter(
    key =>
      key.startsWith(platform) &&
      settingPreset[key as SettingNames].type === 'select'
  )
}

const addWatch = () => {
  settingFormKeys.forEach(key => {
    watch(
      () => settingForm.value[key],
      () => {
        if (settingPreset[key].saveFunc) {
          settingPreset[key].saveFunc!(settingForm.value[key])
          return
        }
        localStorage.setItem(
          settingPreset[key].saveKey || key,
          settingForm.value[key]
        )
      }
    )
  })
}

onBeforeMount(() => {
  addWatch()
})

function backToHome() {
  router.push('/')
}
</script>

<style scoped>
/* Global styles */
* {
  box-sizing: border-box;
}

.settings-page {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #fafbfc;
  min-height: 100vh;
  color: #21252b;
  font-size: 12px;
  line-height: 1.3;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #e1e4e8;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-icon {
  width: 20px;
  height: 20px;
  color: #0366d6;
}

.brand-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #24292e;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid #d0d7de;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #24292e;
  font-size: 12px;
  font-weight: 500;
}

.back-btn:hover {
  background: #f6f8fa;
  border-color: #0366d6;
  color: #0366d6;
}

.back-btn .icon {
  width: 14px;
  height: 14px;
}

/* Sections */
.section {
  margin-bottom: 16px;
  background: white;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f6f8fa;
  border-bottom: 1px solid #e1e4e8;
}

.section-icon {
  width: 14px;
  height: 14px;
  color: #586069;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: #24292e;
}

/* Settings Content */
.settings-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.settings-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.setting-item.full-width {
  grid-column: 1 / -1;
}

.setting-label {
  font-size: 12px;
  font-weight: 500;
  color: #24292e;
}

/* Input Styles */
.text-input,
.number-input {
  width: 100%;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #d0d7de;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  color: #24292e;
  transition: all 0.15s ease;
}

.text-input:focus,
.number-input:focus {
  outline: none;
  border-color: #0366d6;
  box-shadow: 0 0 0 2px rgba(3, 102, 214, 0.1);
}

.text-input:disabled,
.number-input:disabled {
  background: #f6f8fa;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Select Styles */
.select-wrapper {
  position: relative;
}

.select-input {
  width: 100%;
  height: 32px;
  padding: 0 28px 0 8px;
  border: 1px solid #d0d7de;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  color: #24292e;
  cursor: pointer;
  appearance: none;
  transition: all 0.15s ease;
}

.select-input:focus {
  outline: none;
  border-color: #0366d6;
  box-shadow: 0 0 0 2px rgba(3, 102, 214, 0.1);
}

.select-input:disabled {
  background: #f6f8fa;
  cursor: not-allowed;
  opacity: 0.7;
}

.select-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: #586069;
  pointer-events: none;
}

/* Number Input Specific Styles */
.number-input {
  appearance: textfield;
  -webkit-appearance: textfield;
  -moz-appearance: textfield;
}

.number-input::-webkit-outer-spin-button,
.number-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .settings-page {
    max-width: 100%;
    padding: 8px;
  }

  .settings-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .back-btn {
    width: 100%;
    justify-content: center;
  }

  .settings-content {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .settings-page {
    padding: 6px;
  }

  .brand-title {
    font-size: 16px;
  }

  .section-title {
    font-size: 12px;
  }

  .settings-content {
    padding: 10px;
    gap: 12px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .settings-page {
    background: #1c1f23;
    color: #e1e4e8;
  }
  
  .header {
    border-color: #30363d;
  }
  
  .brand-title {
    color: #f0f6fc;
  }
  
  .section {
    background: #21262d;
    border-color: #30363d;
  }
  
  .section-header {
    background: #161b22;
    border-color: #30363d;
  }
  
  .section-title {
    color: #f0f6fc;
  }
  
  .back-btn {
    background: #21262d;
    border-color: #30363d;
    color: #e1e4e8;
  }
  
  .back-btn:hover {
    background: #30363d;
    border-color: #58a6ff;
    color: #58a6ff;
  }
  
  .text-input,
  .number-input,
  .select-input {
    background: #0d1117;
    border-color: #30363d;
    color: #e1e4e8;
  }
  
  .text-input:disabled,
  .number-input:disabled,
  .select-input:disabled {
    background: #161b22;
  }
  
  .setting-label {
    color: #f0f6fc;
  }
}
</style>
