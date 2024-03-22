<template>
  <div id="setting">
    <el-row
      class="view-title"
      align="middle"
      justify="center"
      style="font-size: 20px;color: black;"
    >
      {{ $t('settings') }}
    </el-row>
    <el-row
      class="setting-list"
      style="margin-top: 20px;"
    >
      <el-col
        :span="20"
        :offset="2"
      />
      <el-row
        style="width: 100%;display: flex;justify-content: center;align-items: center;flex-direction: column;"
      >
        <el-button
          type="primary"
          round
          plain
          style="margin-bottom: 5px;width: 100%;"
          @click="backToHome"
        >
          {{ $t('backToHome') }}
        </el-button>
        <el-form
          label-position="left"
          size="default"
          label-width="50%"
        >
          <el-form-item>
            <template #label>
              <span>
                {{ $t('settingChooseLanguage') }}
              </span>
            </template>
            <el-select
              v-model="currentUILanguage"
              size="small"
              :placeholder="$t('settingChooseLanguage')"
              @change="handleLocalLanguageChange"
            >
              <el-option
                v-for="item in languageList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <template #label>
              <span>
                {{ $t('chooseAPI') }}
              </span>
            </template>
            <el-select
              v-model="api"
              size="small"
              :placeholder="$t('chooseAPIDescription')"
              @change="handleApiChange"
            >
              <el-option
                v-for="item in apiList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="api === 'web-api'"
          >
            <template #label>
              <span>
                {{ $t('accessToken') }}
              </span>
            </template>
            <el-input
              v-model="accessToken"
              :placeholder="$t('accessTokenDescription')"
              size="small"
              clearable
              @blur="handleAccessTokenChange"
            />
          </el-form-item>
          <el-form-item
            v-if="false"
          >
            <template #label>
              <span>
                {{ $t('settingModel') }}
              </span>
            </template>
            <el-select
              v-model="webModel"
              size="small"
              :placeholder="$t('settingModel')"
              @change="handleWebModelChange"
            >
              <el-option
                v-for="item in webModelList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="api === 'official'"
          >
            <template #label>
              <span>
                {{ $t('apiKey') }}
              </span>
            </template>
            <el-input
              v-model="apiKey"
              :placeholder="$t('apiKeyDescription')"
              size="small"
              @blur="handleApiKeyChange"
            />
          </el-form-item>
          <el-form-item
            v-if="api === 'official'"
          >
            <template #label>
              <span>
                {{ $t('settingBasePath') }}
              </span>
            </template>
            <el-input
              v-model="basePath"
              :placeholder="$t('settingBasePath')"
              size="small"
              @blur="handleBasePathChange"
            />
          </el-form-item>
          <el-form-item
            v-if="api === 'official'"
          >
            <template #label>
              <span>
                {{ $t('settingModel') }}
              </span>
            </template>
            <el-select
              v-model="model"
              size="small"
              :placeholder="$t('settingModel')"
              @change="handleModelChange"
            >
              <el-option
                v-for="item in modelList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="api === 'official'"
          >
            <template #label>
              <span>
                {{ $t('settingTemperature') }}
              </span>
            </template>
            <el-input-number
              v-model="temperature"
              :min="0"
              :max="2"
              :step="0.1"
              size="small"
              @change="handleTemperatureChange"
            />
          </el-form-item>
          <el-form-item
            v-if="api === 'official'"
          >
            <template #label>
              <span>
                {{ $t('settingMaxTokens') }}
              </span>
            </template>
            <el-input-number
              v-model="maxTokens"
              :min="1"
              :step="1"
              size="small"
              @change="handleMaxTokensChange"
            />
          </el-form-item>
          <el-form-item
            v-if="api === 'azure'"
          >
            <template #label>
              <span>
                {{ $t('apiKey') }}
              </span>
            </template>
            <el-input
              v-model="azureAPIKey"
              :placeholder="$t('apiKeyDescription')"
              size="small"
              @blur="handleAzureAPIKeyChange"
            />
          </el-form-item>
          <el-form-item
            v-if="api === 'azure'"
          >
            <template #label>
              <span>
                {{ $t('settingAzureEndpoint') }}
              </span>
            </template>
            <el-input
              v-model="azureAPIEndpoint"
              :placeholder="$t('settingAzureEndpoint')"
              size="small"
              @blur="handleAzureAPIEndpointChange"
            />
          </el-form-item>
          <el-form-item
            v-if="api === 'azure'"
          >
            <template #label>
              <span>
                {{ $t('settingAzureDeploymentName') }}
              </span>
            </template>
            <el-input
              v-model="azureDeploymentName"
              :placeholder="$t('settingAzureDeploymentName')"
              size="small"
              @blur="handleAzureDeploymentNameChange"
            />
          </el-form-item>
          <el-form-item
            v-if="api === 'azure'"
          >
            <template #label>
              <span>
                {{ $t('settingTemperature') }}
              </span>
            </template>
            <el-input-number
              v-model="azureTemperature"
              :min="0"
              :max="2"
              :step="0.1"
              size="small"
              @change="handleAzureTemperatureChange"
            />
          </el-form-item>
          <el-form-item
            v-if="api === 'azure'"
          >
            <template #label>
              <span>
                {{ $t('settingMaxTokens') }}
              </span>
            </template>
            <el-input-number
              v-model="azureMaxTokens"
              :min="1"
              :step="1"
              size="small"
              @change="handleAzureMaxTokensChange"
            />
          </el-form-item>
          <el-form-item
            v-if="api === 'palm'"
          >
            <template #label>
              <span>
                {{ $t('apiKey') }}
              </span>
            </template>
            <el-input
              v-model="palmAPIKey"
              :placeholder="$t('apiKeyDescription')"
              size="small"
              @blur="handlePalmAPIKeyChange"
            />
          </el-form-item>
          <el-form-item
            v-if="api === 'palm'"
          >
            <template #label>
              <span>
                {{ $t('settingPalmEndpoint') }}
              </span>
            </template>
            <el-input
              v-model="palmAPIEndpoint"
              :placeholder="$t('settingPalmEndpoint')"
              size="small"
              @blur="handlePalmAPIEndpointChange"
            />
          </el-form-item>
          <el-form-item
            v-if="api === 'palm'"
          >
            <template #label>
              <span>
                {{ $t('settingModel') }}
              </span>
            </template>
            <el-select
              v-model="palmModel"
              size="small"
              :placeholder="$t('settingModel')"
              @change="handlePalmModelChange"
            >
              <el-option
                v-for="item in palmModelList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="api === 'palm'"
          >
            <template #label>
              <span>
                {{ $t('settingTemperature') }}
              </span>
            </template>
            <el-input-number
              v-model="palmTemperature"
              :min="0"
              :max="2"
              :step="0.1"
              size="small"
              @change="handlePalmTemperatureChange"
            />
          </el-form-item>
          <el-form-item
            v-if="api === 'palm'"
          >
            <template #label>
              <span>
                {{ $t('settingMaxTokens') }}
              </span>
            </template>
            <el-input-number
              v-model="palmMaxTokens"
              :min="1"
              :step="1"
              size="small"
              @change="handlePalmMaxTokensChange"
            />
          </el-form-item>
          <el-form-item
            v-if="api === 'gemini'"
          >
            <template #label>
              <span>
                {{ $t('apiKey') }}
              </span>
            </template>
            <el-input
              v-model="geminiAPIKey"
              :placeholder="$t('apiKeyDescription')"
              size="small"
              @blur="handleGeminiAPIKeyChange"
            />
          </el-form-item>
          <el-form-item
            v-if="api === 'gemini'"
          >
            <template #label>
              <span>
                {{ $t('settingTemperature') }}
              </span>
            </template>
            <el-input-number
              v-model="geminiTemperature"
              :min="0"
              :max="1"
              :step="0.1"
              size="small"
              @change="handleGeminiTemperatureChange"
            />
          </el-form-item>
          <el-form-item
            v-if="api === 'gemini'"
          >
            <template #label>
              <span>
                {{ $t('settingMaxTokens') }}
              </span>
            </template>
            <el-input-number
              v-model="geminiMaxTokens"
              :min="1"
              :step="1"
              size="small"
              @change="handleGeminiMaxTokensChange"
            />
          </el-form-item>
          <el-form-item
            v-if="api === 'gemini'"
          >
            <template #label>
              <span>
                {{ $t('settingModel') }}
              </span>
            </template>
            <el-select
              v-model="geminiModel"
              size="small"
              :placeholder="$t('settingModel')"
              @change="handleGeminiModelChange"
            >
              <el-option
                v-for="item in geminiModelList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="api === 'ollama'"
          >
            <template #label>
              <span>
                {{ $t('settingOllamaEndpoint') }}
              </span>
            </template>
            <el-input
              v-model="ollamaEndpoint"
              :placeholder="$t('settingOllamaEndpoint')"
              size="small"
              @blur="handleOllamaEndpointChange"
            />
          </el-form-item>
          <el-form-item
            v-if="api === 'ollama'"
          >
            <template #label>
              <span>
                {{ $t('settingModel') }}
              </span>
            </template>
            <el-select
              v-model="ollamaModel"
              size="small"
              :placeholder="$t('settingModel')"
              @change="handleOllamaModelChange"
            >
              <el-option
                v-for="item in ollamaModelList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="api === 'ollama'"
          >
            <template #label>
              <span>
                {{ $t('settingTemperature') }}
              </span>
            </template>
            <el-input-number
              v-model="ollamaTemperature"
              :min="0"
              :max="1"
              :step="0.1"
              size="small"
              @change="handleOllamaTemperatureChange"
            />
          </el-form-item>
          <el-form-item>
            <template #label>
              <span>
                {{ $t('settingReplyLanguage') }}
              </span>
            </template>
            <el-select
              v-model="replyLanguage"
              size="small"
              :placeholder="$t('settingReplyLanguage')"
              @change="handleReplyLanguageChange"
            >
              <el-option
                v-for="item in replyLanguageList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </el-row>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { languageMap, availableModels, localStorageKey, availableModelsForPlus, availableModelsForPalm, availableModelsForGemini, availableModelsForOllama } from '@/utils/constant'
import { useRouter } from 'vue-router'
import { forceNumber } from '@/utils/common'

const router = useRouter()

const languageList = [
  {
    label: 'English',
    value: 'en'
  },
  {
    label: '简体中文',
    value: 'zh-cn'
  }
]

const replyLanguageList = Object.values(languageMap).map((key) => ({
  label: key,
  value: key
}))

const modelList = Object.keys(availableModels).map((key) => ({
  label: availableModels[key],
  value: availableModels[key]
}))

const webModelList = Object.keys(availableModelsForPlus).map((key) => ({
  label: key,
  value: availableModels[key]
}))

const palmModelList = Object.keys(availableModelsForPalm).map((key) => ({
  label: key,
  value: availableModelsForPalm[key]
}))

const geminiModelList = Object.keys(availableModelsForGemini).map((key) => ({
  label: key,
  value: availableModelsForGemini[key]
}))

const ollamaModelList = Object.keys(availableModelsForOllama).map((key) => ({
  label: key,
  value: availableModelsForOllama[key]
}))

const api = ref<'official' | 'web-api' | 'azure' | 'palm' | 'gemini' | 'ollama'>('official')
const currentUILanguage = ref('en')
const replyLanguage = ref('English')
// web API
const accessToken = ref('')
const webModel = ref('default')
// official API
const model = ref(availableModels['gpt-3.5'])
const apiKey = ref('')
const temperature = ref(0.7)
const maxTokens = ref(800)
const basePath = ref('')
// azure OpenAI API
const azureAPIKey = ref('')
const azureAPIEndpoint = ref('')
const azureDeploymentName = ref('')
const azureMaxTokens = ref(800)
const azureTemperature = ref(0.7)
// palm API
const palmAPIKey = ref('')
const palmAPIEndpoint = ref('https://generativelanguage.googleapis.com/v1beta2')
const palmModel = ref(availableModelsForPalm['text-bison-001'])
const palmTemperature = ref(0.7)
const palmMaxTokens = ref(800)
// gemini API
const geminiAPIKey = ref('')
const geminiModel = ref(availableModelsForGemini['gemini-pro'])
const geminiTemperature = ref(0.7)
const geminiMaxTokens = ref(800)
// ollama API
const ollamaEndpoint = ref('')
const ollamaModel = ref(availableModelsForOllama.llama2)
const ollamaTemperature = ref(0.7)

const apiList = [
  {
    label: 'official',
    value: 'official'
  },
  {
    label: 'azure',
    value: 'azure'
  },
  {
    label: 'palm',
    value: 'palm'
  },
  {
    label: 'gemini',
    value: 'gemini'
  },
  {
    label: 'ollama',
    value: 'ollama'
  }
]

const { locale } = useI18n()

onBeforeMount(() => {
  initData()
})

function initData () {
  // common
  api.value = localStorage.getItem(localStorageKey.api) as 'official' | 'web-api' | 'azure'| 'palm' | 'gemini' | 'ollama' || 'official'
  currentUILanguage.value = localStorage.getItem(localStorageKey.localLanguage) || 'en'
  replyLanguage.value = localStorage.getItem(localStorageKey.replyLanguage) || 'English'
  // web API
  accessToken.value = localStorage.getItem(localStorageKey.accessToken) || ''
  webModel.value = localStorage.getItem(localStorageKey.webModel) || 'default'
  // official API
  apiKey.value = localStorage.getItem(localStorageKey.apiKey) || ''
  const modelTemp = localStorage.getItem(localStorageKey.model) || availableModels['gpt-3.5']
  if (Object.keys(availableModels).includes(modelTemp)) {
    model.value = availableModels[modelTemp]
  } else if (Object.values(availableModels).includes(modelTemp)) {
    model.value = modelTemp
  } else {
    model.value = availableModels['gpt-3.5']
  }
  temperature.value = forceNumber(localStorage.getItem(localStorageKey.temperature)) || 0.7
  maxTokens.value = forceNumber(localStorage.getItem(localStorageKey.maxTokens)) || 800
  basePath.value = localStorage.getItem(localStorageKey.basePath) || ''
  // azure OpenAI API
  azureAPIKey.value = localStorage.getItem(localStorageKey.azureAPIKey) || ''
  azureAPIEndpoint.value = localStorage.getItem(localStorageKey.azureAPIEndpoint) || ''
  azureDeploymentName.value = localStorage.getItem(localStorageKey.azureDeploymentName) || ''
  azureMaxTokens.value = forceNumber(localStorage.getItem(localStorageKey.azureMaxTokens)) || 800
  azureTemperature.value = forceNumber(localStorage.getItem(localStorageKey.azureTemperature)) || 0.7
  // palm API
  palmAPIKey.value = localStorage.getItem(localStorageKey.palmAPIKey) || ''
  palmAPIEndpoint.value = localStorage.getItem(localStorageKey.palmAPIEndpoint) || 'https://generativelanguage.googleapis.com/v1beta2'
  palmMaxTokens.value = forceNumber(localStorage.getItem(localStorageKey.palmMaxTokens)) || 800
  palmTemperature.value = forceNumber(localStorage.getItem(localStorageKey.palmTemperature)) || 0.7
  const palmModelTemp = localStorage.getItem(localStorageKey.palmModel) || availableModelsForPalm['text-bison-001']
  if (Object.keys(availableModelsForPalm).includes(palmModelTemp)) {
    palmModel.value = availableModelsForPalm[palmModelTemp]
  } else if (Object.values(availableModelsForPalm).includes(palmModelTemp)) {
    palmModel.value = palmModelTemp
  } else {
    palmModel.value = availableModelsForPalm['text-bison-001']
  }
  // gemini API
  geminiAPIKey.value = localStorage.getItem(localStorageKey.geminiAPIKey) || ''
  geminiMaxTokens.value = forceNumber(localStorage.getItem(localStorageKey.geminiMaxTokens)) || 800
  geminiTemperature.value = forceNumber(localStorage.getItem(localStorageKey.geminiTemperature)) || 0.7
  const geminiModelTemp = localStorage.getItem(localStorageKey.geminiModel) || availableModelsForGemini['gemini-pro']
  if (Object.keys(availableModelsForGemini).includes(geminiModelTemp)) {
    geminiModel.value = availableModelsForGemini[geminiModelTemp]
  } else if (Object.values(availableModelsForGemini).includes(geminiModelTemp)) {
    geminiModel.value = geminiModelTemp
  } else {
    geminiModel.value = availableModelsForGemini['gemini-pro']
  }
  // ollama API
  ollamaEndpoint.value = localStorage.getItem(localStorageKey.ollamaEndpoint) || ''
  const ollamaModelTemp = localStorage.getItem(localStorageKey.ollamaModel) || availableModelsForOllama.llama2
  if (Object.keys(availableModelsForOllama).includes(ollamaModelTemp)) {
    ollamaModel.value = availableModelsForOllama[ollamaModelTemp]
  } else if (Object.values(availableModelsForOllama).includes(ollamaModelTemp)) {
    ollamaModel.value = ollamaModelTemp
  } else {
    ollamaModel.value = availableModelsForOllama.llama2
  }
  ollamaTemperature.value = forceNumber(localStorage.getItem(localStorageKey.ollamaTemperature)) || 0.7
}

// common

function handleApiChange (val: string) {
  localStorage.setItem(localStorageKey.api, val)
}

function handleLocalLanguageChange (val: string) {
  locale.value = val
  localStorage.setItem(localStorageKey.localLanguage, val)
}

function handleReplyLanguageChange (val: string) {
  localStorage.setItem(localStorageKey.replyLanguage, val)
}

function handleWebModelChange (val: string) {
  localStorage.setItem(localStorageKey.webModel, val)
}

function handleModelChange (val: string) {
  localStorage.setItem(localStorageKey.model, val)
}

function handleApiKeyChange () {
  localStorage.setItem(localStorageKey.apiKey, apiKey.value)
}

function handleAccessTokenChange () {
  localStorage.setItem(localStorageKey.accessToken, accessToken.value)
}

function handleBasePathChange () {
  localStorage.setItem(localStorageKey.basePath, basePath.value)
}

function handleTemperatureChange () {
  localStorage.setItem(localStorageKey.temperature, temperature.value.toString())
}

function handleMaxTokensChange () {
  localStorage.setItem(localStorageKey.maxTokens, maxTokens.value.toString())
}

function handleAzureAPIKeyChange () {
  localStorage.setItem(localStorageKey.azureAPIKey, azureAPIKey.value)
}

function handleAzureAPIEndpointChange () {
  localStorage.setItem(localStorageKey.azureAPIEndpoint, azureAPIEndpoint.value)
}

function handleAzureDeploymentNameChange () {
  localStorage.setItem(localStorageKey.azureDeploymentName, azureDeploymentName.value)
}

function handleAzureMaxTokensChange () {
  localStorage.setItem(localStorageKey.azureMaxTokens, azureMaxTokens.value.toString())
}

function handleAzureTemperatureChange () {
  localStorage.setItem(localStorageKey.azureTemperature, azureTemperature.value.toString())
}

function handlePalmAPIKeyChange () {
  localStorage.setItem(localStorageKey.palmAPIKey, palmAPIKey.value)
}

function handlePalmAPIEndpointChange () {
  localStorage.setItem(localStorageKey.palmAPIEndpoint, palmAPIEndpoint.value)
}

function handlePalmMaxTokensChange () {
  localStorage.setItem(localStorageKey.palmMaxTokens, palmMaxTokens.value.toString())
}

function handlePalmTemperatureChange () {
  localStorage.setItem(localStorageKey.palmTemperature, palmTemperature.value.toString())
}

function handlePalmModelChange (val: string) {
  localStorage.setItem(localStorageKey.palmModel, val)
}

function handleGeminiAPIKeyChange () {
  localStorage.setItem(localStorageKey.geminiAPIKey, geminiAPIKey.value)
}

function handleGeminiMaxTokensChange () {
  localStorage.setItem(localStorageKey.geminiMaxTokens, geminiMaxTokens.value.toString())
}

function handleGeminiTemperatureChange () {
  localStorage.setItem(localStorageKey.geminiTemperature, geminiTemperature.value.toString())
}

function handleGeminiModelChange (val: string) {
  localStorage.setItem(localStorageKey.geminiModel, val)
}

function handleOllamaEndpointChange () {
  localStorage.setItem(localStorageKey.ollamaEndpoint, ollamaEndpoint.value)
}

function handleOllamaModelChange (val: string) {
  localStorage.setItem(localStorageKey.ollamaModel, val)
}

function handleOllamaTemperatureChange () {
  localStorage.setItem(localStorageKey.ollamaTemperature, ollamaTemperature.value.toString())
}

function backToHome () {
  router.push('/')
}

</script>

<style lang='stylus'>
#setting
  height 100%
  overflow-y auto
</style>
