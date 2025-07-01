<template>
  <div class="settings-page">
    <div class="header-section">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon class="title-icon"><Setting /></el-icon>
          {{ $t('settings') }}
        </h1>
        <el-button class="back-btn" size="small" @click="backToHome">
          <el-icon><ArrowLeft /></el-icon>
          {{ $t('backToHome') }}
        </el-button>
      </div>
    </div>

    <div class="main-content">
      <div class="left-column">
        <el-card class="settings-card quick-settings-card" shadow="hover">
          <template #header>
            <h3 class="compact-title">
              <el-icon><Tools /></el-icon>
              {{ $t('quickSettings') }}
            </h3>
          </template>

          <div class="quick-settings-grid">
            <div class="setting-row">
              <div class="setting-group">
                <label class="compact-label">{{
                  $t('localLanguageLabel')
                }}</label>
                <el-select
                  v-model="settingForm.localLanguage"
                  class="compact-select"
                  size="small"
                  :placeholder="getPlaceholder('localLanguage')"
                >
                  <el-option
                    v-for="item in settingPreset.localLanguage.optionList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
              <div class="setting-group">
                <label class="compact-label">{{
                  $t('replyLanguageLabel')
                }}</label>
                <el-select
                  v-model="settingForm.replyLanguage"
                  class="compact-select"
                  size="small"
                  :placeholder="getPlaceholder('replyLanguage')"
                >
                  <el-option
                    v-for="item in settingPreset.replyLanguage.optionList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
            </div>
            <div class="setting-row">
              <div class="setting-group full-width">
                <label class="compact-label">{{ $t('apiLabel') }}</label>
                <el-select
                  v-model="settingForm.api"
                  class="compact-select"
                  size="small"
                  :placeholder="getPlaceholder('api')"
                >
                  <el-option
                    v-for="item in settingPreset.api.optionList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <div class="right-column">
        <el-card
          v-for="platform in Object.keys(availableAPIs)"
          v-show="settingForm.api === platform"
          :key="platform"
          class="settings-card api-config-card"
          shadow="hover"
        >
          <div class="api-settings-content">
            <div
              v-if="getApiInputSettings(platform).length > 0"
              class="settings-group"
            >
              <div class="settings-grid-compact">
                <template
                  v-for="item in getApiInputSettings(platform)"
                  :key="item"
                >
                  <div class="setting-item">
                    <label class="setting-label">{{
                      $t(getLabel(item))
                    }}</label>
                    <el-input
                      v-model="settingForm[item as SettingNames]"
                      class="setting-input"
                      size="small"
                      :placeholder="$t(getPlaceholder(item))"
                      :type="
                        item.includes('Key') || item.includes('Token')
                          ? 'password'
                          : 'text'
                      "
                      show-password
                    />
                  </div>
                </template>
              </div>
            </div>

            <div
              v-if="getApiSelectSettings(platform).length > 0"
              class="settings-group"
            >
              <div class="settings-grid-compact">
                <template
                  v-for="item in getApiSelectSettings(platform)"
                  :key="item"
                >
                  <div class="setting-item">
                    <label class="setting-label">{{
                      $t(getLabel(item))
                    }}</label>
                    <el-select
                      v-model="settingForm[item as SettingNames]"
                      class="setting-input"
                      size="small"
                      :placeholder="$t(getPlaceholder(item))"
                    >
                      <el-option
                        v-for="option in settingPreset[item as SettingNames]
                          .optionList"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </el-select>
                  </div>
                </template>
              </div>
            </div>

            <div
              v-if="getApiNumSettings(platform).length > 0"
              class="settings-group"
            >
              <div class="settings-grid-compact">
                <template
                  v-for="item in getApiNumSettings(platform)"
                  :key="item"
                >
                  <div class="setting-item">
                    <label class="setting-label">{{
                      $t(getLabel(item))
                    }}</label>
                    <el-input-number
                      v-model="settingForm[item as SettingNames]"
                      class="setting-input-number"
                      size="small"
                      :step="1"
                      :min="0"
                      :max="item.includes('Temperature') ? 2 : 4000"
                      controls-position="right"
                    />
                  </div>
                </template>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Setting, ArrowLeft, Tools } from '@element-plus/icons-vue'

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
.settings-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header Section */
.header-section {
  margin-bottom: 12px;
  padding: 4px;
  background: transparent;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1000px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.5px;
}

.title-icon {
  font-size: 28px;
  color: #007aff;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 16px;
  border-radius: 18px;
  border: 1px solid #e4e7ed;
  background: white;
  color: #606266;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 14px;
}

.back-btn:hover {
  border-color: #007aff;
  color: #007aff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.15);
}

/* Main Content */
.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  max-width: 1000px;
  margin: 0 auto;
}

/* Columns */
.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Settings Cards */
.settings-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
}

.settings-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.06);
  border-color: rgba(0, 0, 0, 0.1);
}

.settings-card:deep(.el-card__header) {
  padding: 12px 16px;
  background: rgba(248, 249, 250, 0.8);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px 16px 0 0;
}

.settings-card:deep(.el-card__body) {
  padding: 16px;
}

.compact-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.compact-title .el-icon {
  font-size: 16px;
  color: #007aff;
}

/* Quick Settings Card */
.quick-settings-card {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.quick-settings-grid {
  display: grid;
  grid-template-rows: repeat(2, auto);
  gap: 16px;
}

.setting-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: end;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.setting-group.full-width {
  grid-column: 1 / -1;
}

.compact-label {
  font-size: 12px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 2px;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.compact-select {
  width: 100%;
}

.compact-select:deep(.el-select__wrapper) {
  border-radius: 8px;
  border: 1.5px solid #e9ecef;
  transition: all 0.3s ease;
  min-height: 32px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.compact-select:deep(.el-select__wrapper:hover) {
  border-color: #007aff;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.15);
  transform: translateY(-1px);
}

.compact-select:deep(.el-select__wrapper:focus-within) {
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

/* Status Overview Card */
.status-overview-card {
  background: linear-gradient(135deg, #f0fff4 0%, #e6ffed 100%);
  border: 1px solid rgba(52, 199, 89, 0.1);
}

.status-overview-card:deep(.el-card__header) {
  background: linear-gradient(
    135deg,
    rgba(52, 199, 89, 0.03) 0%,
    rgba(248, 249, 250, 0.8) 100%
  );
  border-bottom: 1px solid rgba(52, 199, 89, 0.1);
}

.status-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item-compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.status-item-compact:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-label {
  font-size: 12px;
  font-weight: 500;
  color: #606266;
}

.status-value {
  font-weight: 600;
  border-radius: 6px;
}

.status-icon {
  font-size: 18px;
  transition: all 0.3s ease;
}

.status-icon.connected {
  color: #34c759;
}

.status-icon.disconnected {
  color: #ff3b30;
}

.config-icon {
  font-size: 18px;
  transition: all 0.3s ease;
}

.config-icon.configured {
  color: #34c759;
}

.config-icon.not-configured {
  color: #ff3b30;
}

/* API Configuration Card */
.api-config-card {
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
  border: 1px solid rgba(0, 122, 255, 0.1);
}

.api-config-card:deep(.el-card__header) {
  background: linear-gradient(
    135deg,
    rgba(0, 122, 255, 0.03) 0%,
    rgba(248, 249, 250, 0.8) 100%
  );
  border-bottom: 1px solid rgba(0, 122, 255, 0.1);
}

.api-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.api-settings-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-title {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #495057;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.settings-grid-compact {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.setting-label {
  font-size: 12px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 2px;
}

.setting-input {
  width: 100%;
}

.setting-input:deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.setting-input:deep(.el-input__wrapper:hover) {
  border-color: #007aff;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.15);
  transform: translateY(-1px);
}

.setting-input:deep(.el-input__wrapper.is-focus) {
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.setting-input:deep(.el-select__wrapper) {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.setting-input:deep(.el-select__wrapper:hover) {
  border-color: #007aff;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.15);
  transform: translateY(-1px);
}

.setting-input-number {
  width: 100%;
}

.setting-input-number:deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.setting-input-number:deep(.el-input__wrapper:hover) {
  border-color: #007aff;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.15);
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .settings-page {
    padding: 8px;
  }

  .main-content {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .header-content {
    flex-direction: column;
    gap: 12px;
    text-align: center;
    padding: 12px 16px;
  }

  .page-title {
    font-size: 20px;
    justify-content: center;
  }

  .setting-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .setting-group.full-width {
    grid-column: 1;
  }

  .settings-card:deep(.el-card__body) {
    padding: 12px;
  }

  .settings-card:deep(.el-card__header) {
    padding: 10px 12px;
  }

  .status-item-compact {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }

  .back-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .settings-page {
    padding: 6px;
  }

  .page-title {
    font-size: 18px;
  }

  .compact-title {
    font-size: 13px;
  }

  .header-content {
    padding: 10px 12px;
  }

  .quick-settings-grid {
    gap: 12px;
  }

  .settings-grid-compact {
    gap: 10px;
  }
}
</style>
