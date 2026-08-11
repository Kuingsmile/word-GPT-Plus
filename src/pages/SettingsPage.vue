<template>
  <div class="relative flex h-full w-full items-center justify-center bg-bg-secondary">
    <!-- Header with back button -->
    <div class="relative z-1 flex h-full w-full flex-col items-center justify-start gap-2 rounded-xl border-none p-2">
      <div
        class="flex w-full items-center justify-between gap-1 overflow-visible rounded-2xl border border-border-secondary p-0 shadow-sm"
      >
        <div class="flex flex-wrap items-center gap-4 p-1">
          <CustomButton
            :icon="ArrowLeft"
            type="secondary"
            class="border-none p-1!"
            text=""
            :title="t('back')"
            @click="backToHome"
          />
        </div>
        <div class="flex-1">
          <h2 class="text-sm font-semibold text-main">
            {{ $t('settings') || 'Settings' }}
          </h2>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="flex w-full justify-between rounded-2xl border border-border-secondary p-0">
        <CustomButton
          v-for="tab in tabs"
          :key="tab.id"
          text=""
          :type="currentTab === tab.id ? 'primary' : 'secondary'"
          :title="$t(tab.label) || tab.defaultLabel"
          :icon="tab.icon"
          :icon-size="16"
          class="flex-1 rounded-sm border-none! p-1!"
          @click="currentTab = tab.id"
        />
      </div>

      <!-- Main Content -->
      <div class="w-full flex-1 overflow-hidden">
        <div class="no-scrollbar h-full w-full overflow-auto rounded-md shadow-md">
          <!-- General Settings -->
          <div
            v-show="currentTab === 'general'"
            class="flex h-full w-full flex-col items-center gap-2 bg-bg-secondary p-1"
          >
            <SettingCard>
              <SingleSelect
                v-model="settingForm.localLanguage"
                :tight="false"
                :key-list="settingPreset.localLanguage.optionObj.map(item => item.value)"
                :title="$t('localLanguageLabel')"
                :fronticon="false"
                :placeholder="
                  settingPreset.localLanguage.optionObj.find(option => option.value === settingForm.localLanguage)
                    ?.label || settingForm.localLanguage
                "
              >
                <template #item="{ item }">
                  {{ settingPreset.localLanguage.optionObj.find(option => option.value === item)?.label || item }}
                </template>
              </SingleSelect>
            </SettingCard>

            <SettingCard>
              <SingleSelect
                v-model="settingForm.replyLanguage"
                :tight="false"
                :key-list="settingPreset.replyLanguage.optionObj.map(item => item.value)"
                :title="$t('replyLanguageLabel')"
                :fronticon="false"
                :placeholder="
                  settingPreset.replyLanguage.optionObj.find(option => option.value === settingForm.replyLanguage)
                    ?.label || settingForm.replyLanguage
                "
              >
                <template #item="{ item }">
                  {{ settingPreset.replyLanguage.optionObj.find(option => option.value === item)?.label || item }}
                </template>
              </SingleSelect>
            </SettingCard>
            <SettingCard>
              <CustomInput
                v-model.number="settingForm.agentMaxIterations"
                :title="$t('agentMaxIterationsLabel')"
                placeholder="25"
                type="number"
                :min="1"
                :max="500"
                :step="1"
              />
            </SettingCard>
          </div>

          <!-- API Provider Settings -->
          <div v-show="currentTab === 'provider'" class="flex w-full flex-col items-center gap-2 bg-bg-secondary p-1">
            <SettingCard>
              <SingleSelect
                v-model="settingForm.api"
                :tight="false"
                :key-list="settingPreset.api.optionObj.map(item => item.value)"
                :title="$t('providerLabel')"
                :fronticon="false"
                :placeholder="
                  settingPreset.api.optionObj
                    .find(option => option.value === settingForm.api)
                    ?.label.replace('official', 'OpenAI') || settingForm.api
                "
              >
                <template #item="{ item }">
                  {{
                    settingPreset.api.optionObj
                      .find(option => option.value === item)
                      ?.label.replace('official', 'OpenAI') || item
                  }}
                </template>
              </SingleSelect>
            </SettingCard>

            <!-- Dynamic API Configuration -->
            <SettingSection
              v-for="platform in Object.keys(availableAPIs)"
              v-show="settingForm.api === platform"
              :key="platform"
            >
              <SettingCard v-for="item in getApiInputSettings(platform)" :key="item">
                <CustomInput
                  v-model="settingForm[item as SettingNames]"
                  :title="t(getLabel(item))"
                  :placeholder="t(getPlaceholder(item))"
                />
              </SettingCard>

              <SettingCard v-if="hasCustomModelsSupport(platform)" p1>
                <div class="flex flex-col items-start gap-2 p-3">
                  <CustomInput
                    v-model="newCustomModel[platform]"
                    :title="t('customModelsLabel')"
                    :placeholder="t('customModelPlaceholder')"
                    @keyup.enter="addCustomModel(platform)"
                  >
                    <template #input-extra>
                      <CustomButton
                        :icon="Plus"
                        text=""
                        class="bg-surface p-2!"
                        type="secondary"
                        @click="addCustomModel(platform)"
                      />
                    </template>
                  </CustomInput>
                  <div
                    v-if="customModelsMap[platform] && customModelsMap[platform].length > 0"
                    class="flex flex-wrap gap-1.5"
                  >
                    <span
                      v-for="model in customModelsMap[platform]"
                      :key="model"
                      class="inline-flex items-center gap-1 rounded-sm border border-border p-1 text-xs text-secondary hover:bg-accent/20"
                    >
                      {{ model }}
                      <button
                        class="inline-flex items-center justify-center rounded-sm p-1 text-danger hover:bg-danger/10"
                        @click="removeCustomModel(platform, model)"
                      >
                        <component :is="X" :size="12" />
                      </button>
                    </span>
                  </div>
                </div>
              </SettingCard>
              <SettingCard v-for="item in getApiSelectSettings(platform)" :key="item">
                <SingleSelect
                  v-model="settingForm[item as SettingNames]"
                  :key-list="getMergedModelOptions(platform)"
                  :title="t(getLabel(item))"
                  :fronticon="false"
                  :placeholder="settingForm[item as SettingNames]"
                />
              </SettingCard>
              <SettingCard v-for="item in getApiNumSettings(platform)" :key="item">
                <CustomInput
                  v-model.number="settingForm[item as SettingNames]"
                  :title="t(getLabel(item))"
                  :placeholder="t(getPlaceholder(item))"
                  type="number"
                  :min="0"
                  :max="item.includes('Temperature') ? 2 : 32000"
                  :step="item.includes('Temperature') ? 0.1 : 1"
                />
              </SettingCard>
            </SettingSection>
          </div>

          <!-- Prompts Settings -->
          <div
            v-show="currentTab === 'prompts'"
            class="flex w-full flex-1 flex-col items-center gap-2 bg-bg-secondary p-1"
          >
            <!-- Prompt List -->
            <div
              class="flex h-full w-full flex-col gap-2 overflow-auto rounded-md border border-border-secondary p-2 shadow-sm"
            >
              <div class="flex items-center justify-between">
                <h3 class="text-center text-sm font-semibold text-main">
                  {{ $t('savedPrompts') }}
                </h3>
                <CustomButton
                  :icon="Plus"
                  text=""
                  :title="t('addPrompt')"
                  class="p-1!"
                  type="secondary"
                  @click="addNewPrompt"
                />
              </div>

              <div
                v-for="prompt in savedPrompts"
                :key="prompt.id"
                class="rounded-md border border-border bg-surface p-3"
              >
                <div class="flex items-start justify-between">
                  <div class="flex flex-1 flex-wrap items-center gap-2">
                    <input
                      v-if="editingPromptId === prompt.id"
                      v-model="editingPrompt.name"
                      class="max-w-37.5 min-w-25 flex-1 rounded-md border border-border px-2 py-1 text-sm font-semibold text-secondary focus:border-accent focus:outline-none"
                      @blur="savePromptEdit"
                      @keyup.enter="savePromptEdit"
                    />
                    <span v-else class="text-sm font-semibold text-main">{{ prompt.name }}</span>
                  </div>
                  <div class="flex shrink-0 gap-1">
                    <CustomButton
                      type="secondary"
                      :title="t('edit')"
                      :icon="Edit2"
                      class="border-none! bg-surface! p-1.5!"
                      :icon-size="14"
                      text=""
                      @click="startEditPrompt(prompt)"
                    />
                    <CustomButton
                      v-if="savedPrompts.length > 1"
                      class="border-none! bg-surface! p-1.5!"
                      :title="t('delete')"
                      type="secondary"
                      :icon="Trash2"
                      text=""
                      :icon-size="14"
                      @click="deletePrompt(prompt.id)"
                    />
                  </div>
                </div>

                <div v-if="editingPromptId === prompt.id" class="mt-3 border-t border-t-border pt-3">
                  <label class="mb-1 block text-xs font-semibold text-secondary">{{ $t('systemPrompt') }}</label>
                  <textarea
                    v-model="editingPrompt.systemPrompt"
                    class="w-full rounded-sm border border-border bg-bg-secondary px-2 py-1 text-sm leading-normal text-main transition-all duration-200 ease-apple focus:border-accent focus:outline-none"
                    rows="3"
                    :placeholder="$t('systemPromptPlaceholder')"
                  />

                  <label class="mb-1 block text-xs font-semibold text-secondary">{{ $t('userPrompt') }}</label>
                  <textarea
                    v-model="editingPrompt.userPrompt"
                    class="w-full rounded-sm border border-border bg-bg-secondary px-2 py-1 text-sm leading-normal text-main transition-all duration-200 ease-apple focus:border-accent focus:outline-none"
                    rows="3"
                    :placeholder="$t('userPromptPlaceholder')"
                  />

                  <div class="mt-3 flex gap-2">
                    <CustomButton type="primary" class="flex-1" :text="t('save')" @click="savePromptEdit" />
                    <CustomButton type="secondary" class="flex-1" :text="t('cancel')" @click="cancelEdit" />
                  </div>
                </div>

                <div v-else class="mt-2">
                  <p class="overflow-hidden text-xs font-semibold text-ellipsis text-secondary">
                    {{ prompt.systemPrompt.substring(0, 100) }}{{ prompt.systemPrompt.length > 100 ? '...' : '' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Tools Settings -->
          <div
            v-show="currentTab === 'tools'"
            class="w-full flex-1 items-center gap-2 overflow-hidden bg-bg-secondary p-1"
          >
            <!-- Word Tools Section -->
            <div
              class="flex h-full w-full flex-col gap-2 overflow-auto rounded-md border border-border-secondary p-2 shadow-sm"
            >
              <div class="rounded-md border border-border-secondary p-1 shadow-sm">
                <h3 class="text-center text-sm font-semibold text-accent/70">
                  {{ t('wordTools') }}
                </h3>
              </div>
              <div class="rounded-md border border-border-secondary p-1 shadow-sm">
                <p class="bord text-xs leading-normal font-medium wrap-break-word text-secondary">
                  {{ t('wordToolsDescription') }}
                </p>
              </div>
              <div class="flex flex-col gap-2">
                <div
                  v-for="tool in wordToolsList"
                  :key="tool.name"
                  class="flex items-center gap-2 rounded-md border border-border bg-surface p-2 hover:border-accent"
                >
                  <input
                    :id="'tool-' + tool.name"
                    type="checkbox"
                    :checked="isToolEnabled(tool.name, !isGeneralTool(tool.name))"
                    class="h-4 w-4 cursor-pointer"
                    @change="toggleTool(tool.name, !isGeneralTool(tool.name))"
                  />
                  <div class="flex flex-col" @click="toggleTool(tool.name, !isGeneralTool(tool.name))">
                    <label :for="'tool-' + tool.name" class="text-xs font-semibold text-secondary">{{
                      $t(`wordTool_${tool.name}`)
                    }}</label>
                    <span class="text-xs text-secondary/90">
                      {{ $t(`wordTool_${tool.name}_desc`) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Built-in Prompts Settings -->
          <div
            v-show="currentTab === 'builtinPrompts'"
            class="flex w-full flex-1 items-center gap-2 overflow-hidden bg-bg-secondary p-1"
          >
            <div
              class="flex h-full w-full flex-col gap-2 overflow-auto rounded-md border border-border-secondary p-2 shadow-sm"
            >
              <div class="rounded-md border border-border-secondary p-1 shadow-sm">
                <h3 class="text-center text-sm font-semibold text-accent/70">
                  {{ t('builtinPrompts') || 'Built-in Prompts' }}
                </h3>
              </div>
              <div class="rounded-md border border-border-secondary p-1 shadow-sm">
                <p class="bord text-xs leading-normal font-medium wrap-break-word text-secondary">
                  {{
                    t('builtinPromptsDescription', {
                      language: '${language}',
                      text: '${text}',
                    }) ||
                    'Customize the system and user prompts for built-in tools like Translate, Polish, Academic, Summary, and Grammar.'
                  }}
                </p>
              </div>

              <div
                v-for="(promptConfig, key) in builtInPromptsData"
                :key="key"
                class="flex flex-col gap-2 rounded-md border border-border bg-surface p-2 hover:border-2 hover:border-accent"
              >
                <div class="flex flex-row items-start justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-secondary">{{ t(key) || key }}</span>
                  </div>
                  <div class="prompt-actions">
                    <CustomButton
                      :icon="editingBuiltinPromptKey === key ? Save : Edit2"
                      text=""
                      :title="editingBuiltinPromptKey === key ? t('save') : t('edit')"
                      class="border-none bg-surface! p-1.5!"
                      type="secondary"
                      :icon-size="14"
                      @click="toggleEditBuiltinPrompt(key)"
                    />
                    <CustomButton
                      v-if="isBuiltinPromptModified(key)"
                      :icon="RotateCcwIcon"
                      text=""
                      :title="t('reset')"
                      class="border-none bg-surface! p-1.5!"
                      type="secondary"
                      :icon-size="14"
                      @click="resetBuiltinPrompt(key)"
                    />
                  </div>
                </div>

                <div v-if="editingBuiltinPromptKey === key">
                  <label class="mt-2 block text-xs font-semibold text-secondary">{{ $t('systemPrompt') }}</label>
                  <textarea
                    v-model="editingBuiltinPrompt.system"
                    class="min-h-20 w-full rounded-md border border-border bg-bg-secondary p-2 text-xs text-main transition-all duration-200 ease-apple focus:border-accent focus:outline-none"
                    rows="3"
                    :placeholder="$t('systemPromptPlaceholder')"
                  />

                  <label class="mt-2 block text-xs font-semibold text-secondary">{{ $t('userPrompt') }}</label>
                  <textarea
                    v-model="editingBuiltinPrompt.user"
                    class="min-h-20 w-full rounded-md border border-border bg-bg-secondary p-2 text-xs text-main transition-all duration-200 ease-apple focus:border-accent focus:outline-none"
                    rows="4"
                    :placeholder="$t('userPromptPlaceholder')"
                  />
                </div>

                <div v-else class="mt-2">
                  <p class="mb-2 text-xs font-semibold text-secondary">{{ $t('systemPrompt') }}:</p>
                  <p class="text-xs leading-normal wrap-break-word text-secondary">
                    {{ getSystemPromptPreview(promptConfig.system) }}
                  </p>
                  <p class="mt-2 mb-2 text-xs font-semibold text-secondary">{{ $t('userPrompt') }}:</p>
                  <p class="text-xs leading-normal wrap-break-word text-secondary">
                    {{ getUserPromptPreview(promptConfig.user) }}
                  </p>
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
import {
  ArrowLeft,
  Cpu,
  Edit2,
  Globe,
  MessageSquare,
  Plus,
  RotateCcwIcon,
  Save,
  Settings,
  Trash2,
  Wrench,
  X,
} from 'lucide-vue-next'
import { onBeforeMount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import CustomButton from '@/components/CustomButton.vue'
import CustomInput from '@/components/CustomInput.vue'
import SettingCard from '@/components/SettingCard.vue'
import SettingSection from '@/components/SettingSection.vue'
import SingleSelect from '@/components/SingleSelect.vue'
import { getLabel, getPlaceholder } from '@/utils/common'
import { availableAPIs, buildInPrompt } from '@/utils/constant'
import { getGeneralToolDefinitions } from '@/utils/generalTools'
import useSettingForm from '@/utils/settingForm'
import { Setting_Names, SettingNames, settingPreset } from '@/utils/settingPreset'
import { getWordToolDefinitions } from '@/utils/wordTools'
const { t } = useI18n()
const router = useRouter()
const settingForm = useSettingForm()

const currentTab = ref('provider')

// Word tools list
const wordToolsList = [...getGeneralToolDefinitions(), ...getWordToolDefinitions()]

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
const editingPromptId = ref<string>('')
const editingPrompt = ref<Prompt>({
  id: '',
  name: '',
  systemPrompt: '',
  userPrompt: '',
})

// Built-in prompts management
interface BuiltinPromptConfig {
  system: (language: string) => string
  user: (text: string, language: string) => string
}

type BuiltinPromptKey = 'translate' | 'polish' | 'academic' | 'summary' | 'grammar'

const builtInPromptsData = ref<Record<BuiltinPromptKey, BuiltinPromptConfig>>({
  translate: { ...buildInPrompt.translate },
  polish: { ...buildInPrompt.polish },
  academic: { ...buildInPrompt.academic },
  summary: { ...buildInPrompt.summary },
  grammar: { ...buildInPrompt.grammar },
})

const editingBuiltinPromptKey = ref<BuiltinPromptKey | ''>('')
const editingBuiltinPrompt = ref<{
  system: string
  user: string
}>({
  system: '',
  user: '',
})

const originalBuiltInPrompts = { ...buildInPrompt }

// Tool enable/disable state
const enabledWordTools = ref<Set<string>>(new Set())
const enabledGeneralTools = ref<Set<string>>(new Set())

const tabs = [
  { id: 'general', label: 'general', defaultLabel: 'General', icon: Globe },
  {
    id: 'provider',
    label: 'apiProvider',
    defaultLabel: 'API Provider',
    icon: Cpu,
  },
  {
    id: 'prompts',
    label: 'prompts',
    defaultLabel: 'Prompts',
    icon: MessageSquare,
  },
  {
    id: 'builtinPrompts',
    label: 'builtinPrompts',
    defaultLabel: 'Built-in Prompts',
    icon: Settings,
  },
  {
    id: 'tools',
    label: 'tools',
    defaultLabel: 'Tools',
    icon: Wrench,
  },
]

const getApiInputSettings = (platform: string) => {
  return Object.keys(settingForm.value).filter(
    key =>
      key.startsWith(platform) && settingPreset[key as SettingNames].type === 'input' && !key.endsWith('CustomModel'),
  )
}

const getApiNumSettings = (platform: string) => {
  return Object.keys(settingForm.value).filter(
    key => key.startsWith(platform) && settingPreset[key as SettingNames].type === 'inputNum',
  )
}

const getApiSelectSettings = (platform: string) => {
  return Object.keys(settingForm.value).filter(
    key => key.startsWith(platform) && settingPreset[key as SettingNames].type === 'select',
  )
}

const getCustomModelsKey = (platform: string): SettingNames | null => {
  const key = `${platform}CustomModels` as SettingNames
  return settingPreset[key] ? key : null
}

const loadCustomModels = () => {
  const platforms = ['official', 'atlascloud', 'gemini', 'ollama', 'groq']
  platforms.forEach(platform => {
    const key = getCustomModelsKey(platform)
    if (key && settingPreset[key].getFunc) {
      customModelsMap.value[platform] = settingPreset[key].getFunc() as string[]
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
    ;(settingPreset[key] as any).saveFunc(customModelsMap.value[platform])
    newCustomModel.value[platform] = ''
  }
}

const removeCustomModel = (platform: string, model: string) => {
  const key = getCustomModelsKey(platform)
  if (!key) return

  customModelsMap.value[platform] = customModelsMap.value[platform].filter(m => m !== model)
  ;(settingPreset[key] as any).saveFunc(customModelsMap.value[platform])

  // If the removed model was selected, switch to first available
  const selectKey = `${platform}ModelSelect` as SettingNames
  if (settingForm.value[selectKey] === model) {
    const options = getMergedModelOptions(platform)
    if (options.length > 0) {
      ;(settingForm.value as any)[selectKey] = options[0]
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
  Setting_Names.forEach(key => {
    watch(
      () => settingForm.value[key],
      () => {
        if (settingPreset[key].saveFunc) {
          ;(settingPreset[key] as any).saveFunc(settingForm.value[key])
          console.log(`Saved setting ${key} via custom saveFunc with value: ${settingForm.value[key]}`)
          return
        }
        localStorage.setItem(settingPreset[key].saveKey || key, settingForm.value[key] as string)
        console.log(`Saved setting ${key} to localStorage with value: ${settingForm.value[key]}`)
      },
      { deep: true },
    )
  })
}

const loadPrompts = () => {
  const stored = localStorage.getItem('savedPrompts')
  if (stored) {
    try {
      savedPrompts.value = JSON.parse(stored)
      return
    } catch {
      localStorage.removeItem('savedPrompts')
    }
  }
  savedPrompts.value = [
    {
      id: 'default',
      name: 'Default',
      systemPrompt: settingForm.value.systemPrompt || '',
      userPrompt: settingForm.value.userPrompt || '',
    },
  ]
  savePromptsToStorage()
}

const savePromptsToStorage = () => {
  localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts.value))
}

const addNewPrompt = () => {
  const newPrompt: Prompt = {
    id: `prompt_${Date.now()}`,
    name: `Prompt ${savedPrompts.value.length + 1}`,
    systemPrompt: '',
    userPrompt: '',
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
  const index = savedPrompts.value.findIndex(p => p.id === editingPromptId.value)
  if (index !== -1) {
    savedPrompts.value[index] = { ...editingPrompt.value }
    savePromptsToStorage()
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
  }
}

// Built-in prompts functions
const loadBuiltInPrompts = () => {
  const stored = localStorage.getItem('customBuiltInPrompts')
  if (stored) {
    try {
      const customPrompts = JSON.parse(stored)
      Object.keys(customPrompts).forEach(key => {
        const typedKey = key as BuiltinPromptKey
        if (builtInPromptsData.value[typedKey]) {
          builtInPromptsData.value[typedKey] = {
            system: (language: string) => customPrompts[key].system.replace('${language}', language),
            user: (text: string, language: string) =>
              customPrompts[key].user.replace('${text}', text).replace('${language}', language),
          }
        }
      })
    } catch (error) {
      console.error('Error loading custom built-in prompts:', error)
    }
  }
}

const saveBuiltInPrompts = () => {
  const customPrompts: Record<string, { system: string; user: string }> = {}
  Object.keys(builtInPromptsData.value).forEach(key => {
    const typedKey = key as BuiltinPromptKey
    customPrompts[key] = {
      system: builtInPromptsData.value[typedKey].system('${language}'),
      user: builtInPromptsData.value[typedKey].user('${text}', '${language}'),
    }
  })
  localStorage.setItem('customBuiltInPrompts', JSON.stringify(customPrompts))
}

const toggleEditBuiltinPrompt = (key: BuiltinPromptKey) => {
  if (editingBuiltinPromptKey.value === key) {
    builtInPromptsData.value[key] = {
      system: (language: string) => editingBuiltinPrompt.value.system.replace(/\$\{language\}/g, language),
      user: (text: string, language: string) =>
        editingBuiltinPrompt.value.user.replace(/\$\{text\}/g, text).replace(/\$\{language\}/g, language),
    }
    saveBuiltInPrompts()
    editingBuiltinPromptKey.value = ''
  } else {
    editingBuiltinPromptKey.value = key
    editingBuiltinPrompt.value = {
      system: builtInPromptsData.value[key].system('${language}'),
      user: builtInPromptsData.value[key].user('${text}', '${language}'),
    }
  }
}

const isBuiltinPromptModified = (key: BuiltinPromptKey): boolean => {
  const current = {
    system: builtInPromptsData.value[key].system('English'),
    user: builtInPromptsData.value[key].user('sample text', 'English'),
  }
  const original = {
    system: originalBuiltInPrompts[key].system('English'),
    user: originalBuiltInPrompts[key].user('sample text', 'English'),
  }
  return current.system !== original.system || current.user !== original.user
}

const resetBuiltinPrompt = (key: BuiltinPromptKey) => {
  builtInPromptsData.value[key] = { ...originalBuiltInPrompts[key] }
  saveBuiltInPrompts()
  if (editingBuiltinPromptKey.value === key) {
    editingBuiltinPromptKey.value = ''
  }
}

const getSystemPromptPreview = (systemFunc: (language: string) => string): string => {
  const full = systemFunc('English')
  return full.length > 100 ? full.substring(0, 100) + '...' : full
}

const getUserPromptPreview = (userFunc: (text: string, language: string) => string): string => {
  const full = userFunc('[selected text]', 'English')
  return full.length > 100 ? full.substring(0, 100) + '...' : full
}

const loadToolPreferences = () => {
  const wordTools = localStorage.getItem('enabledWordTools')
  const generalTools = localStorage.getItem('enabledGeneralTools')

  if (wordTools) {
    try {
      enabledWordTools.value = new Set(JSON.parse(wordTools))
    } catch {
      enabledWordTools.value = new Set(getWordToolDefinitions().map(t => t.name))
    }
  } else {
    enabledWordTools.value = new Set(getWordToolDefinitions().map(t => t.name))
  }

  if (generalTools) {
    try {
      enabledGeneralTools.value = new Set(JSON.parse(generalTools))
    } catch {
      const generalToolNames = getGeneralToolDefinitions().map(t => t.name)
      enabledGeneralTools.value = new Set(generalToolNames)
    }
  } else {
    const generalToolNames = getGeneralToolDefinitions().map(t => t.name)
    enabledGeneralTools.value = new Set(generalToolNames)
  }
}

const saveToolPreferences = () => {
  localStorage.setItem('enabledWordTools', JSON.stringify([...enabledWordTools.value]))
  localStorage.setItem('enabledGeneralTools', JSON.stringify([...enabledGeneralTools.value]))
}

const toggleTool = (toolName: string, isWordTool: boolean) => {
  if (isWordTool) {
    if (enabledWordTools.value.has(toolName)) {
      enabledWordTools.value.delete(toolName)
    } else {
      enabledWordTools.value.add(toolName)
    }
  } else {
    if (enabledGeneralTools.value.has(toolName)) {
      enabledGeneralTools.value.delete(toolName)
    } else {
      enabledGeneralTools.value.add(toolName)
    }
  }
  saveToolPreferences()
}

const isToolEnabled = (toolName: string, isWordTool: boolean): boolean => {
  return isWordTool ? enabledWordTools.value.has(toolName) : enabledGeneralTools.value.has(toolName)
}

const isGeneralTool = (toolName: string): boolean => {
  const generalToolNames = getGeneralToolDefinitions().map(t => t.name)
  return generalToolNames.includes(toolName as any)
}

onBeforeMount(() => {
  loadPrompts()
  loadCustomModels()
  loadBuiltInPrompts()
  loadToolPreferences()
  addWatch()
})

function backToHome() {
  router.push('/')
}
</script>
