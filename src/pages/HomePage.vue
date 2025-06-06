<template>
  <div class="homepage">
    <div class="header-section"></div>

    <div class="main-content">
      <div class="left-column">
        <el-card class="quick-settings-card" shadow="hover">
          <template #header>
            <h3 class="compact-title">
              <el-icon><Setting /></el-icon>
              {{ $t('quickSettings') }}
            </h3>
          </template>

          <div class="compact-options-grid">
            <div class="option-row">
              <div class="option-group">
                <label class="compact-label">{{
                  $t('replyLanguageLabel')
                }}</label>
                <el-select
                  v-model="settingForm.replyLanguage"
                  class="compact-select"
                  size="small"
                  :placeholder="$t('replyLanguagePlaceholder')"
                >
                  <el-option
                    v-for="item in settingPreset.replyLanguage.optionList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
              <div class="option-group">
                <label class="compact-label">
                  {{ $t('modelLabel') }}
                </label>
                <el-select
                  v-model="currentModelSelect"
                  class="compact-select"
                  size="small"
                  :placeholder="currentModelPlaceholder"
                  :disabled="
                    !currentModelOptions || currentModelOptions.length === 0
                  "
                >
                  <el-option
                    v-for="item in currentModelOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
            </div>
            <!-- Row 2 -->
            <div class="option-row">
              <div class="option-group">
                <label class="compact-label">
                  {{ $t('apiLabel') }}
                </label>
                <el-select
                  v-model="settingForm.api"
                  class="compact-select"
                  size="small"
                  :placeholder="$t('apiPlaceholder')"
                >
                  <el-option
                    v-for="item in settingPreset.api.optionList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
              <div class="option-group">
                <label class="compact-label">
                  {{ $t('insertTypeLabel') }}
                </label>
                <el-select
                  v-model="insertType"
                  class="compact-select"
                  size="small"
                  :placeholder="$t('insertTypePlaceholder')"
                  @change="handleInsertTypeChange"
                >
                  <el-option
                    v-for="item in insertTypeList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
            </div>
          </div>
        </el-card>
        <!-- AI Tools -->
        <el-card class="tools-card" shadow="hover">
          <template #header>
            <h3 class="compact-title">
              <el-icon><MagicStick /></el-icon>
              {{ $t('aiTools') }}
            </h3>
          </template>
          <div class="compact-actions-grid">
            <el-button
              v-for="item in actionList"
              :key="item"
              class="mini-action-btn"
              type="primary"
              size="small"
              :disabled="loading"
              @click="performAction(item)"
            >
              <span class="mini-text">{{ $t(item) }}</span>
            </el-button>
            <el-button
              class="mini-action-btn settings-action-btn"
              size="small"
              :disabled="loading"
              @click="settings"
            >
              <span class="mini-text">{{ $t('settings') }}</span>
            </el-button>
          </div>
          <div class="main-actions">
            <div class="button-row">
              <el-button
                class="primary-action-btn"
                type="success"
                size="small"
                :disabled="loading"
                @click="StartChat"
              >
                <el-icon><VideoPlay /></el-icon>
                {{ $t('start') }}
              </el-button>
              <el-button
                v-if="
                  ['azure', 'official', 'gemini', 'ollama', 'groq'].includes(
                    settingForm.api
                  )
                "
                class="secondary-action-btn"
                type="warning"
                size="small"
                :disabled="loading"
                @click="continueChat"
              >
                <el-icon><Right /></el-icon>
                {{ $t('continue') }}
              </el-button>
            </div>
          </div>
          <div v-if="loading" class="progress-container">
            <div class="progress-wrapper">
              <div class="progress-icon">
                <el-icon class="spinning"><Loading /></el-icon>
              </div>
              <div class="progress-content">
                <el-progress
                  :percentage="50"
                  indeterminate
                  :duration="3"
                  status="success"
                  stroke-width="3"
                />
                <p class="progress-text">AI is processing your request...</p>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <div class="right-column">
        <el-card class="config-card" shadow="hover">
          <template #header>
            <h3 class="compact-title">
              <el-icon><Setting /></el-icon>
              {{ $t('prompts') }}
            </h3>
          </template>

          <div class="config-section">
            <div class="section-header">
              <label class="section-label">{{ $t('homeSystem') }}</label>
              <div class="action-buttons">
                <el-button
                  size="small"
                  type="primary"
                  circle
                  @click="addSystemPromptVisible = true"
                >
                  <el-icon><Plus /></el-icon>
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  circle
                  @click="removeSystemPromptVisible = true"
                >
                  <el-icon><Minus /></el-icon>
                </el-button>
              </div>
            </div>
            <el-select
              v-model="systemPromptSelected"
              class="config-select"
              size="small"
              :placeholder="$t('homeSystemDescription')"
              @change="handleSystemPromptChange"
            >
              <el-option
                v-for="item in systemPromptList"
                :key="item.value"
                :label="item.key"
                :value="item.value"
              />
            </el-select>
            <el-input
              v-model="systemPrompt"
              class="config-input"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              :placeholder="$t('homeSystemDescription')"
              @blur="handleSystemPromptChange(systemPrompt)"
            />
          </div>

          <div class="config-section">
            <div class="section-header">
              <label class="section-label">{{ $t('homePrompt') }}</label>
              <div class="action-buttons">
                <el-button
                  size="small"
                  type="primary"
                  circle
                  @click="addPromptVisible = true"
                >
                  <el-icon><Plus /></el-icon>
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  circle
                  @click="removePromptVisible = true"
                >
                  <el-icon><Minus /></el-icon>
                </el-button>
              </div>
            </div>
            <el-select
              v-model="promptSelected"
              class="config-select"
              size="small"
              :placeholder="$t('homePromptDescription')"
              @change="handlePromptChange"
            >
              <el-option
                v-for="item in promptList"
                :key="item.value"
                :label="item.key"
                :value="item.value"
              />
            </el-select>
            <el-input
              v-model="prompt"
              class="config-input"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              :placeholder="$t('homePromptDescription')"
              @blur="handlePromptChange(prompt)"
            />
          </div>
        </el-card>

        <el-card class="results-card" shadow="hover">
          <template #header>
            <h3 class="compact-title">
              <el-icon><Document /></el-icon>
              {{ $t('result') }}
            </h3>
          </template>
          <el-input
            v-model="result"
            class="result-textarea"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 8 }"
            :placeholder="$t('result')"
            resize="vertical"
          />
        </el-card>
      </div>
    </div>
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
  Setting,
  MagicStick,
  Document,
  VideoPlay,
  Right,
  Loading
} from '@element-plus/icons-vue'
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

const currentModelPlaceholder = computed(() => {
  switch (settingForm.value.api) {
    case 'official':
      return t('officialModelSelectPlaceholder')
    case 'gemini':
      return t('geminiModelSelectPlaceholder')
    case 'ollama':
      return t('ollamaModelSelectPlaceholder')
    case 'groq':
      return t('groqModelSelectPlaceholder')
    case 'azure':
      return t('azureDeploymentNamePlaceholder')
    default:
      return 'Please select model'
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
    API.common.insertResult(result, insertType)
  }
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
  API.common.insertResult(result, insertType)
}

onBeforeMount(() => {
  addWatch()
  initData()
})
</script>

<style scoped>
.homepage {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Modern Header Section */
.header-section {
  margin-bottom: 12px;
  padding: 4px;
  background: transparent;
}

/* Card Header with Action */
.card-header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.settings-btn {
  color: #606266;
  transition: all 0.3s ease;
  border: none;
  background: transparent;
  padding: 6px;
  border-radius: 6px;
  flex-shrink: 0;
}

.settings-btn:hover {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
  transform: scale(1.1);
}

/* Main Content Grid */
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

/* Compact Card Styles */
.quick-settings-card,
.tools-card,
.config-card,
.results-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
}

.quick-settings-card:hover,
.tools-card:hover,
.config-card:hover,
.results-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.06);
  border-color: rgba(0, 0, 0, 0.1);
}

.quick-settings-card:deep(.el-card__body),
.config-card:deep(.el-card__body),
.results-card:deep(.el-card__body) {
  padding: 16px;
}

.quick-settings-card:deep(.el-card__header),
.config-card:deep(.el-card__header),
.results-card:deep(.el-card__header) {
  padding: 12px 16px;
  background: rgba(248, 249, 250, 0.8);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px 16px 0 0;
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

/* Quick Settings - Optimized 2x2 Grid */
.compact-options-grid {
  display: grid;
  grid-template-rows: repeat(2, auto);
  gap: 16px;
  width: 100%;
}

.option-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: end;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
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

/* AI Tools - Modern Light Styling */
.tools-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid rgba(0, 123, 255, 0.1) !important;
  color: #1d1d1f;
  box-shadow:
    0 2px 8px rgba(0, 123, 255, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tools-card:hover {
  box-shadow:
    0 4px 16px rgba(0, 123, 255, 0.12),
    0 2px 6px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
  border-color: rgba(0, 123, 255, 0.2) !important;
}

.tools-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 123, 255, 0.02) 0%,
    transparent 50%
  );
  pointer-events: none;
}

.tools-card:deep(.el-card__header) {
  background: linear-gradient(
    135deg,
    rgba(0, 123, 255, 0.03) 0%,
    rgba(248, 249, 250, 0.8) 100%
  );
  border-bottom: 1px solid rgba(0, 123, 255, 0.1);
  backdrop-filter: blur(20px);
  position: relative;
  z-index: 1;
  padding: 12px 16px;
  border-radius: 16px 16px 0 0;
}

.tools-card:deep(.el-card__body) {
  padding: 16px;
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.tools-card .compact-title {
  color: #1d1d1f;
  font-weight: 600;
  text-shadow: none;
}

.compact-actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
  align-items: stretch;
}

.mini-action-btn {
  height: 44px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid rgba(0, 123, 255, 0.15);
  padding: 8px 6px;
  position: relative;
  overflow: hidden;
  min-width: 0;
  text-align: center;
  color: #1d1d1f;
  box-shadow:
    0 2px 4px rgba(0, 123, 255, 0.08),
    0 1px 2px rgba(0, 0, 0, 0.06);
}

.mini-action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 123, 255, 0.1),
    transparent
  );
  transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.mini-action-btn:hover::before {
  left: 100%;
}

.mini-action-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 12px rgba(0, 123, 255, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-color: rgba(0, 123, 255, 0.25);
}

.mini-action-btn:active {
  transform: translateY(0);
}

.mini-action-btn:disabled {
  opacity: 0.5;
  transform: none;
  box-shadow:
    0 2px 4px rgba(0, 123, 255, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.03);
}

.mini-action-btn:disabled::before {
  display: none;
}

.settings-action-btn {
  background: linear-gradient(135deg, #71adec 0%, #9ad9f7 100%);
  color: white;
  border-color: rgba(0, 122, 255, 0.3);
}

.settings-action-btn:hover {
  background: linear-gradient(135deg, #0056cc 0%, #32ade6 100%);
  color: white;
}

.settings-action-btn .mini-icon,
.settings-action-btn .mini-text {
  color: white;
}

.mini-action-btn:disabled::before {
  display: none;
}

.mini-icon {
  font-size: 16px;
  color: #1d1d1f;
  flex-shrink: 0;
}

.mini-text {
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: none;
  text-align: center;
  line-height: 1.2;
  color: #1d1d1f;
  font-weight: 600;
}

/* Main Actions */
.main-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.button-row {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: stretch;
}

.primary-action-btn,
.secondary-action-btn {
  height: 38px;
  border-radius: 19px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 123, 255, 0.2);
  backdrop-filter: blur(20px);
  flex: 1;
  min-width: 0;
  white-space: nowrap;
}

.primary-action-btn::before,
.secondary-action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.primary-action-btn:hover::before,
.secondary-action-btn:hover::before {
  left: 100%;
}

.primary-action-btn {
  background: linear-gradient(135deg, #007aff 0%, #5ac8fa 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.25);
}

.primary-action-btn:hover {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.35);
  border-color: rgba(0, 122, 255, 0.4);
}

.secondary-action-btn {
  background: linear-gradient(135deg, #34c759 0%, #30d158 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(52, 199, 89, 0.25);
}

.secondary-action-btn:hover {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 4px 12px rgba(52, 199, 89, 0.35);
  border-color: rgba(52, 199, 89, 0.4);
}

.primary-action-btn:active,
.secondary-action-btn:active {
  transform: translateY(0);
}

.primary-action-btn:disabled,
.secondary-action-btn:disabled {
  opacity: 0.5;
  transform: none;
  box-shadow: none;
}

.primary-action-btn:disabled::before,
.secondary-action-btn:disabled::before {
  display: none;
}

/* Progress */
.progress-container {
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  border: 1px solid rgba(0, 123, 255, 0.1);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
}

.progress-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 123, 255, 0.02) 0%,
    transparent 50%
  );
  pointer-events: none;
}

.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.progress-icon {
  flex-shrink: 0;
}

.spinning {
  animation: spin 1.5s linear infinite;
  color: #007aff;
  font-size: 18px;
  filter: drop-shadow(0 0 4px rgba(0, 122, 255, 0.3));
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.progress-content {
  flex: 1;
}

.progress-text {
  margin: 8px 0 0 0;
  font-size: 13px;
  color: #1d1d1f;
  font-weight: 500;
  letter-spacing: 0.2px;
}

/* Configuration */
.config-section {
  margin-bottom: 16px;
}

.config-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-label {
  font-size: 12px;
  font-weight: 500;
  color: #606266;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.config-input,
.config-select {
  width: 100%;
  margin-bottom: 6px;
}

.config-input:deep(.el-input__wrapper),
.config-input:deep(.el-textarea__inner) {
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
  font-size: 12px;
}

.config-input:deep(.el-input__wrapper:hover),
.config-input:deep(.el-textarea__inner:hover) {
  border-color: #409eff;
}

.config-select:deep(.el-select__wrapper) {
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
  min-height: 28px;
}

.config-select:deep(.el-select__wrapper:hover) {
  border-color: #409eff;
}

/* Results */
.result-textarea {
  width: 100%;
}

.result-textarea:deep(.el-textarea__inner) {
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  transition: all 0.3s ease;
}

.result-textarea:deep(.el-textarea__inner:hover) {
  border-color: #409eff;
}

.result-textarea:deep(.el-textarea__inner:focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .homepage {
    padding: 8px;
  }

  .main-content {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .app-title {
    font-size: 18px;
  }

  .compact-actions {
    grid-template-columns: 1fr;
  }

  .main-actions {
    gap: 8px;
  }

  .option-row {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .option-group {
    width: 100%;
  }

  .compact-options-grid {
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .header-section {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }

  .app-subtitle {
    margin-left: 0;
  }

  .main-actions {
    flex-direction: column;
    gap: 8px;
  }

  .primary-action-btn,
  .secondary-action-btn {
    height: 42px;
    font-size: 14px;
    gap: 8px;
  }

  .el-select-dropdown__item {
    text-align: center;
  }
}
</style>
