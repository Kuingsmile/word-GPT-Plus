<template>
  <div class="copilot-chat">
    <!-- Header -->
    <div class="chat-header">
      <div class="header-left">
        <Sparkles :size="18" />
        <span class="app-title">Word GPT+</span>
      </div>
      <div class="header-right">
        <button class="new-chat-btn" :title="$t('newChat')" @click="startNewChat">
          <Plus :size="18" />
        </button>
        <button class="settings-icon-btn" :title="$t('settings')" @click="settings">
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
        <component :is="action.icon" :size="16" />
      </button>
      <select v-model="selectedPromptId" class="prompt-selector" :disabled="loading" @change="loadSelectedPrompt">
        <option value="">{{ $t('selectPrompt') }}</option>
        <option v-for="prompt in savedPrompts" :key="prompt.id" :value="prompt.id">
          {{ prompt.name }}
        </option>
      </select>
    </div>

    <!-- Chat Messages Container -->
    <div ref="messagesContainer" class="chat-messages">
      <div v-if="history.length === 0" class="empty-state">
        <Sparkles :size="32" />
        <p class="empty-title">
          {{ $t('emptyTitle') }}
        </p>
        <p class="empty-subtitle">
          {{ $t('emptySubtitle') }}
        </p>
      </div>

      <div
        v-for="(msg, index) in displayHistory"
        :key="msg.id || index"
        class="message"
        :class="msg instanceof AIMessage ? 'assistant' : 'user'"
      >
        <div class="message-content">
          <div class="message-text">
            <template v-for="(segment, idx) in renderSegments(msg)" :key="idx">
              <span v-if="segment.type === 'text'">{{ segment.text.trim() }}</span>
              <details v-else class="think-block">
                <summary>Thought process</summary>
                <pre>{{ segment.text.trim() }}</pre>
              </details>
            </template>
          </div>
          <div v-if="msg instanceof AIMessage" class="message-actions">
            <button
              class="action-icon"
              :title="$t('replaceSelectedText')"
              @click="insertToDocument(cleanMessageText(msg), 'replace')"
            >
              <FileText :size="12" />
            </button>
            <button
              class="action-icon"
              :title="$t('appendToSelection')"
              @click="insertToDocument(cleanMessageText(msg), 'append')"
            >
              <Plus :size="12" />
            </button>
            <button class="action-icon" :title="$t('copyToClipboard')" @click="copyToClipboard(cleanMessageText(msg))">
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
          <button class="mode-btn" :class="{ active: mode === 'ask' }" title="Ask Mode" @click="mode = 'ask'">
            <MessageSquare :size="14" />
          </button>
          <button class="mode-btn" :class="{ active: mode === 'agent' }" title="Agent Mode" @click="mode = 'agent'">
            <BotMessageSquare :size="17" />
          </button>
        </div>
        <div class="model-controls">
          <select v-model="settingForm.api" class="compact-select">
            <option v-for="item in settingPreset.api.optionObj" :key="item.value" :value="item.value">
              {{ item.label.replace('official', 'OpenAI') }}
            </option>
          </select>
          <select
            v-model="currentModelSelect"
            class="compact-select"
            :disabled="!currentModelOptions || currentModelOptions.length === 0"
          >
            <option v-for="item in currentModelOptions" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </div>
      </div>
      <div class="input-wrapper">
        <textarea
          ref="inputTextarea"
          v-model="userInput"
          class="chat-input"
          :placeholder="mode === 'ask' ? $t('askAnything') : $t('directTheAgent')"
          rows="1"
          @keydown.enter.exact.prevent="sendMessage"
          @input="adjustTextareaHeight"
        />
        <button v-if="loading" class="stop-btn" title="Stop" @click="stopGeneration">
          <Square :size="18" />
        </button>
        <button v-else class="send-btn" title="Send" :disabled="!userInput.trim()" @click="sendMessage">
          <Send :size="18" />
        </button>
      </div>
      <div class="input-footer">
        <label class="checkbox-small">
          <input v-model="useWordFormatting" type="checkbox" />
          <span>{{ $t('useWordFormattingLabel') }}</span>
        </label>
        <label class="checkbox-small">
          <input v-model="useSelectedText" type="checkbox" />
          <span>{{ $t('includeSelectionLabel') }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AIMessage, HumanMessage, Message, SystemMessage } from '@langchain/core/messages'
import { useStorage } from '@vueuse/core'
import {
  BookOpen,
  BotMessageSquare,
  CheckCircle,
  Copy,
  FileCheck,
  FileText,
  Globe,
  MessageSquare,
  Plus,
  Send,
  Settings,
  Sparkle,
  Sparkles,
  Square,
} from 'lucide-vue-next'
import { v4 as uuidv4 } from 'uuid'
import { computed, nextTick, onBeforeMount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { insertFormattedResult, insertResult } from '@/api/common'
import { getAgentResponse, getChatResponse } from '@/api/union'
import { checkAuth } from '@/utils/common'
import { buildInPrompt, getBuiltInPrompt } from '@/utils/constant'
import { localStorageKey } from '@/utils/enum'
import { createGeneralTools, GeneralToolName } from '@/utils/generalTools'
import { message as messageUtil } from '@/utils/message'
import useSettingForm from '@/utils/settingForm'
import { settingPreset } from '@/utils/settingPreset'
import { createWordTools, WordToolName } from '@/utils/wordTools'

const router = useRouter()
const { t } = useI18n()

const settingForm = useSettingForm()

interface SavedPrompt {
  id: string
  name: string
  systemPrompt: string
  userPrompt: string
}

const savedPrompts = ref<SavedPrompt[]>([])
const selectedPromptId = ref<string>('')
const customSystemPrompt = ref<string>('')

const allWordToolNames: WordToolName[] = [
  'getSelectedText',
  'getDocumentContent',
  'insertText',
  'replaceSelectedText',
  'appendText',
  'insertParagraph',
  'formatText',
  'searchAndReplace',
  'getDocumentProperties',
  'insertTable',
  'insertList',
  'deleteText',
  'clearFormatting',
  'setFontName',
  'insertPageBreak',
  'getRangeInfo',
  'selectText',
  'insertImage',
  'getTableInfo',
  'insertBookmark',
  'goToBookmark',
  'insertContentControl',
  'findText',
]

const allGeneralToolNames: GeneralToolName[] = ['fetchWebContent', 'searchWeb', 'getCurrentDate', 'calculateMath']

// Tool state
const enabledWordTools = ref<WordToolName[]>(loadEnabledWordTools())
const enabledGeneralTools = ref<GeneralToolName[]>(loadEnabledGeneralTools())

function loadEnabledWordTools(): WordToolName[] {
  const stored = localStorage.getItem('enabledWordTools')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      return parsed.filter((name: string) => allWordToolNames.includes(name as WordToolName))
    } catch {
      return [...allWordToolNames]
    }
  }
  return [...allWordToolNames]
}

function loadEnabledGeneralTools(): GeneralToolName[] {
  const stored = localStorage.getItem('enabledGeneralTools')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      return parsed.filter((name: string) => allGeneralToolNames.includes(name as GeneralToolName))
    } catch {
      return [...allGeneralToolNames]
    }
  }
  return [...allGeneralToolNames]
}

function getActiveTools() {
  const wordTools = createWordTools(enabledWordTools.value)
  const generalTools = createGeneralTools(enabledGeneralTools.value)
  return [...generalTools, ...wordTools]
}

function loadSavedPrompts() {
  const stored = localStorage.getItem('savedPrompts')
  if (stored) {
    try {
      savedPrompts.value = JSON.parse(stored)
    } catch (error) {
      console.error('Error loading saved prompts:', error)
      savedPrompts.value = []
    }
  }
}

function loadSelectedPrompt() {
  if (!selectedPromptId.value) {
    customSystemPrompt.value = ''
    return
  }

  const prompt = savedPrompts.value.find(p => p.id === selectedPromptId.value)
  if (prompt) {
    customSystemPrompt.value = prompt.systemPrompt
    userInput.value = prompt.userPrompt
    adjustTextareaHeight()

    if (inputTextarea.value) {
      inputTextarea.value.focus()
    }
  }
}

// Chat state
const mode = useStorage(localStorageKey.chatMode, 'ask' as 'ask' | 'agent')
const history = ref<Message[]>([])
const userInput = ref('')
const loading = ref(false)
const messagesContainer = ref<HTMLElement>()
const inputTextarea = ref<HTMLTextAreaElement>()
const abortController = ref<AbortController | null>(null)
const threadId = ref<string>(uuidv4())

// Settings
const useWordFormatting = useStorage(localStorageKey.useWordFormatting, true)
const useSelectedText = useStorage(localStorageKey.useSelectedText, true)
const insertType = ref<insertTypes>('replace')

const errorIssue = ref<boolean | string | null>(false)

const displayHistory = computed(() => {
  return history.value.filter(msg => !(msg instanceof SystemMessage))
})

// Quick actions
const quickActions: {
  key: keyof typeof buildInPrompt
  label: string
  icon: any
}[] = [
  { key: 'translate', label: t('translate'), icon: Globe },
  { key: 'polish', label: t('polish'), icon: Sparkle },
  { key: 'academic', label: t('academic'), icon: BookOpen },
  { key: 'summary', label: t('summary'), icon: FileCheck },
  { key: 'grammar', label: t('grammar'), icon: CheckCircle },
]

const getCustomModels = (key: string, oldKey: string): string[] => {
  const stored = localStorage.getItem(key)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }
  const oldModel = localStorage.getItem(oldKey)
  if (oldModel && oldModel.trim()) {
    return [oldModel]
  }
  return []
}

const currentModelOptions = computed(() => {
  let presetOptions: string[] = []
  let customModels: string[] = []

  switch (settingForm.value.api) {
    case 'official':
      presetOptions = settingPreset.officialModelSelect.optionList || []
      customModels = getCustomModels('customModels', 'customModel')
      break
    case 'gemini':
      presetOptions = settingPreset.geminiModelSelect.optionList || []
      customModels = getCustomModels('geminiCustomModels', 'geminiCustomModel')
      break
    case 'ollama':
      presetOptions = settingPreset.ollamaModelSelect.optionList || []
      customModels = getCustomModels('ollamaCustomModels', 'ollamaCustomModel')
      break
    case 'groq':
      presetOptions = settingPreset.groqModelSelect.optionList || []
      customModels = getCustomModels('groqCustomModels', 'groqCustomModel')
      break
    case 'azure':
      return []
    default:
      return []
  }

  return [...presetOptions, ...customModels]
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
        localStorage.setItem(localStorageKey.model, value)
        break
      case 'gemini':
        settingForm.value.geminiModelSelect = value
        localStorage.setItem(localStorageKey.geminiModel, value)
        break
      case 'ollama':
        settingForm.value.ollamaModelSelect = value
        localStorage.setItem(localStorageKey.ollamaModel, value)
        break
      case 'groq':
        settingForm.value.groqModelSelect = value
        localStorage.setItem(localStorageKey.groqModel, value)
        break
      case 'azure':
        settingForm.value.azureDeploymentName = value
        localStorage.setItem(localStorageKey.azureDeploymentName, value)
        break
    }
  },
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
  customSystemPrompt.value = ''
  selectedPromptId.value = ''
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
    inputTextarea.value.style.height = Math.min(inputTextarea.value.scrollHeight, 120) + 'px'
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
    selectedText ? `${userMessage}\n\n[Selected text: "${selectedText}"]` : userMessage,
  )

  scrollToBottom()

  loading.value = true
  abortController.value = new AbortController()

  try {
    await processChat(fullMessage, undefined)
  } catch (error: any) {
    if (error.name === 'AbortError') {
      messageUtil.info(t('generationStop'))
    } else {
      console.error(error)
      messageUtil.error(t('failedToResponse'))
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
    messageUtil.error(t('selectTextPrompt'))
    return
  }

  const builtInPrompts = getBuiltInPrompt()
  const action = builtInPrompts[actionKey]
  const settings = settingForm.value
  const { replyLanguage: lang } = settings

  const systemMessage = action.system(lang)
  const userMessage = new HumanMessage(action.user(selectedText, lang))

  scrollToBottom()

  loading.value = true
  abortController.value = new AbortController()

  try {
    await processChat(userMessage, systemMessage)
  } catch (error: any) {
    if (error.name === 'AbortError') {
      messageUtil.info(t('generationStop'))
    } else {
      console.error(error)
      messageUtil.error(t('failedToProcessAction'))
      // Remove failed message
      history.value.pop()
    }
  } finally {
    loading.value = false
    abortController.value = null
  }
}

const agentPrompt = (lang: string) =>
  `
# Role
You are a highly skilled Microsoft Word Expert Agent. Your goal is to assist users in creating, editing, and formatting documents with professional precision.

# Capabilities
- You can interact with the document directly using provided tools (reading text, applying styles, inserting content, etc.).
- You understand document structure, typography, and professional writing standards.

# Guidelines
1. **Tool First**: If a request requires document modification or inspection or web search and fetch, prioritize using the available tools.
2. **Accuracy**: Ensure formatting and content changes are precise and follow the user's intent.
3. **Conciseness**: Provide brief, helpful explanations of your actions.
4. **Language**: You must communicate entirely in ${lang}.

# Safety
Do not perform destructive actions (like clearing the whole document) unless explicitly instructed.
`.trim()

const standardPrompt = (lang: string) =>
  `You are a helpful Microsoft Word specialist. Help users with drafting, brainstorming, and Word-related questions. Reply in ${lang}.`

async function processChat(userMessage: HumanMessage, systemMessage?: string) {
  const settings = settingForm.value
  const { replyLanguage: lang, api: provider } = settings

  const isAgentMode = mode.value === 'agent'

  const finalSystemMessage =
    customSystemPrompt.value || systemMessage || (isAgentMode ? agentPrompt(lang) : standardPrompt(lang))

  const defaultSystemMessage = new SystemMessage(finalSystemMessage)

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
        dangerouslyAllowBrowser: true,
      },
      maxTokens: settings.officialMaxTokens,
      temperature: settings.officialTemperature,
      model: settings.officialModelSelect,
    },
    groq: {
      provider: 'groq',
      groqAPIKey: settings.groqAPIKey,
      groqModel: settings.groqModelSelect,
      maxTokens: settings.groqMaxTokens,
      temperature: settings.groqTemperature,
    },
    azure: {
      provider: 'azure',
      azureAPIKey: settings.azureAPIKey,
      azureAPIEndpoint: settings.azureAPIEndpoint,
      azureDeploymentName: settings.azureDeploymentName,
      azureAPIVersion: settings.azureAPIVersion,
      maxTokens: settings.azureMaxTokens,
      temperature: settings.azureTemperature,
    },
    gemini: {
      provider: 'gemini',
      geminiAPIKey: settings.geminiAPIKey,
      maxTokens: settings.geminiMaxTokens,
      temperature: settings.geminiTemperature,
      geminiModel: settings.geminiModelSelect,
    },
    ollama: {
      provider: 'ollama',
      ollamaEndpoint: settings.ollamaEndpoint,
      ollamaModel: settings.ollamaModelSelect,
      temperature: settings.ollamaTemperature,
    },
  }

  const currentConfig = providerConfigs[provider]
  if (!currentConfig) {
    messageUtil.error(t('notSupportedProvider'))
    return
  }

  history.value.push(new AIMessage(''))

  // Use agent mode with tools if enabled
  if (isAgentMode) {
    const tools = getActiveTools()

    await getAgentResponse({
      ...currentConfig,
      recursionLimit: settings.agentMaxIterations,
      messages: finalMessages,
      tools,
      errorIssue,
      loading,
      abortSignal: abortController.value?.signal,
      threadId: threadId.value,
      onStream: (text: string) => {
        const lastIndex = history.value.length - 1
        history.value[lastIndex] = new AIMessage(text)
        scrollToBottom()
      },
      onToolCall: (toolName: string, _args: any) => {
        // Show tool call in UI
        const lastIndex = history.value.length - 1
        const currentContent = getMessageText(history.value[lastIndex])
        history.value[lastIndex] = new AIMessage(currentContent + `\n\n🔧 Calling tool: ${toolName}...`)
        scrollToBottom()
      },
      onToolResult: (toolName: string, _result: string) => {
        // Update with tool result
        const lastIndex = history.value.length - 1
        const currentContent = getMessageText(history.value[lastIndex])
        const updatedContent = currentContent.replace(
          `🔧 Calling tool: ${toolName}...`,
          `✅ Tool ${toolName} completed`,
        )
        history.value[lastIndex] = new AIMessage(updatedContent)
        scrollToBottom()
      },
    })
  } else {
    await getChatResponse({
      ...currentConfig,
      messages: finalMessages,
      errorIssue,
      loading,
      abortSignal: abortController.value?.signal,
      threadId: threadId.value,
      onStream: (text: string) => {
        const lastIndex = history.value.length - 1
        history.value[lastIndex] = new AIMessage(text)
        scrollToBottom()
      },
    })
  }

  if (errorIssue.value) {
    if (typeof errorIssue.value === 'string') {
      messageUtil.error(t(errorIssue.value))
    } else {
      messageUtil.error(t('somethingWentWrong'))
    }
    errorIssue.value = null
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
  messageUtil.success(t('copied'))
}

function checkApiKey() {
  const auth = {
    type: settingForm.value.api as supportedPlatforms,
    apiKey: settingForm.value.officialAPIKey,
    azureAPIKey: settingForm.value.azureAPIKey,
    geminiAPIKey: settingForm.value.geminiAPIKey,
    groqAPIKey: settingForm.value.groqAPIKey,
  }
  if (!checkAuth(auth)) {
    messageUtil.error(t('noAPIKey'))
    return false
  }
  return true
}

const THINK_TAG = '<think>'
const THINK_TAG_END = '</think>'

interface RenderSegment {
  type: 'text' | 'think'
  text: string
}

const flattenContentArray = (content: any[]): string =>
  content
    .map((part: any) => {
      if (typeof part === 'string') return part
      if (part?.text && typeof part.text === 'string') return part.text
      if (part?.data && typeof part.data === 'string') return part.data
      return ''
    })
    .join('')

const getMessageText = (msg: Message): string => {
  const content: any = (msg as any).content
  if (typeof content === 'string') return content
  if (Array.isArray(content)) return flattenContentArray(content)
  return ''
}

const cleanMessageText = (msg: Message): string => {
  const raw = getMessageText(msg)
  const regex = new RegExp(`${THINK_TAG}[\\s\\S]*?${THINK_TAG_END}`, 'g')
  return raw.replace(regex, '').trim()
}

const splitThinkSegments = (text: string): RenderSegment[] => {
  if (!text) return []

  const segments: RenderSegment[] = []
  let cursor = 0

  while (cursor < text.length) {
    const start = text.indexOf(THINK_TAG, cursor)
    if (start === -1) {
      segments.push({ type: 'text', text: text.slice(cursor) })
      break
    }

    if (start > cursor) {
      segments.push({ type: 'text', text: text.slice(cursor, start) })
    }

    const end = text.indexOf(THINK_TAG_END, start + THINK_TAG.length)
    if (end === -1) {
      segments.push({
        type: 'think',
        text: text.slice(start + THINK_TAG.length),
      })
      break
    }

    segments.push({
      type: 'think',
      text: text.slice(start + THINK_TAG.length, end),
    })
    cursor = end + THINK_TAG_END.length
  }

  return segments.filter(segment => segment.text)
}

const renderSegments = (msg: Message): RenderSegment[] => {
  const raw = getMessageText(msg)
  return splitThinkSegments(raw)
}

const addWatch = () => {
  watch(
    () => settingForm.value.replyLanguage,
    () => {
      localStorage.setItem(localStorageKey.replyLanguage, settingForm.value.replyLanguage)
    },
  )
  watch(
    () => settingForm.value.api,
    () => {
      localStorage.setItem(localStorageKey.api, settingForm.value.api)
    },
  )
}

async function initData() {
  insertType.value = (localStorage.getItem(localStorageKey.insertType) as insertTypes) || 'replace'
}

onBeforeMount(() => {
  addWatch()
  initData()
  loadSavedPrompts()
})
</script>

<style scoped src="./HomePage.css"></style>
