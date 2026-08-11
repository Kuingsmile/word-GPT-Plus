<template>
  <CheckPointsPage
    v-if="showCheckpoints"
    :thread-id="threadId"
    :saver="saver"
    :current-checkpoint-id="currentCheckpointId"
    @close="showCheckpoints = false"
    @restore="handleRestore"
    @select-thread="handleSelectThread"
  />
  <div
    v-show="!showCheckpoints"
    class="itemse-center relative flex h-full w-full flex-col justify-center bg-bg-secondary p-1"
  >
    <div class="relative flex h-full w-full flex-col gap-1 rounded-md">
      <!-- Header -->
      <div class="flex justify-between rounded-sm p-1">
        <div class="flex flex-1 items-center gap-2 text-accent">
          <Sparkles :size="18" />
          <span class="text-sm font-semibold text-main">Word GPT+</span>
        </div>
        <div class="flex items-center gap-1 rounded-md border border-accent/10">
          <CustomButton
            :title="t('newChat')"
            :icon="Plus"
            text=""
            type="secondary"
            class="border-none p-1!"
            :icon-size="18"
            @click="startNewChat"
          />
          <CustomButton
            :title="t('settings')"
            :icon="Settings"
            text=""
            type="secondary"
            class="border-none p-1!"
            :icon-size="18"
            @click="settings"
          />
          <CustomButton
            :title="t('checkPoints')"
            :icon="History"
            text=""
            type="secondary"
            class="border-none p-1!"
            :icon-size="18"
            @click="checkPoints"
          />
        </div>
      </div>

      <!-- Quick Actions Bar -->
      <div class="flex w-full items-center justify-center gap-2 overflow-hidden rounded-md">
        <CustomButton
          v-for="action in quickActions"
          :key="action.key"
          :title="action.label"
          text=""
          :icon="action.icon"
          type="secondary"
          :icon-size="16"
          class="shrink-0! bg-surface! p-1.5!"
          :disabled="loading"
          @click="applyQuickAction(action.key)"
        />
        <SingleSelect
          v-model="selectedPromptId"
          :key-list="savedPrompts.map(prompt => prompt.id)"
          :placeholder="t('selectPrompt')"
          title=""
          :fronticon="false"
          class="max-w-xs! flex-1! bg-surface! text-xs!"
          @change="loadSelectedPrompt"
        >
          <template #item="{ item }">
            {{ savedPrompts.find(prompt => prompt.id === item)?.name || item }}
          </template>
        </SingleSelect>
      </div>

      <!-- Chat Messages Container -->
      <div
        ref="messagesContainer"
        class="flex flex-1 flex-col gap-4 overflow-y-auto rounded-md border border-border-secondary bg-surface p-2 shadow-sm"
      >
        <div
          v-if="history.length === 0"
          class="flex h-full flex-col items-center justify-center gap-4 p-8 text-center text-accent"
        >
          <Sparkles :size="32" />
          <p class="font-semibold text-main">
            {{ $t('emptyTitle') }}
          </p>
          <p class="text-xs font-semibold text-secondary">
            {{ $t('emptySubtitle') }}
          </p>
        </div>

        <div
          v-for="(msg, index) in displayHistory"
          :key="msg.id || index"
          class="group flex items-end gap-4 [.user]:flex-row-reverse"
          :class="msg instanceof AIMessage ? 'assistant' : 'user'"
        >
          <div
            class="flex min-w-0 flex-1 flex-col gap-1 group-[.assistant]:items-start group-[.assistant]:text-left group-[.user]:items-end group-[.user]:text-left"
          >
            <div
              class="group max-w-[95%] rounded-md border border-border-secondary p-1 text-sm leading-[1.4] wrap-break-word whitespace-pre-wrap text-main/90 shadow-sm group-[.assistant]:bg-bg-tertiary group-[.assistant]:text-left group-[.user]:bg-accent/10"
            >
              <template v-for="(segment, idx) in renderSegments(msg)" :key="idx">
                <span v-if="segment.type === 'text'">{{ segment.text.trim() }}</span>
                <details v-else class="mb-1 rounded-sm border border-border-secondary bg-bg-secondary">
                  <summary class="cursor-pointer list-none p-1 text-sm font-semibold text-secondary">
                    Thought process
                  </summary>
                  <pre class="m-0 p-1 text-xs wrap-break-word whitespace-pre-wrap text-secondary">{{
                    segment.text.trim()
                  }}</pre>
                </details>
              </template>
            </div>
            <div v-if="msg instanceof AIMessage" class="flex gap-1">
              <CustomButton
                :title="t('replaceSelectedText')"
                text=""
                :icon="FileText"
                type="secondary"
                class="bg-surface! p-1.5! text-secondary!"
                :icon-size="12"
                @click="insertToDocument(cleanMessageText(msg), 'replace')"
              />
              <CustomButton
                :title="t('appendToSelection')"
                text=""
                :icon="Plus"
                type="secondary"
                class="bg-surface! p-1.5! text-secondary!"
                :icon-size="12"
                @click="insertToDocument(cleanMessageText(msg), 'append')"
              />
              <CustomButton
                :title="t('copyToClipboard')"
                text=""
                :icon="Copy"
                type="secondary"
                class="bg-surface! p-1.5! text-secondary!"
                :icon-size="12"
                @click="copyToClipboard(cleanMessageText(msg))"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="flex flex-col gap-1 rounded-md">
        <div class="flex items-center justify-between gap-2 overflow-hidden">
          <div class="flex shrink-0 gap-1 rounded-sm border border-border bg-surface p-0.5">
            <button
              class="cursor-po flex h-7 w-7 items-center justify-center rounded-md border-none text-secondary hover:bg-accent/30 hover:text-white! [.active]:text-accent"
              :class="{ active: mode === 'ask' }"
              title="Ask Mode"
              @click="mode = 'ask'"
            >
              <MessageSquare :size="14" />
            </button>
            <button
              class="cursor-po flex h-7 w-7 items-center justify-center rounded-md border-none text-secondary hover:bg-accent/30 hover:text-white! [.active]:text-accent"
              :class="{ active: mode === 'agent' }"
              title="Agent Mode"
              @click="mode = 'agent'"
            >
              <BotMessageSquare :size="17" />
            </button>
          </div>
          <div class="flex min-w-0 flex-1 gap-1 overflow-hidden">
            <select
              v-model="settingForm.api"
              class="h-7 max-w-full min-w-0 cursor-pointer rounded-md border border-border bg-surface p-1 text-xs text-secondary hover:border-accent focus:outline-none disabled:cursor-not-allowed disabled:bg-secondary"
            >
              <option v-for="item in settingPreset.api.optionObj" :key="item.value" :value="item.value">
                {{ item.label.replace('official', 'OpenAI') }}
              </option>
            </select>
            <select
              v-if="currentModelOptions && currentModelOptions.length > 0"
              v-model="currentModelSelect"
              class="h-7 max-w-full min-w-0 cursor-pointer rounded-md border border-border bg-surface p-1 text-xs text-secondary hover:border-accent focus:outline-none"
            >
              <option v-for="item in currentModelOptions" :key="item" :value="item">
                {{ item }}
              </option>
            </select>
          </div>
        </div>
        <div
          class="flex min-w-12 items-center gap-2 rounded-md border border-border bg-surface p-2 focus-within:border-accent"
        >
          <textarea
            ref="inputTextarea"
            v-model="userInput"
            class="placeholder::text-secondary block max-h-30 flex-1 resize-none overflow-y-auto border-none bg-transparent py-2 text-xs leading-normal text-main outline-none placeholder:text-xs"
            :placeholder="mode === 'ask' ? $t('askAnything') : $t('directTheAgent')"
            rows="1"
            @keydown.enter.exact.prevent="sendMessage"
            @input="adjustTextareaHeight"
          />
          <button
            v-if="loading"
            class="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-sm border-none bg-danger text-white"
            title="Stop"
            @click="stopGeneration"
          >
            <Square :size="18" />
          </button>
          <button
            v-else
            class="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-sm border-none bg-accent text-white disabled:cursor-not-allowed disabled:bg-accent/50"
            title="Send"
            :disabled="!userInput.trim()"
            @click="sendMessage"
          >
            <Send :size="18" />
          </button>
        </div>
        <div class="flex justify-center gap-3 px-1">
          <label class="flex h-3.5 w-3.5 flex-1 cursor-pointer items-center gap-1 text-xs text-secondary">
            <input v-model="useWordFormatting" type="checkbox" />
            <span>{{ $t('useWordFormattingLabel') }}</span>
          </label>
          <label class="flex h-3.5 w-3.5 flex-1 cursor-pointer items-center gap-1 text-xs text-secondary">
            <input v-model="useSelectedText" type="checkbox" />
            <span>{{ $t('includeSelectionLabel') }}</span>
          </label>
        </div>
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
  History,
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

import { type CheckpointTuple, IndexedDBSaver } from '@/api/checkpoints'
import { insertFormattedResult, insertResult } from '@/api/common'
import { getAgentResponse, getChatResponse } from '@/api/union'
import CustomButton from '@/components/CustomButton.vue'
import SingleSelect from '@/components/SingleSelect.vue'
import CheckPointsPage from '@/pages/checkPointsPage.vue'
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
const threadId = useStorage(localStorageKey.threadId, uuidv4())
const showCheckpoints = ref(false)
const saver = new IndexedDBSaver()
const currentCheckpointId = ref<string>('')

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
    case 'atlascloud':
      presetOptions = settingPreset.atlascloudModelSelect.optionList || []
      customModels = getCustomModels('atlascloudCustomModels', 'atlascloudCustomModel')
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
      case 'atlascloud':
        return settingForm.value.atlascloudModelSelect
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
      case 'atlascloud':
        settingForm.value.atlascloudModelSelect = value
        localStorage.setItem(localStorageKey.atlascloudModel, value)
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
  // FIXME: 使用路由方式会改变当前的threadID,进而重置页面
  router.push('/settings')
}

function checkPoints() {
  showCheckpoints.value = true
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

  // Add user message to history
  history.value.push(userMessage)

  // Prepare messages for LLM (always include system message first, followed by all history)
  const finalMessages = [defaultSystemMessage, ...history.value]
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
    atlascloud: {
      provider: 'atlascloud',
      atlascloudAPIKey: settings.atlascloudAPIKey,
      atlascloudBasePath: settings.atlascloudBasePath,
      atlascloudModel: settings.atlascloudModelSelect,
      maxTokens: settings.atlascloudMaxTokens,
      temperature: settings.atlascloudTemperature,
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
      checkpointId: currentCheckpointId.value,
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
    atlascloudAPIKey: settingForm.value.atlascloudAPIKey,
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

async function handleRestore(checkpointId: string) {
  currentCheckpointId.value = checkpointId
  showCheckpoints.value = false

  // Fetch the history up to the selected checkpoint
  const checkpointTuple = await saver.getTuple({
    configurable: { thread_id: threadId.value, checkpoint_id: checkpointId },
  })

  if (checkpointTuple) {
    const messages = checkpointTuple.checkpoint.channel_values.messages
    if (messages && Array.isArray(messages)) {
      history.value = messages
        .filter((msg: any) => ['human', 'ai'].includes(msg.type))
        .map((msg: any) => {
          return msg.type === 'human' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
        })
    }
  }
}

async function loadThreadHistory(targetThreadId: string) {
  const checkpoints: CheckpointTuple[] = []
  const iterator = saver.list({
    configurable: { thread_id: targetThreadId },
  })

  for await (const checkpoint of iterator) {
    checkpoints.push(checkpoint)
  }

  if (checkpoints.length > 0) {
    checkpoints.sort((a, b) => (a.metadata?.step ?? 0) - (b.metadata?.step ?? 0))

    const latestCheckpoint = checkpoints[checkpoints.length - 1]
    const messages = latestCheckpoint.checkpoint.channel_values.messages
    // TODO: 优化过滤策略
    if (messages && Array.isArray(messages)) {
      history.value = messages
        .filter((msg: any) => ['human', 'ai'].includes(msg.type))
        .map((msg: any) => {
          return msg.type === 'human' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
        })
      currentCheckpointId.value = latestCheckpoint.config.configurable?.checkpoint_id || ''
    } else {
      history.value = []
      currentCheckpointId.value = ''
    }
  } else {
    // No checkpoints found for this thread
    history.value = []
    currentCheckpointId.value = ''
  }
  await scrollToBottom()
}

async function handleSelectThread(newThreadId: string) {
  threadId.value = newThreadId
  showCheckpoints.value = false
  await loadThreadHistory(newThreadId)
}

onBeforeMount(() => {
  addWatch()
  initData()
  loadSavedPrompts()

  if (threadId.value) {
    loading.value = true // 可选：显示加载状态
    try {
      loadThreadHistory(threadId.value)
    } catch (e) {
      console.error('Auto reload history failed:', e)
    } finally {
      loading.value = false
    }
  }
})
</script>
