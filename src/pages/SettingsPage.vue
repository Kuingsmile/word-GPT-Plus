<template>
  <div class="settings-container">
    <!-- Header with back button -->
    <div class="settings-header">
      <button class="back-button" :title="$t('back')" @click="backToHome">
        <ArrowLeft :size="20" />
      </button>
      <h2 class="header-title">
        {{ $t('settings') || 'Settings' }}
      </h2>
    </div>

    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-button"
        :title="$t(tab.label) || tab.defaultLabel"
        :class="{ active: currentTab === tab.id }"
        @click="currentTab = tab.id"
      >
        <component :is="tab.icon" :size="16" />
      </button>
    </div>

    <!-- Main Content -->
    <div class="settings-main">
      <div class="content-body">
        <!-- General Settings -->
        <div v-show="currentTab === 'general'" class="settings-section">
          <div class="setting-card">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">{{
                  $t('localLanguageLabel')
                }}</label>
              </div>
              <div class="setting-control">
                <select
                  v-model="settingForm.localLanguage"
                  class="select-input"
                >
                  <option
                    v-for="item in settingPreset.localLanguage.optionObj"
                    :key="item.value"
                    :value="item.value"
                  >
                    {{ item.label }}
                  </option>
                </select>
              </div>
            </div>

            <div class="setting-divider" />

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">{{
                  $t('replyLanguageLabel')
                }}</label>
              </div>
              <div class="setting-control">
                <select
                  v-model="settingForm.replyLanguage"
                  class="select-input"
                >
                  <option
                    v-for="item in settingPreset.replyLanguage.optionObj"
                    :key="item.value"
                    :value="item.value"
                  >
                    {{ item.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- API Provider Settings -->
        <div v-show="currentTab === 'provider'" class="settings-section">
          <div class="setting-card">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">{{ $t('providerLabel') }}</label>
              </div>
              <div style="width: 100%">
                <select v-model="settingForm.api" class="select-input">
                  <option
                    v-for="item in settingPreset.api.optionObj"
                    :key="item.value"
                    :value="item.value"
                  >
                    {{ item.label.replace('official', 'OpenAI') }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Dynamic API Configuration -->
          <div
            v-for="platform in Object.keys(availableAPIs)"
            v-show="settingForm.api === platform"
            :key="platform"
            class="api-config-section"
          >
            <h3 class="subsection-title">
              {{ platform.replace('official', 'OpenAI') }}
              {{ $t('configuration') }}
            </h3>

            <div class="setting-card">
              <!-- Input Settings -->
              <div
                v-for="(item, index) in getApiInputSettings(platform)"
                :key="item"
              >
                <div class="setting-item">
                  <div class="setting-info">
                    <label class="setting-label">{{
                      $t(getLabel(item))
                    }}</label>
                  </div>
                  <div class="setting-control full-width">
                    <input
                      v-model="settingForm[item as SettingNames]"
                      class="text-input"
                      type="text"
                      :placeholder="$t(getPlaceholder(item))"
                    />
                  </div>
                </div>
                <div
                  v-if="index < getApiInputSettings(platform).length - 1"
                  class="setting-divider"
                />
              </div>

              <!-- Custom Models Management -->
              <div v-if="hasCustomModelsSupport(platform)">
                <div
                  v-if="getApiInputSettings(platform).length > 0"
                  class="setting-divider"
                />
                <div class="setting-item">
                  <div class="setting-info">
                    <label class="setting-label">{{
                      $t('customModelsLabel')
                    }}</label>
                  </div>
                  <div class="setting-control full-width">
                    <div style="display: flex; gap: 8px; margin-bottom: 8px">
                      <input
                        v-model="newCustomModel[platform]"
                        class="text-input"
                        type="text"
                        :placeholder="$t('customModelPlaceholder')"
                        @keyup.enter="addCustomModel(platform)"
                      />
                      <button
                        class="add-button"
                        style="white-space: nowrap"
                        @click="addCustomModel(platform)"
                      >
                        <component :is="Plus" :size="16" />
                      </button>
                    </div>
                    <div
                      v-if="
                        customModelsMap[platform] &&
                        customModelsMap[platform].length > 0
                      "
                      style="display: flex; flex-wrap: wrap; gap: 6px"
                    >
                      <span
                        v-for="model in customModelsMap[platform]"
                        :key="model"
                        class="custom-model-tag"
                      >
                        {{ model }}
                        <button
                          class="remove-tag-btn"
                          @click="removeCustomModel(platform, model)"
                        >
                          <component :is="X" :size="12" />
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Select Settings -->
              <div v-for="item in getApiSelectSettings(platform)" :key="item">
                <div
                  v-if="
                    getApiInputSettings(platform).length > 0 ||
                    hasCustomModelsSupport(platform)
                  "
                  class="setting-divider"
                />
                <div class="setting-item">
                  <div class="setting-info">
                    <label class="setting-label">{{
                      $t(getLabel(item))
                    }}</label>
                  </div>
                  <div style="width: 100%">
                    <select
                      v-model="settingForm[item as SettingNames]"
                      class="select-input"
                    >
                      <option
                        v-for="option in getMergedModelOptions(platform)"
                        :key="option"
                        :value="option"
                      >
                        {{ option }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Number Settings -->
              <div v-for="item in getApiNumSettings(platform)" :key="item">
                <div class="setting-divider" />
                <div class="setting-item">
                  <div class="setting-info">
                    <label class="setting-label">{{
                      $t(getLabel(item))
                    }}</label>
                  </div>
                  <div class="setting-control">
                    <input
                      v-model.number="settingForm[item as SettingNames]"
                      class="text-input number-input"
                      type="number"
                      :min="0"
                      :max="item.includes('Temperature') ? 2 : 32000"
                      :step="item.includes('Temperature') ? 0.1 : 1"
                      :placeholder="$t(getPlaceholder(item))"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Prompts Settings -->
        <div v-show="currentTab === 'prompts'" class="settings-section">
          <!-- Active Prompt Display -->
          <div class="setting-card">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">{{ $t('activePrompt') }}</label>
              </div>
              <div style="width: 100%">
                <select
                  v-model="activePromptId"
                  class="select-input"
                  @change="switchActivePrompt"
                >
                  <option
                    v-for="prompt in savedPrompts"
                    :key="prompt.id"
                    :value="prompt.id"
                  >
                    {{ prompt.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Prompt List -->
          <div class="prompts-list">
            <div class="list-header">
              <h3 class="list-title">
                {{ $t('savedPrompts') }}
              </h3>
              <button class="add-button" @click="addNewPrompt">
                <component :is="Plus" :size="16" />
                <span>{{ $t('addPrompt') || 'Add' }}</span>
              </button>
            </div>

            <div
              v-for="prompt in savedPrompts"
              :key="prompt.id"
              class="prompt-item"
              :class="{ active: prompt.id === activePromptId }"
            >
              <div class="prompt-header">
                <div class="prompt-title-row">
                  <input
                    v-if="editingPromptId === prompt.id"
                    v-model="editingPrompt.name"
                    class="prompt-name-input"
                    @blur="savePromptEdit"
                    @keyup.enter="savePromptEdit"
                  />
                  <span v-else class="prompt-name">{{ prompt.name }}</span>
                  <span
                    v-if="prompt.id === activePromptId"
                    class="active-badge"
                    >{{ $t('active') }}</span
                  >
                </div>
                <div class="prompt-actions">
                  <button
                    class="icon-button"
                    :title="$t('edit') || 'Edit'"
                    @click="startEditPrompt(prompt)"
                  >
                    <component :is="Edit2" :size="14" />
                  </button>
                  <button
                    v-if="savedPrompts.length > 1"
                    class="icon-button delete"
                    :title="$t('delete') || 'Delete'"
                    @click="deletePrompt(prompt.id)"
                  >
                    <component :is="Trash2" :size="14" />
                  </button>
                </div>
              </div>

              <div v-if="editingPromptId === prompt.id" class="prompt-editor">
                <label class="editor-label">{{ $t('systemPrompt') }}</label>
                <textarea
                  v-model="editingPrompt.systemPrompt"
                  class="textarea-input"
                  rows="3"
                  :placeholder="$t('systemPromptPlaceholder')"
                />

                <label class="editor-label">{{ $t('userPrompt') }}</label>
                <textarea
                  v-model="editingPrompt.userPrompt"
                  class="textarea-input"
                  rows="3"
                  :placeholder="$t('userPromptPlaceholder')"
                />

                <div class="editor-actions">
                  <button class="save-button" @click="savePromptEdit">
                    {{ $t('save') || 'Save' }}
                  </button>
                  <button class="cancel-button" @click="cancelEdit">
                    {{ $t('cancel') || 'Cancel' }}
                  </button>
                </div>
              </div>

              <div v-else class="prompt-preview">
                <p class="preview-text">
                  {{ prompt.systemPrompt.substring(0, 100)
                  }}{{ prompt.systemPrompt.length > 100 ? '...' : '' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tools & MCP Settings -->
        <div v-show="currentTab === 'tools'" class="settings-section">
          <!-- MCP Servers Section -->
          <div class="setting-card">
            <div class="list-header">
              <h3 class="list-title">
                {{ $t('mcpServers') }}
              </h3>
              <button
                class="add-button"
                @click="showAddMCPForm = !showAddMCPForm"
              >
                <component :is="Plus" :size="16" />
                <span>{{ $t('addServer') }}</span>
              </button>
            </div>
            <p class="section-description">
              {{ $t('mcpDescription') }}
            </p>

            <!-- Add MCP Server Form -->
            <div v-if="showAddMCPForm" class="mcp-add-form">
              <div class="form-row">
                <label class="form-label">{{ $t('serverName') }}</label>
                <input
                  v-model="newMCPServer.name"
                  class="text-input"
                  type="text"
                  :placeholder="$t('serverNamePlaceholder')"
                />
              </div>
              <div class="form-row">
                <label class="form-label">{{ $t('serverUrl') }}</label>
                <input
                  v-model="newMCPServer.url"
                  class="text-input"
                  type="text"
                  :placeholder="$t('serverUrlPlaceholder')"
                />
              </div>
              <div class="form-row">
                <label class="form-label">{{ $t('apiKeyOptional') }}</label>
                <input
                  v-model="newMCPServer.apiKey"
                  class="text-input"
                  type="password"
                  :placeholder="$t('apiKeyPlaceholder')"
                />
              </div>
              <div class="form-actions">
                <button class="save-button" @click="handleAddMCPServer">
                  {{ $t('add') || 'Add' }}
                </button>
                <button class="cancel-button" @click="showAddMCPForm = false">
                  {{ $t('cancel') || 'Cancel' }}
                </button>
              </div>
            </div>

            <!-- MCP Servers List -->
            <div v-if="mcpServers.length > 0" class="mcp-servers-list">
              <div
                v-for="server in mcpServers"
                :key="server.id"
                class="mcp-server-item"
                :class="{
                  connected: server.status === 'connected',
                  error: server.status === 'error'
                }"
              >
                <div
                  class="server-header"
                  @click="toggleServerExpand(server.id)"
                >
                  <div class="server-info">
                    <component
                      :is="
                        expandedServerId === server.id
                          ? ChevronDown
                          : ChevronRight
                      "
                      :size="16"
                      class="expand-icon"
                    />
                    <span class="server-name">{{ server.name }}</span>
                    <span class="server-status" :class="server.status">
                      {{ server.status }}
                    </span>
                  </div>
                  <div class="server-actions" @click.stop>
                    <button
                      class="icon-button"
                      :class="{ active: server.enabled }"
                      :title="server.enabled ? 'Disable' : 'Enable'"
                      @click="handleToggleServer(server.id, !server.enabled)"
                    >
                      <component :is="Power" :size="14" />
                    </button>
                    <button
                      v-if="
                        server.status === 'disconnected' ||
                        server.status === 'error'
                      "
                      class="icon-button connect"
                      :title="$t('connect')"
                      :disabled="connectingServerId === server.id"
                      @click="handleConnectServer(server.id)"
                    >
                      <component
                        :is="
                          connectingServerId === server.id ? RefreshCw : Plug
                        "
                        :size="14"
                        :class="{ spinning: connectingServerId === server.id }"
                      />
                    </button>
                    <button
                      v-else
                      class="icon-button disconnect"
                      :title="$t('disconnect')"
                      @click="handleDisconnectServer(server.id)"
                    >
                      <component :is="Plug" :size="14" />
                    </button>
                    <button
                      class="icon-button delete"
                      :title="$t('delete')"
                      @click="handleRemoveMCPServer(server.id)"
                    >
                      <component :is="Trash2" :size="14" />
                    </button>
                  </div>
                </div>

                <div
                  v-if="expandedServerId === server.id"
                  class="server-details"
                >
                  <div class="detail-row">
                    <span class="detail-label">URL:</span>
                    <span class="detail-value">{{ server.url }}</span>
                  </div>
                  <div
                    v-if="server.tools && server.tools.length > 0"
                    class="server-tools"
                  >
                    <span class="detail-label"
                      >{{ $t('availableTools') }}:</span
                    >
                    <div class="tools-tags">
                      <span
                        v-for="tool in server.tools"
                        :key="tool.name"
                        class="tool-tag"
                      >
                        {{ tool.name }}
                      </span>
                    </div>
                  </div>
                  <div
                    v-else-if="server.status === 'connected'"
                    class="no-tools"
                  >
                    {{ $t('noToolsAvailable') }}
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="empty-mcp">
              <component :is="Plug" :size="24" />
              <p>{{ $t('noMCPServers') }}</p>
              <p class="empty-hint">
                {{ $t('addMCPHint') }}
              </p>
            </div>
          </div>

          <!-- Word Tools Section -->
          <div class="setting-card" style="margin-top: 16px">
            <div class="list-header">
              <h3 class="list-title">
                {{ $t('wordTools') }}
              </h3>
            </div>
            <p class="section-description">
              {{ $t('wordToolsDescription') }}
            </p>

            <div class="word-tools-list compact">
              <div
                v-for="tool in wordToolsList"
                :key="tool.name"
                class="word-tool-item compact"
              >
                <component :is="Wrench" :size="14" class="tool-icon-inline" />
                <div class="tool-info-compact">
                  <span class="tool-name-compact">{{
                    $t(`wordTool_${tool.name}`)
                  }}</span>
                  <span class="tool-description-compact">
                    {{ $t(`wordTool_${tool.name}_desc`) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onBeforeMount, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  Globe,
  Cpu,
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  X,
  Plug,
  Power,
  RefreshCw,
  Wrench,
  ChevronDown,
  ChevronRight
} from 'lucide-vue-next'

import { getLabel, getPlaceholder } from '@/utils/common'
import { availableAPIs } from '@/utils/constant'
import { SettingNames, settingPreset } from '@/utils/settingPreset'
import useSettingForm from '@/utils/settingForm'
import { useMCPManager } from '@/utils/mcpManager'
import { MCPServer } from '@/types/mcp'
import { getWordToolDefinitions } from '@/utils/wordTools'

const router = useRouter()
const { settingForm, settingFormKeys } = useSettingForm()

const {
  addServer,
  removeServer,
  getServers,
  connectServer,
  disconnectServer,
  toggleServer
} = useMCPManager()

const currentTab = ref('provider')

// MCP state
const mcpServers = ref<MCPServer[]>([])
const newMCPServer = ref({ name: '', url: '', apiKey: '' })
const showAddMCPForm = ref(false)
const connectingServerId = ref<string | null>(null)
const expandedServerId = ref<string | null>(null)

// Word tools list
const wordToolsList = getWordToolDefinitions()

function loadMCPServers() {
  mcpServers.value = getServers()
}

function handleAddMCPServer() {
  if (!newMCPServer.value.name || !newMCPServer.value.url) return

  addServer({
    name: newMCPServer.value.name,
    url: newMCPServer.value.url.replace(/\/$/, ''),
    apiKey: newMCPServer.value.apiKey || undefined,
    enabled: true,
    description: ''
  })

  newMCPServer.value = { name: '', url: '', apiKey: '' }
  showAddMCPForm.value = false
  loadMCPServers()
}

function handleRemoveMCPServer(serverId: string) {
  removeServer(serverId)
  loadMCPServers()
}

async function handleConnectServer(serverId: string) {
  connectingServerId.value = serverId
  try {
    await connectServer(serverId)
    loadMCPServers()
  } catch (error: any) {
    console.error('Failed to connect:', error)
  } finally {
    connectingServerId.value = null
  }
}

function handleDisconnectServer(serverId: string) {
  disconnectServer(serverId)
  loadMCPServers()
}

function handleToggleServer(serverId: string, enabled: boolean) {
  toggleServer(serverId, enabled)
  loadMCPServers()
}

function toggleServerExpand(serverId: string) {
  expandedServerId.value = expandedServerId.value === serverId ? null : serverId
}

const newCustomModel = ref<Record<string, string>>({})
const customModelsMap = ref<Record<string, string[]>>({})

// Prompt management
interface Prompt {
  id: string
  name: string
  systemPrompt: string
  userPrompt: string
}

const savedPrompts = ref<Prompt[]>([])
const activePromptId = ref<string>('')
const editingPromptId = ref<string>('')
const editingPrompt = ref<Prompt>({
  id: '',
  name: '',
  systemPrompt: '',
  userPrompt: ''
})

const tabs = [
  { id: 'general', label: 'general', defaultLabel: 'General', icon: Globe },
  {
    id: 'provider',
    label: 'apiProvider',
    defaultLabel: 'API Provider',
    icon: Cpu
  },
  {
    id: 'prompts',
    label: 'prompts',
    defaultLabel: 'Prompts',
    icon: MessageSquare
  },
  {
    id: 'tools',
    label: 'tools',
    defaultLabel: 'Tools & MCP',
    icon: Wrench
  }
]

const getApiInputSettings = (platform: string) => {
  return Object.keys(settingForm.value).filter(
    key =>
      key.startsWith(platform) &&
      settingPreset[key as SettingNames].type === 'input' &&
      !key.endsWith('CustomModel')
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

const getCustomModelsKey = (platform: string): SettingNames | null => {
  const key = `${platform}CustomModels` as SettingNames
  return settingPreset[key] ? key : null
}

const loadCustomModels = () => {
  const platforms = ['official', 'gemini', 'ollama', 'groq']
  platforms.forEach(platform => {
    const key = getCustomModelsKey(platform)
    if (key && settingPreset[key].getFunc) {
      customModelsMap.value[platform] = settingPreset[key].getFunc!()
    }
  })
}

const addCustomModel = (platform: string) => {
  const model = newCustomModel.value[platform]?.trim()
  if (!model) return

  const key = getCustomModelsKey(platform)
  if (!key) return

  if (!customModelsMap.value[platform]) {
    customModelsMap.value[platform] = []
  }

  if (!customModelsMap.value[platform].includes(model)) {
    customModelsMap.value[platform].push(model)
    settingPreset[key].saveFunc!(customModelsMap.value[platform])
    newCustomModel.value[platform] = ''
  }
}

const removeCustomModel = (platform: string, model: string) => {
  const key = getCustomModelsKey(platform)
  if (!key) return

  customModelsMap.value[platform] = customModelsMap.value[platform].filter(
    m => m !== model
  )
  settingPreset[key].saveFunc!(customModelsMap.value[platform])

  // If the removed model was selected, switch to first available
  const selectKey = `${platform}ModelSelect` as SettingNames
  if (settingForm.value[selectKey] === model) {
    const options = getMergedModelOptions(platform)
    if (options.length > 0) {
      settingForm.value[selectKey] = options[0]
    }
  }
}

const getMergedModelOptions = (platform: string) => {
  const selectKey = `${platform}ModelSelect` as SettingNames
  const presetOptions = settingPreset[selectKey]?.optionList || []
  const customModels = customModelsMap.value[platform] || []

  return [...customModels, ...presetOptions]
}

const hasCustomModelsSupport = (platform: string) => {
  return getCustomModelsKey(platform) !== null
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
      },
      { deep: true }
    )
  })
}

const loadPrompts = () => {
  const stored = localStorage.getItem('savedPrompts')
  if (stored) {
    savedPrompts.value = JSON.parse(stored)
  } else {
    savedPrompts.value = [
      {
        id: 'default',
        name: 'Default',
        systemPrompt:
          settingForm.value.systemPrompt || 'You are a helpful assistant.',
        userPrompt: settingForm.value.userPrompt || ''
      }
    ]
    savePromptsToStorage()
  }

  const storedActiveId = localStorage.getItem('activePromptId')
  if (storedActiveId && savedPrompts.value.some(p => p.id === storedActiveId)) {
    activePromptId.value = storedActiveId
  } else {
    activePromptId.value = savedPrompts.value[0]?.id || ''
  }

  syncActivePromptToForm()
}

const savePromptsToStorage = () => {
  localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts.value))
}

const syncActivePromptToForm = () => {
  const activePrompt = savedPrompts.value.find(
    p => p.id === activePromptId.value
  )
  if (activePrompt) {
    settingForm.value.systemPrompt = activePrompt.systemPrompt
    settingForm.value.userPrompt = activePrompt.userPrompt
  }
}

const switchActivePrompt = () => {
  localStorage.setItem('activePromptId', activePromptId.value)
  syncActivePromptToForm()
}

const addNewPrompt = () => {
  const newPrompt: Prompt = {
    id: `prompt_${Date.now()}`,
    name: `Prompt ${savedPrompts.value.length + 1}`,
    systemPrompt: 'You are a helpful assistant.',
    userPrompt: ''
  }
  savedPrompts.value.push(newPrompt)
  savePromptsToStorage()
  startEditPrompt(newPrompt)
}

const startEditPrompt = (prompt: Prompt) => {
  editingPromptId.value = prompt.id
  editingPrompt.value = { ...prompt }
}

const savePromptEdit = () => {
  const index = savedPrompts.value.findIndex(
    p => p.id === editingPromptId.value
  )
  if (index !== -1) {
    savedPrompts.value[index] = { ...editingPrompt.value }
    savePromptsToStorage()

    if (editingPromptId.value === activePromptId.value) {
      syncActivePromptToForm()
    }
  }
  editingPromptId.value = ''
}

const cancelEdit = () => {
  editingPromptId.value = ''
}

const deletePrompt = (id: string) => {
  if (savedPrompts.value.length <= 1) return

  const index = savedPrompts.value.findIndex(p => p.id === id)
  if (index !== -1) {
    savedPrompts.value.splice(index, 1)
    savePromptsToStorage()

    if (id === activePromptId.value) {
      activePromptId.value = savedPrompts.value[0].id
      switchActivePrompt()
    }
  }
}

onBeforeMount(() => {
  loadPrompts()
  loadCustomModels()
  loadMCPServers()
  addWatch()
})

function backToHome() {
  router.push('/')
}
</script>

<style scoped src="./SettingsPage.css"></style>
