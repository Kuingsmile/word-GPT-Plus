<template>
  <div class="homepage">
    <!-- Header with branding -->
    <div class="header">
      <div class="brand">
        <Zap class="brand-icon" />
        <h1 class="brand-title">Word GPT+</h1>
      </div>
      <button 
        class="settings-btn"
        @click="settings"
        :disabled="loading"
      >
        <Settings class="icon" />
      </button>
    </div>

    <!-- Main Actions -->
    <div class="main-actions">
      <button 
        class="primary-btn"
        @click="StartChat"
        :disabled="loading"
      >
        <Play class="icon" />
        {{ $t('start') }}
      </button>
      <button 
        v-if="['azure', 'official', 'gemini', 'ollama', 'groq', 'agent'].includes(settingForm.api)"
        class="secondary-btn"
        @click="continueChat"
        :disabled="loading"
      >
        <ArrowRight class="icon" />
        {{ $t('continue') }}
      </button>
    </div>

    <!-- Progress Indicator -->
    <div v-if="loading" class="progress-section">
      <div class="progress-indicator">
        <Loader2 class="spinning-icon" />
        <span class="progress-text">AI is processing...</span>
      </div>
    </div>

    <!-- Quick Settings - Always visible -->
    <div class="section">
      <div class="section-header">
        <Sliders class="section-icon" />
        <h2 class="section-title">Quick Settings</h2>
      </div>
      <div class="settings-grid">
        <div class="settings-row">
          <div class="setting-item">
            <label class="setting-label">{{ $t('apiLabel') }}</label>
            <div class="select-wrapper">
              <select v-model="settingForm.api" class="select-input">
                <option v-for="item in settingPreset.api.optionList" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
              <ChevronDown class="select-icon" />
            </div>
          </div>
          <div class="setting-item">
            <label class="setting-label">{{ $t('modelLabel') }}</label>
            <div class="select-wrapper">
              <select v-model="currentModelSelect" class="select-input" :disabled="!currentModelOptions || currentModelOptions.length === 0">
                <option v-for="item in currentModelOptions" :key="item.value" :value="item.value">
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
              <select v-model="insertType" class="select-input" @change="(e) => handleInsertTypeChange((e.target as HTMLSelectElement)?.value as insertTypes)">
                <option v-for="item in insertTypeList" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
              <ChevronDown class="select-icon" />
            </div>
          </div>
          <div class="setting-item">
            <label class="setting-label">{{ $t('useWordFormattingLabel') }}</label>
            <div class="toggle-wrapper">
              <input type="checkbox" v-model="useWordFormatting" class="toggle-input" @change="(e) => handleWordFormattingChange((e.target as HTMLInputElement)?.checked ?? false)" />
              <div class="toggle-slider"></div>
            </div>
          </div>
        </div>
        <div class="setting-item">
          <label class="setting-label">{{ $t('replyLanguageLabel') }}</label>
          <div class="select-wrapper">
            <select v-model="settingForm.replyLanguage" class="select-input">
              <option v-for="item in settingPreset.replyLanguage.optionList" :key="item.value" :value="item.value">
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
      <div class="collapsible-header" @click="aiToolsExpanded = !aiToolsExpanded">
        <div class="collapsible-title">
          <Sparkles class="collapsible-icon" />
          {{ $t('aiTools') }}
        </div>
        <ChevronDown class="collapse-icon" :class="{ expanded: aiToolsExpanded }" />
      </div>
      <div class="collapsible-content" :class="{ expanded: aiToolsExpanded }">
        <div class="action-grid">
          <button 
            v-for="item in actionList"
            :key="item"
            class="action-btn"
            @click="performAction(item)"
            :disabled="loading"
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
        <h2 class="section-title">{{ $t('result') }}</h2>
      </div>
      <textarea 
        v-model="result"
        class="result-textarea"
        :placeholder="$t('result')"
        rows="3"
      ></textarea>
    </div>

    <!-- Prompts - Collapsible -->
    <div class="collapsible-section">
      <div class="collapsible-header" @click="promptsExpanded = !promptsExpanded">
        <div class="collapsible-title">
          <MessageSquare class="collapsible-icon" />
          {{ $t('prompts') }}
        </div>
        <ChevronDown class="collapse-icon" :class="{ expanded: promptsExpanded }" />
      </div>
      <div class="collapsible-content" :class="{ expanded: promptsExpanded }">
        <!-- System Prompt -->
        <div class="prompt-section">
          <div class="prompt-header">
            <label class="prompt-label">{{ $t('homeSystem') }}</label>
            <div class="prompt-actions">
              <button class="icon-btn add-btn" @click="addSystemPromptVisible = true">
                <Plus class="small-icon" />
              </button>
              <button class="icon-btn remove-btn" @click="removeSystemPromptVisible = true">
                <Minus class="small-icon" />
              </button>
            </div>
          </div>
          <div class="select-wrapper">
            <select v-model="systemPromptSelected" class="select-input" @change="(e) => handleSystemPromptChange((e.target as HTMLSelectElement)?.value ?? '')">
              <option value="" disabled>{{ $t('homeSystemDescription') }}</option>
              <option v-for="item in systemPromptList" :key="item.value" :value="item.value">
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
          ></textarea>
        </div>

        <!-- User Prompt -->
        <div class="prompt-section">
          <div class="prompt-header">
            <label class="prompt-label">{{ $t('homePrompt') }}</label>
            <div class="prompt-actions">
              <button class="icon-btn add-btn" @click="addPromptVisible = true">
                <Plus class="small-icon" />
              </button>
              <button class="icon-btn remove-btn" @click="removePromptVisible = true">
                <Minus class="small-icon" />
              </button>
            </div>
          </div>
          <div class="select-wrapper">
            <select v-model="promptSelected" class="select-input" @change="(e) => handlePromptChange((e.target as HTMLSelectElement)?.value ?? '')">
              <option value="" disabled>{{ $t('homePromptDescription') }}</option>
              <option v-for="item in promptList" :key="item.value" :value="item.value">
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
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Dialogs -->
    <HomePageAddDialog
      v-model:addVisible="addSystemPromptVisible"
      v-model:addAlias="addSystemPromptAlias"
      v-model:addValue="addSystemPromptValue"
      title="addSystemPrompt"
      alias-label="addSystemPromptAlias"
      alias-placeholder="addSystemPromptAliasDescription"
      prompt-label="homeSystem"
      prompt-placeholder="addSystemPromptDescription"
      @add="addSystemPrompt"
    />
    <HomePageAddDialog
      v-model:addVisible="addPromptVisible"
      v-model:addAlias="addPromptAlias"
      v-model:addValue="addPromptValue"
      title="addPrompt"
      alias-label="addPromptAlias"
      alias-placeholder="addPromptAliasDescription"
      prompt-label="homePrompt"
      prompt-placeholder="homePromptDescription"
      @add="addPrompt"
    />
    <HomePageDialog
      v-model:removeVisible="removeSystemPromptVisible"
      v-model:removeValue="removeSystemPromptValue"
      title="removeSystemPrompt"
      :option-list="systemPromptList"
      @remove="removeSystemPrompt"
    />
    <HomePageDialog
      v-model:removeVisible="removePromptVisible"
      v-model:removeValue="removePromptValue"
      title="removePrompt"
      :option-list="promptList"
      @remove="removePrompt"
    />
  </div>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus'
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

import API from '@/api'

import { buildInPrompt } from '@/utils/constant'
import { promptDbInstance } from '@/store/promtStore'

import { checkAuth } from '@/utils/common'
import { localStorageKey } from '@/utils/enum'
import useSettingForm from '@/utils/settingForm'
import { settingPreset } from '@/utils/settingPreset'

import HomePageDialog from '@/components/HomePageDialog.vue'
import HomePageAddDialog from '@/components/HomePageAddDialog.vue'

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

async function template(taskType: keyof typeof buildInPrompt | 'custom') {
  loading.value = true
  let systemMessage
  let userMessage = ''
  const getSeletedText = async () => {
    return Word.run(async context => {
      const range = context.document.getSelection()
      range.load('text')
      await context.sync()
      return range.text
    })
  }
  const selectedText = await getSeletedText()
  if (taskType === 'custom') {
    if (systemPrompt.value.includes('{language}')) {
      systemMessage = systemPrompt.value.replace(
        '{language}',
        settingForm.value.replyLanguage
      )
    } else {
      systemMessage = systemPrompt.value
    }
    if (userMessage.includes('{text}')) {
      userMessage = userMessage.replace('{text}', selectedText)
    } else {
      userMessage = `Reply in ${settingForm.value.replyLanguage} ${prompt.value} ${selectedText}`
    }
  } else {
    systemMessage = buildInPrompt[taskType].system(
      settingForm.value.replyLanguage
    )
    userMessage = buildInPrompt[taskType].user(
      selectedText,
      settingForm.value.replyLanguage
    )
  }
  if (
    settingForm.value.api === 'official' &&
    settingForm.value.officialAPIKey
  ) {
    const config = API.official.setConfig(
      settingForm.value.officialAPIKey,
      settingForm.value.officialBasePath
    )
    historyDialog.value = [
      {
        role: 'system',
        content: systemMessage
      },
      {
        role: 'user',
        content: userMessage
      }
    ]
    await API.official.createChatCompletionStream({
      config,
      messages: historyDialog.value,
      result,
      historyDialog,
      errorIssue,
      loading,
      maxTokens: settingForm.value.officialMaxTokens,
      temperature: settingForm.value.officialTemperature,
      model:
        settingForm.value.officialCustomModel ||
        settingForm.value.officialModelSelect
    })
  } else if (settingForm.value.api === 'groq' && settingForm.value.groqAPIKey) {
    historyDialog.value = [
      {
        role: 'system',
        content: systemMessage
      },
      {
        role: 'user',
        content: userMessage
      }
    ]
    await API.groq.createChatCompletionStream({
      groqAPIKey: settingForm.value.groqAPIKey,
      groqModel:
        settingForm.value.groqCustomModel || settingForm.value.groqModelSelect,
      messages: historyDialog.value,
      result,
      historyDialog,
      errorIssue,
      loading,
      maxTokens: settingForm.value.officialMaxTokens,
      temperature: settingForm.value.officialTemperature
    })
  } else if (
    settingForm.value.api === 'azure' &&
    settingForm.value.azureAPIKey
  ) {
    historyDialog.value = [
      {
        role: 'system',
        content: systemMessage
      },
      {
        role: 'user',
        content: userMessage
      }
    ]
    await API.azure.createChatCompletionStream({
      azureAPIKey: settingForm.value.azureAPIKey,
      azureAPIEndpoint: settingForm.value.azureAPIEndpoint,
      azureDeploymentName: settingForm.value.azureDeploymentName,
      azureAPIVersion: settingForm.value.azureAPIVersion,
      messages: historyDialog.value,
      result,
      historyDialog,
      errorIssue,
      loading,
      maxTokens: settingForm.value.azureMaxTokens,
      temperature: settingForm.value.azureTemperature
    })
  } else if (
    settingForm.value.api === 'gemini' &&
    settingForm.value.geminiAPIKey
  ) {
    historyDialog.value = [
      {
        role: 'user',
        parts: [
          {
            text: systemMessage + '\n' + userMessage
          }
        ]
      },
      {
        role: 'model',
        parts: [
          {
            text: 'Hi, what can I help you?'
          }
        ]
      }
    ]
    await API.gemini.createChatCompletionStream({
      geminiAPIKey: settingForm.value.geminiAPIKey,
      messages: userMessage,
      result,
      historyDialog,
      errorIssue,
      loading,
      maxTokens: settingForm.value.geminiMaxTokens,
      temperature: settingForm.value.geminiTemperature,
      geminiModel:
        settingForm.value.geminiCustomModel ||
        settingForm.value.geminiModelSelect
    })
  } else if (
    settingForm.value.api === 'ollama' &&
    settingForm.value.ollamaEndpoint
  ) {
    historyDialog.value = [
      {
        role: 'user',
        content: systemMessage + '\n' + userMessage
      }
    ]
    await API.ollama.createChatCompletionStream({
      ollamaEndpoint: settingForm.value.ollamaEndpoint,
      ollamaModel:
        settingForm.value.ollamaCustomModel ||
        settingForm.value.ollamaModelSelect,
      messages: historyDialog.value,
      result,
      historyDialog,
      errorIssue,
      loading,
      temperature: settingForm.value.ollamaTemperature
    })
  } else if (settingForm.value.api === 'agent') {
    historyDialog.value = [
      {
        role: 'system',
        content: systemMessage
      },
      {
        role: 'user',
        content: userMessage
      }
    ]
    await API.agent.createChatCompletionStream({
      agentMode: settingForm.value.agentMode,
      agentMaxSteps: settingForm.value.agentMaxSteps,
      agentThinkingDepth: settingForm.value.agentThinkingDepth,
      agentAutoExecute: settingForm.value.agentAutoExecute === 'true',
      agentBaseModeAPI: settingForm.value.agentBaseModeAPI,
      // Pass API credentials based on base mode
      apiKey: settingForm.value.officialAPIKey,
      azureAPIKey: settingForm.value.azureAPIKey,
      azureAPIEndpoint: settingForm.value.azureAPIEndpoint,
      azureDeploymentName: settingForm.value.azureDeploymentName,
      azureAPIVersion: settingForm.value.azureAPIVersion,
      geminiAPIKey: settingForm.value.geminiAPIKey,
      geminiModel: settingForm.value.geminiCustomModel || settingForm.value.geminiModelSelect,
      groqAPIKey: settingForm.value.groqAPIKey,
      groqModel: settingForm.value.groqCustomModel || settingForm.value.groqModelSelect,
      ollamaEndpoint: settingForm.value.ollamaEndpoint,
      ollamaModel: settingForm.value.ollamaCustomModel || settingForm.value.ollamaModelSelect,
      officialModel: settingForm.value.officialCustomModel || settingForm.value.officialModelSelect,
      officialBasePath: settingForm.value.officialBasePath,
      messages: historyDialog.value,
      result,
      historyDialog,
      errorIssue,
      loading,
      maxTokens: settingForm.value.officialMaxTokens,
      temperature: settingForm.value.officialTemperature
    })
  } else {
    ElMessage.error('Set API Key or Access Token first')
    return
  }
  if (errorIssue.value === true) {
    errorIssue.value = false
    ElMessage.error('Something is wrong')
    return
  }
  if (!jsonIssue.value) {
    if (useWordFormatting.value) {
      API.common.insertFormattedResult(result, insertType)
    } else {
      API.common.insertResult(result, insertType)
    }
  }
}

function checkApiKey() {
  const auth = {
    type: settingForm.value.api,
    apiKey: settingForm.value.officialAPIKey,
    azureAPIKey: settingForm.value.azureAPIKey,
    geminiAPIKey: settingForm.value.geminiAPIKey,
    groqAPIKey: settingForm.value.groqAPIKey,
    agentBaseModeAPI: settingForm.value.agentBaseModeAPI
  }
  if (!checkAuth(auth)) {
    ElMessage.error('Set API Key or Access Token first')
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
  try {
    switch (settingForm.value.api) {
      case 'official':
        historyDialog.value.push({
          role: 'user',
          content: 'continue'
        })

        await API.official.createChatCompletionStream({
          config: API.official.setConfig(
            settingForm.value.officialAPIKey,
            settingForm.value.officialBasePath
          ),
          messages: historyDialog.value,
          result,
          historyDialog,
          errorIssue,
          loading,
          maxTokens: settingForm.value.officialMaxTokens,
          temperature: settingForm.value.officialTemperature,
          model:
            settingForm.value.officialCustomModel ||
            settingForm.value.officialModelSelect
        })
        break
      case 'groq':
        historyDialog.value.push({
          role: 'user',
          content: 'continue'
        })
        await API.groq.createChatCompletionStream({
          groqAPIKey: settingForm.value.groqAPIKey,
          groqModel:
            settingForm.value.groqCustomModel ||
            settingForm.value.groqModelSelect,
          messages: historyDialog.value,
          result,
          historyDialog,
          errorIssue,
          loading,
          maxTokens: settingForm.value.officialMaxTokens,
          temperature: settingForm.value.officialTemperature
        })
        break
      case 'azure':
        historyDialog.value.push({
          role: 'user',
          content: 'continue'
        })
        await API.azure.createChatCompletionStream({
          azureAPIKey: settingForm.value.azureAPIKey,
          azureAPIEndpoint: settingForm.value.azureAPIEndpoint,
          azureDeploymentName: settingForm.value.azureDeploymentName,
          azureAPIVersion: settingForm.value.azureAPIVersion,
          messages: historyDialog.value,
          result,
          historyDialog,
          errorIssue,
          loading,
          maxTokens: settingForm.value.azureMaxTokens,
          temperature: settingForm.value.azureTemperature
        })
        break
      case 'gemini':
        historyDialog.value.push(
          ...[
            {
              role: 'user',
              parts: [
                {
                  text: 'continue'
                }
              ]
            },
            {
              role: 'model',
              parts: [
                {
                  text: 'OK, I will continue to help you.'
                }
              ]
            }
          ]
        )
        await API.gemini.createChatCompletionStream({
          geminiAPIKey: settingForm.value.geminiAPIKey,
          messages: 'continue',
          result,
          historyDialog,
          errorIssue,
          loading,
          maxTokens: settingForm.value.geminiMaxTokens,
          temperature: settingForm.value.geminiTemperature,
          geminiModel:
            settingForm.value.geminiCustomModel ||
            settingForm.value.geminiModelSelect
        })
        break
      case 'ollama':
        historyDialog.value.push({
          role: 'user',
          content: 'continue'
        })
        await API.ollama.createChatCompletionStream({
          ollamaEndpoint: settingForm.value.ollamaEndpoint,
          ollamaModel:
            settingForm.value.ollamaCustomModel ||
            settingForm.value.ollamaModelSelect,
          messages: historyDialog.value,
          result,
          historyDialog,
          errorIssue,
          loading,
          temperature: settingForm.value.ollamaTemperature
        })
        break
      case 'agent':
        historyDialog.value.push({
          role: 'user',
          content: 'continue'
        })
        await API.agent.createChatCompletionStream({
          agentMode: settingForm.value.agentMode,
          agentMaxSteps: settingForm.value.agentMaxSteps,
          agentThinkingDepth: settingForm.value.agentThinkingDepth,
          agentAutoExecute: settingForm.value.agentAutoExecute === 'true',
          agentBaseModeAPI: settingForm.value.agentBaseModeAPI,
          // Pass API credentials based on base mode
          apiKey: settingForm.value.officialAPIKey,
          azureAPIKey: settingForm.value.azureAPIKey,
          azureAPIEndpoint: settingForm.value.azureAPIEndpoint,
          azureDeploymentName: settingForm.value.azureDeploymentName,
          azureAPIVersion: settingForm.value.azureAPIVersion,
          geminiAPIKey: settingForm.value.geminiAPIKey,
          geminiModel: settingForm.value.geminiCustomModel || settingForm.value.geminiModelSelect,
          groqAPIKey: settingForm.value.groqAPIKey,
          groqModel: settingForm.value.groqCustomModel || settingForm.value.groqModelSelect,
          ollamaEndpoint: settingForm.value.ollamaEndpoint,
          ollamaModel: settingForm.value.ollamaCustomModel || settingForm.value.ollamaModelSelect,
          officialModel: settingForm.value.officialCustomModel || settingForm.value.officialModelSelect,
          officialBasePath: settingForm.value.officialBasePath,
          messages: historyDialog.value,
          result,
          historyDialog,
          errorIssue,
          loading,
          maxTokens: settingForm.value.officialMaxTokens,
          temperature: settingForm.value.officialTemperature
        })
        break
    }
  } catch (error) {
    result.value = String(error)
    errorIssue.value = true
    console.error(error)
  }
  if (errorIssue.value === true) {
    errorIssue.value = false
    ElMessage.error('Something is wrong')
    return
  }
  if (useWordFormatting.value) {
    API.common.insertFormattedResult(result, insertType)
  } else {
    API.common.insertResult(result, insertType)
  }
}

onBeforeMount(() => {
  addWatch()
  initData()
})
</script>

<style scoped src="./HomePage.css"></style>


