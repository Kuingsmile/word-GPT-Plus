<template>
  <div class="homepage">
    <!-- Header with branding -->
    <div class="header">
      <div class="brand">
        <Zap class="brand-icon" />
        <h1 class="brand-title">
          Word GPT+
        </h1>
      </div>
      <button
        class="settings-btn"
        :disabled="loading"
        @click="settings"
      >
        <Settings class="icon" />
      </button>
    </div>

    <!-- Main Actions -->
    <div class="main-actions">
      <button
        class="primary-btn"
        :disabled="loading"
        @click="StartChat"
      >
        <Play class="icon" />
        {{ $t('start') }}
      </button>
      <button
        v-if="
          ['azure', 'official', 'gemini', 'ollama', 'groq'].includes(
            settingForm.api
          )
        "
        class="secondary-btn"
        :disabled="loading"
        @click="continueChat"
      >
        <ArrowRight class="icon" />
        {{ $t('continue') }}
      </button>
    </div>

    <!-- Progress Indicator -->
    <div
      v-if="loading"
      class="progress-section"
    >
      <div class="progress-indicator">
        <Loader2 class="spinning-icon" />
        <span class="progress-text">AI is processing...</span>
      </div>
    </div>

    <!-- Quick Settings - Always visible -->
    <div class="section">
      <div class="section-header">
        <Sliders class="section-icon" />
        <h2 class="section-title">
          Quick Settings
        </h2>
      </div>
      <div class="settings-grid">
        <div class="settings-row">
          <div class="setting-item">
            <label class="setting-label">{{ $t('apiLabel') }}</label>
            <div class="select-wrapper">
              <select
                v-model="settingForm.api"
                class="select-input"
              >
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
          <div class="setting-item">
            <label class="setting-label">{{ $t('modelLabel') }}</label>
            <div class="select-wrapper">
              <select
                v-model="currentModelSelect"
                class="select-input"
                :disabled="
                  !currentModelOptions || currentModelOptions.length === 0
                "
              >
                <option
                  v-for="item in currentModelOptions"
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
        <div class="settings-row">
          <div class="setting-item">
            <label class="setting-label">{{ $t('insertTypeLabel') }}</label>
            <div class="select-wrapper">
              <select
                v-model="insertType"
                class="select-input"
                @change="
                  e =>
                    handleInsertTypeChange(
                      (e.target as HTMLSelectElement)?.value as insertTypes
                    )
                "
              >
                <option
                  v-for="item in insertTypeList"
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
            <label class="setting-label">{{
              $t('useWordFormattingLabel')
            }}</label>
            <label class="toggle-wrapper">
              <input
                v-model="useWordFormatting"
                type="checkbox"
                class="toggle-input"
                @change="() => handleWordFormattingChange(useWordFormatting)"
              >
              <div class="toggle-slider" />
            </label>
          </div>
        </div>
        <div class="setting-item">
          <label class="setting-label">{{ $t('replyLanguageLabel') }}</label>
          <div class="select-wrapper">
            <select
              v-model="settingForm.replyLanguage"
              class="select-input"
            >
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
    </div>

    <!-- AI Tools - Collapsible -->
    <div class="collapsible-section">
      <div
        class="collapsible-header"
        @click="aiToolsExpanded = !aiToolsExpanded"
      >
        <div class="collapsible-title">
          <Sparkles class="collapsible-icon" />
          {{ $t('aiTools') }}
        </div>
        <ChevronDown
          class="collapse-icon"
          :class="{ expanded: aiToolsExpanded }"
        />
      </div>
      <div
        class="collapsible-content"
        :class="{ expanded: aiToolsExpanded }"
      >
        <div class="action-grid">
          <button
            v-for="item in actionList"
            :key="item"
            class="action-btn"
            :disabled="loading"
            @click="performAction(item)"
          >
            {{ $t(item) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Result -->
    <div class="section">
      <div class="section-header">
        <FileText class="section-icon" />
        <h2 class="section-title">
          {{ $t('result') }}
        </h2>
      </div>
      <textarea
        v-model="result"
        class="result-textarea"
        :placeholder="$t('result')"
        rows="3"
      />
    </div>

    <!-- Prompts - Collapsible -->
    <div class="collapsible-section">
      <div
        class="collapsible-header"
        @click="promptsExpanded = !promptsExpanded"
      >
        <div class="collapsible-title">
          <MessageSquare class="collapsible-icon" />
          {{ $t('prompts') }}
        </div>
        <ChevronDown
          class="collapse-icon"
          :class="{ expanded: promptsExpanded }"
        />
      </div>
      <div
        class="collapsible-content"
        :class="{ expanded: promptsExpanded }"
      >
        <!-- System Prompt -->
        <div class="prompt-section">
          <div class="prompt-header">
            <label class="prompt-label">{{ $t('homeSystem') }}</label>
            <div class="prompt-actions">
              <button
                class="icon-btn add-btn"
                @click="addSystemPromptVisible = true"
              >
                <Plus class="small-icon" />
              </button>
              <button
                class="icon-btn remove-btn"
                @click="removeSystemPromptVisible = true"
              >
                <Minus class="small-icon" />
              </button>
            </div>
          </div>
          <div class="select-wrapper">
            <select
              v-model="systemPromptSelected"
              class="select-input"
              @change="
                e =>
                  handleSystemPromptChange(
                    (e.target as HTMLSelectElement)?.value ?? ''
                  )
              "
            >
              <option
                value=""
                disabled
              >
                {{ $t('homeSystemDescription') }}
              </option>
              <option
                v-for="item in systemPromptList"
                :key="item.value"
                :value="item.value"
              >
                {{ item.key }}
              </option>
            </select>
            <ChevronDown class="select-icon" />
          </div>
          <textarea
            v-model="systemPrompt"
            class="prompt-textarea"
            :placeholder="$t('homeSystemDescription')"
            rows="2"
            @blur="handleSystemPromptChange(systemPrompt)"
          />
        </div>

        <!-- User Prompt -->
        <div class="prompt-section">
          <div class="prompt-header">
            <label class="prompt-label">{{ $t('homePrompt') }}</label>
            <div class="prompt-actions">
              <button
                class="icon-btn add-btn"
                @click="addPromptVisible = true"
              >
                <Plus class="small-icon" />
              </button>
              <button
                class="icon-btn remove-btn"
                @click="removePromptVisible = true"
              >
                <Minus class="small-icon" />
              </button>
            </div>
          </div>
          <div class="select-wrapper">
            <select
              v-model="promptSelected"
              class="select-input"
              @change="
                e =>
                  handlePromptChange(
                    (e.target as HTMLSelectElement)?.value ?? ''
                  )
              "
            >
              <option
                value=""
                disabled
              >
                {{ $t('homePromptDescription') }}
              </option>
              <option
                v-for="item in promptList"
                :key="item.value"
                :value="item.value"
              >
                {{ item.key }}
              </option>
            </select>
            <ChevronDown class="select-icon" />
          </div>
          <textarea
            v-model="prompt"
            class="prompt-textarea"
            :placeholder="$t('homePromptDescription')"
            rows="2"
            @blur="handlePromptChange(prompt)"
          />
        </div>
      </div>
    </div>

    <!-- Dialogs -->
    <HomePageAddDialog
      v-model:add-visible="addSystemPromptVisible"
      v-model:add-alias="addSystemPromptAlias"
      v-model:add-value="addSystemPromptValue"
      title="addSystemPrompt"
      alias-label="addSystemPromptAlias"
      alias-placeholder="addSystemPromptAliasDescription"
      prompt-label="homeSystem"
      prompt-placeholder="addSystemPromptDescription"
      @add="addSystemPrompt"
    />
    <HomePageAddDialog
      v-model:add-visible="addPromptVisible"
      v-model:add-alias="addPromptAlias"
      v-model:add-value="addPromptValue"
      title="addPrompt"
      alias-label="addPromptAlias"
      alias-placeholder="addPromptAliasDescription"
      prompt-label="homePrompt"
      prompt-placeholder="homePromptDescription"
      @add="addPrompt"
    />
    <HomePageDialog
      v-model:remove-visible="removeSystemPromptVisible"
      v-model:remove-value="removeSystemPromptValue"
      title="removeSystemPrompt"
      :option-list="systemPromptList"
      @remove="removeSystemPrompt"
    />
    <HomePageDialog
      v-model:remove-visible="removePromptVisible"
      v-model:remove-value="removePromptValue"
      title="removePrompt"
      :option-list="promptList"
      @remove="removePrompt"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  Plus,
  Minus,
  Settings,
  Sparkles,
  FileText,
  Play,
  ArrowRight,
  Loader2,
  Sliders,
  ChevronDown,
  MessageSquare,
  Zap
} from 'lucide-vue-next'
import { onBeforeMount, ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { message } from '@/utils/message'

import { buildInPrompt } from '@/utils/constant'
import { promptDbInstance } from '@/store/promtStore'

import { checkAuth } from '@/utils/common'
import { localStorageKey } from '@/utils/enum'
import useSettingForm from '@/utils/settingForm'
import { settingPreset } from '@/utils/settingPreset'

import HomePageDialog from '@/components/HomePageDialog.vue'
import HomePageAddDialog from '@/components/HomePageAddDialog.vue'
import { getChatResponse } from '@/api/union'
import { insertFormattedResult, insertResult } from '@/api/common'

const { t } = useI18n()

const { settingForm } = useSettingForm()

// Collapsible section states
const aiToolsExpanded = ref(false)
const promptsExpanded = ref(false)

// system prompt
const systemPrompt = ref('')
const systemPromptSelected = ref('')
const systemPromptList = ref<IStringKeyMap[]>([])
const addSystemPromptVisible = ref(false)
const addSystemPromptAlias = ref('')
const addSystemPromptValue = ref('')
const removeSystemPromptVisible = ref(false)
const removeSystemPromptValue = ref<any[]>([])

// user prompt
const prompt = ref('')
const promptSelected = ref('')
const promptList = ref<IStringKeyMap[]>([])
const addPromptVisible = ref(false)
const addPromptAlias = ref('')
const addPromptValue = ref('')
const removePromptVisible = ref(false)
const removePromptValue = ref<any[]>([])

// result
const result = ref('res')
const loading = ref(false)
const router = useRouter()
const historyDialog = ref<any[]>([])

const jsonIssue = ref(false)
const errorIssue = ref(false)

// insert type
const insertType = ref<insertTypes>('replace')
const useWordFormatting = ref(true)
const insertTypeList = ['replace', 'append', 'newLine', 'NoAction'].map(
  item => ({
    label: t(item),
    value: item
  })
)

// Dynamic model selection based on current API
const currentModelOptions = computed(() => {
  switch (settingForm.value.api) {
    case 'official':
      return settingPreset.officialModelSelect.optionList
    case 'gemini':
      return settingPreset.geminiModelSelect.optionList
    case 'ollama':
      return settingPreset.ollamaModelSelect.optionList
    case 'groq':
      return settingPreset.groqModelSelect.optionList
    case 'azure':
      return [] // Azure uses deployment name instead of model selection
    default:
      return []
  }
})

const currentModelSelect = computed({
  get() {
    switch (settingForm.value.api) {
      case 'official':
        return settingForm.value.officialModelSelect
      case 'gemini':
        return settingForm.value.geminiModelSelect
      case 'ollama':
        return settingForm.value.ollamaModelSelect
      case 'groq':
        return settingForm.value.groqModelSelect
      case 'azure':
        return settingForm.value.azureDeploymentName
      default:
        return ''
    }
  },
  set(value) {
    switch (settingForm.value.api) {
      case 'official':
        settingForm.value.officialModelSelect = value
        break
      case 'gemini':
        settingForm.value.geminiModelSelect = value
        break
      case 'ollama':
        settingForm.value.ollamaModelSelect = value
        break
      case 'groq':
        settingForm.value.groqModelSelect = value
        break
      case 'azure':
        settingForm.value.azureDeploymentName = value
        break
    }
  }
})

async function getSystemPromptList() {
  const table = promptDbInstance.table('systemPrompt')
  const list = (await table.toArray()) as unknown as IStringKeyMap[]
  systemPromptList.value = list
}

async function addSystemPrompt() {
  const table = promptDbInstance.table('systemPrompt')
  await table.put({
    key: addSystemPromptAlias.value,
    value: addSystemPromptValue.value
  })
  addSystemPromptVisible.value = false
  getSystemPromptList()
}

async function removeSystemPrompt() {
  removeSystemPromptVisible.value = false
  const table = promptDbInstance.table('systemPrompt')
  for (const value of removeSystemPromptValue.value) {
    await table.delete(value)
  }
  removeSystemPromptValue.value = []
  getSystemPromptList()
}

async function removePrompt() {
  removePromptVisible.value = false
  const table = promptDbInstance.table('userPrompt')
  for (const value of removePromptValue.value) {
    await table.delete(value)
  }
  removePromptValue.value = []
  getPromptList()
}

function handleSystemPromptChange(val: string) {
  systemPrompt.value = val
  localStorage.setItem(localStorageKey.defaultSystemPrompt, val)
}

async function getPromptList() {
  const table = promptDbInstance.table('userPrompt')
  const list = (await table.toArray()) as unknown as IStringKeyMap[]
  promptList.value = list
}

async function addPrompt() {
  const table = promptDbInstance.table('userPrompt')
  await table.put({
    key: addPromptAlias.value,
    value: addPromptValue.value
  })
  addPromptVisible.value = false
  getPromptList()
}

function handlePromptChange(val: string) {
  prompt.value = val
  localStorage.setItem(localStorageKey.defaultPrompt, val)
}

const addWatch = () => {
  watch(
    () => settingForm.value.replyLanguage,
    () => {
      localStorage.setItem('replyLanguage', settingForm.value.replyLanguage)
    }
  )
}

async function initData() {
  insertType.value =
    (localStorage.getItem(localStorageKey.insertType) as insertTypes) ||
    'replace'
  useWordFormatting.value =
    localStorage.getItem(localStorageKey.useWordFormatting) === 'true'
  systemPrompt.value =
    localStorage.getItem(localStorageKey.defaultSystemPrompt) ||
    'Act like a personal assistant.'
  await getSystemPromptList()
  if (systemPromptList.value.find(item => item.value === systemPrompt.value)) {
    systemPromptSelected.value = systemPrompt.value
  }
  prompt.value = localStorage.getItem(localStorageKey.defaultPrompt) || ''
  await getPromptList()
  if (promptList.value.find(item => item.value === prompt.value)) {
    promptSelected.value = prompt.value
  }
}

function handleInsertTypeChange(val: insertTypes) {
  insertType.value = val
  localStorage.setItem(localStorageKey.insertType, val)
}

function handleWordFormattingChange(val: boolean) {
  useWordFormatting.value = val
  localStorage.setItem(localStorageKey.useWordFormatting, String(val))
}

// Helper: Build provider configuration
function buildProviderConfig(settings: any, customMessages?: string): Record<string, any> {
  return {
    official: {
      provider: 'official',
      config: {
        apiKey: settings.officialAPIKey,
        baseURL: settings.officialBasePath,
        dangerouslyAllowBrowser: true
      },
      maxTokens: settings.officialMaxTokens,
      temperature: settings.officialTemperature,
      model: settings.officialCustomModel || settings.officialModelSelect
    },
    groq: {
      provider: 'groq',
      groqAPIKey: settings.groqAPIKey,
      groqModel: settings.groqCustomModel || settings.groqModelSelect,
      maxTokens: settings.groqMaxTokens,
      temperature: settings.groqTemperature
    },
    azure: {
      provider: 'azure',
      azureAPIKey: settings.azureAPIKey,
      azureAPIEndpoint: settings.azureAPIEndpoint,
      azureDeploymentName: settings.azureDeploymentName,
      azureAPIVersion: settings.azureAPIVersion,
      maxTokens: settings.azureMaxTokens,
      temperature: settings.azureTemperature
    },
    gemini: {
      provider: 'gemini',
      geminiAPIKey: settings.geminiAPIKey,
      messages: customMessages,
      maxTokens: settings.geminiMaxTokens,
      temperature: settings.geminiTemperature,
      geminiModel: settings.geminiCustomModel || settings.geminiModelSelect
    },
    ollama: {
      provider: 'ollama',
      ollamaEndpoint: settings.ollamaEndpoint,
      ollamaModel: settings.ollamaCustomModel || settings.ollamaModelSelect,
      temperature: settings.ollamaTemperature
    }
  }
}

// Helper: Handle API response and insert result
async function handleApiResponse() {
  if (errorIssue.value) {
    errorIssue.value = false
    message.error('Something is wrong')
    return false
  }

  if (!jsonIssue.value) {
    if (useWordFormatting.value) {
      insertFormattedResult(result, insertType)
    } else {
      insertResult(result, insertType)
    }
  }
  return true
}

async function template(taskType: keyof typeof buildInPrompt | 'custom') {
  loading.value = true;

  // 1. Extract Selected Text
  const selectedText = await Word.run(async (ctx) => {
    const range = ctx.document.getSelection();
    range.load('text');
    await ctx.sync();
    return range.text;
  });

  const settings = settingForm.value;
  const { replyLanguage: lang, api: provider } = settings;

  // 2. Build Messages
  let systemMessage = '';
  let userMessage = '';

  if (taskType === 'custom') {
    systemMessage = systemPrompt.value.includes('{language}')
      ? systemPrompt.value.replace('{language}', lang)
      : systemPrompt.value;
    userMessage = prompt.value.includes('{text}') 
      ? prompt.value.replace('{text}', selectedText)
      : `Reply in ${lang} ${prompt.value} ${selectedText}`;
  } else {
    systemMessage = buildInPrompt[taskType].system(lang);
    userMessage = buildInPrompt[taskType].user(selectedText, lang);
  }

  // 3. Format History based on Provider requirements
  const historyMap: Record<string, any> = {
    gemini: [
      { role: 'user', parts: [{ text: `${systemMessage}\n${userMessage}` }] },
      { role: 'model', parts: [{ text: 'Hi, what can I help you?' }] }
    ],
    ollama: [{ role: 'user', content: `${systemMessage}\n${userMessage}` }],
    default: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage }
    ]
  };
  historyDialog.value = historyMap[provider] || historyMap.default;

  // Build provider configuration
  const providerConfigs: Record<string, any> = buildProviderConfig(settings, userMessage)
  const currentConfig = providerConfigs[provider]

  if (!currentConfig) {
    message.error('Not supported provider')
    loading.value = false
    return
  }

  try {
    await getChatResponse({
      ...currentConfig,
      messages: provider === 'gemini' ? userMessage : historyDialog.value,
      result,
      historyDialog,
      errorIssue,
      loading
    })
  } catch (error) {
    result.value = String(error)
    errorIssue.value = true
    console.error(error)
  }

  await handleApiResponse()
}

function checkApiKey() {
  const auth = {
    type: settingForm.value.api,
    apiKey: settingForm.value.officialAPIKey,
    azureAPIKey: settingForm.value.azureAPIKey,
    geminiAPIKey: settingForm.value.geminiAPIKey,
    groqAPIKey: settingForm.value.groqAPIKey
  }
  if (!checkAuth(auth)) {
    message.error('Set API Key or Access Token first')
    return false
  }
  return true
}

const actionList = Object.keys(buildInPrompt) as (keyof typeof buildInPrompt)[]

async function performAction(action: keyof typeof buildInPrompt) {
  if (!checkApiKey()) return
  template(action)
}

function settings() {
  router.push('/settings')
}

function StartChat() {
  if (!checkApiKey()) return
  template('custom')
}

async function continueChat() {
  if (!checkApiKey()) return
  loading.value = true

  const settings = settingForm.value
  const provider = settings.api

  // Push continue message based on provider format
  if (provider === 'gemini') {
    historyDialog.value.push(
      { role: 'user', parts: [{ text: 'continue' }] },
      { role: 'model', parts: [{ text: 'OK, I will continue to help you.' }] }
    )
  } else {
    historyDialog.value.push({ role: 'user', content: 'continue' })
  }

  // Build provider configuration
  const providerConfigs: Record<string, any> = buildProviderConfig(settings, 'continue')
  const config = providerConfigs[provider]

  if (!config) {
    message.error('Not supported provider')
    loading.value = false
    return
  }

  try {
    await getChatResponse({
      ...config,
      messages: provider === 'gemini' ? 'continue' : historyDialog.value,
      result,
      historyDialog,
      errorIssue,
      loading
    })
  } catch (error) {
    result.value = String(error)
    errorIssue.value = true
    console.error(error)
  }

  await handleApiResponse()
}

onBeforeMount(() => {
  addWatch()
  initData()
})
</script>

<style scoped src="./HomePage.css"></style>
