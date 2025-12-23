<template>
  <div class="copilot-chat">
    <!-- Header -->
    <div class="chat-header">
      <div class="header-left">
        <Sparkles :size="18" />
        <span class="app-title">Word GPT+</span>
      </div>
      <div class="header-right">
        <button
          class="new-chat-btn"
          :title="$t('newChat')"
          @click="startNewChat"
        >
          <Plus :size="18" />
        </button>
        <button
          class="settings-icon-btn"
          :title="$t('settings')"
          @click="settings"
        >
          <Settings :size="18" />
        </button>
      </div>
    </div>

    <!-- Quick Actions Bar -->
    <div class="quick-actions">
      <button
        v-for="action in quickActions"
        :key="action.key"
        class="quick-action-btn"
        :title="action.label"
        :disabled="loading"
        @click="applyQuickAction(action.key)"
      >
        <component
          :is="action.icon"
          :size="16"
        />
      </button>
    </div>

    <!-- Chat Messages Container -->
    <div
      ref="messagesContainer"
      class="chat-messages"
    >
      <div
        v-if="history.length === 0"
        class="empty-state"
      >
        <Sparkles :size="32" />
        <p class="empty-title">
          {{ $t('emptyTitle') }}
        </p>
        <p class="empty-subtitle">
          {{ $t('emptySubtitle') }}
        </p>
      </div>

      <div
        v-for="(msg, index) in history"
        :key="msg.id || index"
        class="message"
        :class="msg instanceof AIMessage ? 'assistant' : 'user'"
      >
        <div class="message-content">
          <div class="message-text">
            {{ msg.content }}
          </div>
          <div
            v-if="msg instanceof AIMessage"
            class="message-actions"
          >
            <button
              class="action-icon"
              :title="$t('replaceSelectedText')"
              @click="insertToDocument(msg.text, 'replace')"
            >
              <FileText :size="12" />
            </button>
            <button
              class="action-icon"
              :title="$t('appendToSelection')"
              @click="insertToDocument(msg.text, 'append')"
            >
              <Plus :size="12" />
            </button>
            <button
              class="action-icon"
              :title="$t('copyToClipboard')"
              @click="copyToClipboard(msg.text)"
            >
              <Copy :size="12" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="chat-input-container">
      <div class="input-controls">
        <div class="mode-selector">
          <button
            class="mode-btn"
            :class="{ active: mode === 'ask' }"
            title="Ask Mode"
            @click="mode = 'ask'"
          >
            <MessageSquare :size="14" />
          </button>
          <button
            class="mode-btn"
            :class="{ active: mode === 'agent' }"
            title="Agent Mode"
            @click="mode = 'agent'"
          >
            <Zap :size="14" />
          </button>
        </div>
        <div class="model-controls">
          <select
            v-model="settingForm.api"
            class="compact-select"
          >
            <option
              v-for="item in settingPreset.api.optionList"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </option>
          </select>
          <select
            v-model="currentModelSelect"
            class="compact-select"
            :disabled="!currentModelOptions || currentModelOptions.length === 0"
          >
            <option
              v-for="item in currentModelOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </option>
          </select>
        </div>
      </div>
      <div class="input-wrapper">
        <textarea
          ref="inputTextarea"
          v-model="userInput"
          class="chat-input"
          :placeholder="
            mode === 'ask'
              ? $t('askAnything')
              : $t('directTheAgent')
          "
          rows="1"
          @keydown.enter.exact.prevent="sendMessage"
          @input="adjustTextareaHeight"
        />
        <button
          v-if="loading"
          class="stop-btn"
          title="Stop"
          @click="stopGeneration"
        >
          <Square :size="18" />
        </button>
        <button
          v-else
          class="send-btn"
          title="Send"
          :disabled="!userInput.trim()"
          @click="sendMessage"
        >
          <Send :size="18" />
        </button>
      </div>
      <div class="input-footer">
        <label class="checkbox-small">
          <input
            v-model="useWordFormatting"
            type="checkbox"
          >
          <span>{{ $t('useWordFormattingLabel') }}</span>
        </label>
        <label class="checkbox-small">
          <input
            v-model="useSelectedText"
            type="checkbox"
          >
          <span>{{ $t('includeSelectionLabel') }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  Plus,
  Settings,
  Sparkles,
  FileText,
  MessageSquare,
  Zap,
  Send,
  Copy,
  Globe,
  Sparkle,
  BookOpen,
  FileCheck,
  CheckCircle,
  Square
} from 'lucide-vue-next'
import { ref, computed, nextTick, onBeforeMount, watch } from 'vue'
import { useRouter } from 'vue-router'

import { message as messageUtil } from '@/utils/message'
import { buildInPrompt } from '@/utils/constant'
import { checkAuth } from '@/utils/common'
import { localStorageKey } from '@/utils/enum'
import useSettingForm from '@/utils/settingForm'
import { settingPreset } from '@/utils/settingPreset'
import { getChatResponse } from '@/api/union'
import { insertFormattedResult, insertResult } from '@/api/common'
import { v4 as uuidv4 } from 'uuid'
import { useI18n } from 'vue-i18n'
import {
  Message,
  HumanMessage,
  AIMessage,
  SystemMessage
} from '@langchain/core/messages'

const router = useRouter()
const { t } = useI18n()

const { settingForm } = useSettingForm()

// Chat state
const mode = ref<'ask' | 'agent'>('ask')
const history = ref<Array<Message>>([])
const userInput = ref('')
const loading = ref(false)
const messagesContainer = ref<HTMLElement>()
const inputTextarea = ref<HTMLTextAreaElement>()
const abortController = ref<AbortController | null>(null)
const threadId = ref<string>(uuidv4())

// Settings
const useWordFormatting = ref(true)
const useSelectedText = ref(true)
const insertType = ref<insertTypes>('replace')

const errorIssue = ref(false)

// Quick actions
const quickActions: Array<{
  key: keyof typeof buildInPrompt
  label: string
  icon: any
}> = [
  { key: 'translate', label: t('translate'), icon: Globe },
  { key: 'polish', label: t('polish'), icon: Sparkle },
  { key: 'academic', label: t('academic'), icon: BookOpen },
  { key: 'summary', label: t('summary'), icon: FileCheck },
  { key: 'grammar', label: t('grammar'), icon: CheckCircle }
]

// Dynamic model selection
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
      return []
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

function settings() {
  router.push('/settings')
}

function startNewChat() {
  if (loading.value) {
    stopGeneration()
  }
  userInput.value = ''
  history.value = []
  threadId.value = uuidv4()
  adjustTextareaHeight()
}

function stopGeneration() {
  if (abortController.value) {
    abortController.value.abort()
    abortController.value = null
  }
  loading.value = false
}

function adjustTextareaHeight() {
  if (inputTextarea.value) {
    inputTextarea.value.style.height = 'auto'
    inputTextarea.value.style.height =
      Math.min(inputTextarea.value.scrollHeight, 120) + 'px'
  }
}

async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

async function sendMessage() {
  if (!userInput.value.trim() || loading.value) return
  if (!checkApiKey()) return

  const userMessage = userInput.value.trim()
  userInput.value = ''
  adjustTextareaHeight()

  // Get selected text from Word
  let selectedText = ''
  if (useSelectedText.value) {
    selectedText = await Word.run(async ctx => {
      const range = ctx.document.getSelection()
      range.load('text')
      await ctx.sync()
      return range.text
    })
  }

  // Add user message
  const fullMessage = new HumanMessage(
    selectedText
      ? `${userMessage}\n\n[Selected text: "${selectedText}"]`
      : userMessage
  )

  scrollToBottom()

  loading.value = true
  abortController.value = new AbortController()

  try {
    await processChat(fullMessage, undefined)
  } catch (error: any) {
    if (error.name === 'AbortError') {
      messageUtil.info('Generation stopped')
    } else {
      console.error(error)
      messageUtil.error('Failed to get response')
      // Remove failed message
      history.value.pop()
    }
  } finally {
    loading.value = false
    abortController.value = null
  }
}

async function applyQuickAction(actionKey: keyof typeof buildInPrompt) {
  if (!checkApiKey()) return

  // Get selected text
  const selectedText = await Word.run(async ctx => {
    const range = ctx.document.getSelection()
    range.load('text')
    await ctx.sync()
    return range.text
  })

  if (!selectedText) {
    messageUtil.error('Please select text first')
    return
  }

  const action = buildInPrompt[actionKey]
  const settings = settingForm.value
  const { replyLanguage: lang } = settings

  const systemMessage = action.system(lang)
  const userMessage = new HumanMessage(action.user(selectedText, lang))

  // Add user message
  history.value.push(
    new HumanMessage(
      `${quickActions.find(a => a.key === actionKey)?.label}: ${selectedText}`
    )
  )

  scrollToBottom()

  loading.value = true
  abortController.value = new AbortController()

  try {
    await processChat(userMessage, systemMessage)
  } catch (error: any) {
    if (error.name === 'AbortError') {
      messageUtil.info('Generation stopped')
    } else {
      console.error(error)
      messageUtil.error('Failed to process action')
      // Remove failed message
      history.value.pop()
    }
  } finally {
    loading.value = false
    abortController.value = null
  }
}

async function processChat(userMessage: HumanMessage, systemMessage?: string) {
  let lastUpdateTime = 0
  const UPDATE_INTERVAL = 80
  const settings = settingForm.value
  const { replyLanguage: lang, api: provider } = settings

  const defaultSystemMessage = new SystemMessage(
    systemMessage ||
      `You are a helpful AI assistant for Microsoft Word. Reply in ${lang}.`
  )

  const finalMessages = [defaultSystemMessage, userMessage]
  if (history.value.length === 0) {
    history.value.push(...finalMessages)
  } else {
    history.value.push(userMessage)
  }
  // Build provider configuration
  const providerConfigs: Record<string, any> = {
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

  const currentConfig = providerConfigs[provider]

  if (!currentConfig) {
    messageUtil.error('Not supported provider')
    return
  }

  history.value.push(new AIMessage(''))

  await getChatResponse({
    ...currentConfig,
    messages: finalMessages,
    errorIssue,
    loading,
    abortSignal: abortController.value?.signal,
    threadId: threadId.value,
    onStream: (text: string) => {
      const now = Date.now()
      const lastIndex = history.value.length - 1
      if (now - lastUpdateTime > UPDATE_INTERVAL) {
        history.value[lastIndex] = new AIMessage(text)
        scrollToBottom()
        lastUpdateTime = now
      }
    }
  })

  if (errorIssue.value) {
    errorIssue.value = false
    messageUtil.error('Something went wrong')
    return
  }

  scrollToBottom()
}

async function insertToDocument(content: string, type: insertTypes) {
  insertType.value = type

  if (useWordFormatting.value) {
    await insertFormattedResult(content, insertType)
  } else {
    insertResult(content, insertType)
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  messageUtil.success('Copied to clipboard')
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
    messageUtil.error('Set API Key or Access Token first')
    return false
  }
  return true
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
}

onBeforeMount(() => {
  addWatch()
  initData()
})
</script>

<style scoped src="./HomePage.css"></style>
