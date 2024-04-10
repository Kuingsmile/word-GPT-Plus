<template>
  <div class="container">
    <el-form
      label-position="left"
      label-width="70px"
    >
      <el-form-item>
        <template #label>
          <span>{{ $t('homeSystem') }}</span>
        </template>
        <el-input
          v-model="systemPrompt"
          clearable
          size="small"
          :placeholder="$t('homeSystemDescription')"
        />
        <span>
          <el-select
            v-model="systemPromptSelected"
            size="small"
            placeholder="Select a system prompt"
            @change="handelSystemPromptChange"
          >
            <el-option
              v-for="item in systemPromptList"
              :key="item.value"
              :label="item.key"
              :value="item.value"
            />
          </el-select>
          <el-icon
            color="#409EFF"
            style="cursor: pointer;margin-left: 5px;vertical-align: middle;"
            size="15px"
            @click="addSystemPromptVisible = true"
          >
            <CirclePlus />
          </el-icon>
          <el-icon
            color="red"
            style="cursor: pointer;margin-left: 5px;vertical-align: middle;"
            size="15px"
            @click="removeSystemPromptVisible = true"
          >
            <Remove />
          </el-icon>
        </span>
      </el-form-item>
      <el-form-item>
        <template #label>
          <span>{{ $t('homePrompt') }}</span>
        </template>
        <el-input
          v-model="prompt"
          autofocus
          clearable
          size="small"
          :placeholder="$t('homePromptDescription')"
        />
        <span>
          <el-select
            v-model="promptSelected"
            size="small"
            placeholder="Select a prompt"
            @change="handelPromptChange"
          >
            <el-option
              v-for="item in promptList"
              :key="item.value"
              :label="item.key"
              :value="item.value"
            />
          </el-select>
          <el-icon
            color="#409EFF"
            style="cursor: pointer;margin-left: 5px;vertical-align: middle;"
            size="15px"
            @click="addPromptVisible = true"
          >
            <CirclePlus />
          </el-icon>
          <el-icon
            color="red"
            style="cursor: pointer;margin-left: 5px;vertical-align: middle;"
            size="15px"
            @click="removePromptVisible = true"
          >
            <Remove />
          </el-icon>
        </span>
      </el-form-item>
      <el-form-item>
        <template #label>
          <span>{{ $t('settingReplyLanguage') }}</span>
        </template>
        <el-select
          v-model="replyLanguage"
          size="small"
          placeholder="Select a reply language"
          @change="handelReplyLanguageChange"
        >
          <el-option
            v-for="item in replyLanguageList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <template #label>
          <span>{{ $t('insertType') }}</span>
        </template>
        <el-select
          v-model="insertType"
          size="small"
          placeholder="Select a insert type"
          @change="handelInsertTypeChange"
        >
          <el-option
            v-for="item in insertTypeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <div
      style="width: 100%"
    >
      <el-progress
        v-if="loading"
        :percentage="50"
        indeterminate
        :duration="5"
        status="warning"
        style="widows: 100%;"
      />
    </div>
    <el-button-group
      class="input-group"
      style="margin-top: 5px;"
    >
      <el-button
        class="api-button"
        type="primary"
        size="small"
        :disabled="loading"
        @click="translate"
      >
        {{ $t('translate') }}
      </el-button>
      <el-button
        class="api-button"
        type="primary"
        size="small"
        :disabled="loading"
        @click="summarize"
      >
        {{ $t('summarize') }}
      </el-button>
      <el-button
        class="api-button"
        type="primary"
        size="small"
        :disabled="loading"
        @click="polish"
      >
        {{ $t('polish') }}
      </el-button>
      <el-button
        class="api-button"
        type="primary"
        size="small"
        :disabled="loading"
        @click="grammar"
      >
        {{ $t('grammar') }}
      </el-button>
      <el-button
        class="api-button"
        type="primary"
        size="small"
        :disabled="loading"
        @click="academic"
      >
        {{ $t('academic') }}
      </el-button>
      <el-button
        class="api-button"
        type="warning"
        size="small"
        @click="settings"
      >
        {{ $t('settings') }}
      </el-button>
    </el-button-group>
    <div
      style="margin-top: 5px;align-items: center;display: flex;margin-bottom: 5px;"
    >
      <el-button-group>
        <el-button
          class="api-button"
          type="success"
          size="default"
          :disabled="loading"
          @click="StartChat"
        >
          {{ $t('start') }}
        </el-button>
        <el-button
          v-if="['web-api', 'azure', 'official', 'gemini', 'ollama'].includes(api)"
          class="api-button"
          type="success"
          size="default"
          :disabled="loading"
          @click="continueChat"
        >
          {{ $t('continue') }}
        </el-button>
      </el-button-group>
    </div>
    <div class="result-group">
      <el-input
        v-model="result"
        type="textarea"
        autosize
        :row="5"
        :aria-placeholder="$t('result')"
      />
    </div>
    <el-dialog
      v-model="addSystemPromptVisible"
      width="90%"
      :title="$t('addSystemPrompt')"
    >
      <el-form
        label-position="top"
        label-width="50px"
      >
        <el-form-item>
          <template #label>
            <span>{{ $t('addSystemPromptAlias') }}</span>
          </template>
          <el-input
            v-model="addSystemPromptAlias"
            clearable
            size="small"
            :placeholder="$t('addSystemPromptAliasDescription')"
          />
        </el-form-item>
        <el-form-item>
          <template #label>
            <span>{{ $t('homeSystem') }}</span>
          </template>
          <el-input
            v-model="addSystemPromptValue"
            clearable
            type="textarea"
            size="small"
            :placeholder="$t('addSystemPromptDescription')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button
          @click="addSystemPromptVisible = false"
        >
          {{ $t('cancel') }}
        </el-button>
        <el-button
          type="primary"
          @click="addSystemPrompt"
        >
          {{ $t('confirm') }}
        </el-button>
      </template>
    </el-dialog>
    <el-dialog
      v-model="addPromptVisible"
      width="90%"
      :title="$t('addPrompt')"
    >
      <el-form
        label-position="top"
        label-width="50px"
      >
        <el-form-item>
          <template #label>
            <span>{{ $t('addPromptAlias') }}</span>
          </template>
          <el-input
            v-model="addPromptAlias"
            clearable
            size="small"
            :placeholder="$t('addPromptAliasDescription')"
          />
        </el-form-item>
        <el-form-item>
          <template #label>
            <span>{{ $t('homePrompt') }}</span>
          </template>
          <el-input
            v-model="addPromptValue"
            clearable
            type="textarea"
            size="small"
            :placeholder="$t('homePromptDescription')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button
          @click="addPromptVisible = false"
        >
          {{ $t('cancel') }}
        </el-button>
        <el-button
          type="primary"
          @click="addPrompt"
        >
          {{ $t('confirm') }}
        </el-button>
      </template>
    </el-dialog>
    <el-dialog
      v-model="removeSystemPromptVisible"
      width="90%"
      :title="$t('removeSystemPrompt')"
    >
      <el-select
        v-model="removeSystemPromptValue"
        multiple
        filterable
        size="small"
        style="width: 100%;"
        placeholder="Select"
      >
        <el-option
          v-for="item in systemPromptList"
          :key="item.value"
          :label="item.key"
          :value="item.key"
        />
      </el-select>
      <template #footer>
        <el-button
          @click="removeSystemPromptVisible = false"
        >
          {{ $t('cancel') }}
        </el-button>
        <el-button
          type="primary"
          @click="removeSystemPrompt"
        >
          {{ $t('confirm') }}
        </el-button>
      </template>
    </el-dialog>
    <el-dialog
      v-model="removePromptVisible"
      width="90%"
      :title="$t('removePrompt')"
    >
      <el-select
        v-model="removePromptValue"
        multiple
        filterable
        size="small"
        style="width: 100%;"
        placeholder="Select"
      >
        <el-option
          v-for="item in promptList"
          :key="item.value"
          :label="item.key"
          :value="item.key"
        />
      </el-select>
      <template #footer>
        <el-button
          @click="removePromptVisible = false"
        >
          {{ $t('cancel') }}
        </el-button>
        <el-button
          type="primary"
          @click="removePrompt"
        >
          {{ $t('confirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { localStorageKey, languageMap, buildInPrompt, availableModels, availableModelsForPalm, availableModelsForGemini, availableModelsForOllama } from '@/utils/constant'
import { promptDbInstance } from '@/store/promtStore'
import { IStringKeyMap } from '@/types'
import { CirclePlus, Remove } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ChatGPTUnofficialProxyAPI, ChatMessage } from 'chatgpt'
import { checkAuth, forceNumber } from '@/utils/common'
import API from '@/api'

const replyLanguageList = Object.values(languageMap).map((key) => ({
  label: key,
  value: key
}))

const api = ref<'web-api' | 'official' | 'azure' | 'palm' | 'gemini' | 'ollama'>('official')
const apiKey = ref('')
const accessToken = ref('')
const azureAPIKey = ref('')
const palmAPIKey = ref('')
const geminiAPIKey = ref('')

const localLanguage = ref('en')
const replyLanguage = ref('English')

const webModel = ref('default')

const temperature = ref(0.7)
const maxTokens = ref(800)
const model = ref('gpt-3.5-turbo')
const basePath = ref('')

const azureAPIEndpoint = ref('')
const azureDeploymentName = ref('')
const azureMaxTokens = ref(800)
const azureTemperature = ref(0.7)

const palmAPIEndpoint = ref('https://generativelanguage.googleapis.com/v1beta2')
const palmMaxTokens = ref(800)
const palmTemperature = ref(0.7)
const palmModel = ref('text-bison-001')

const geminiMaxTokens = ref(800)
const geminiTemperature = ref(0.7)
const geminiModel = ref('gemini-pro')

const ollamaEndpoint = ref('')
const ollamaModel = ref('llama2')
const ollamaTemperature = ref(0.7)

const systemPrompt = ref('')
const systemPromptSelected = ref('')
const systemPromptList = ref<IStringKeyMap[]>([])
const addSystemPromptVisible = ref(false)
const addSystemPromptAlias = ref('')
const addSystemPromptValue = ref('')
const removeSystemPromptVisible = ref(false)
const removeSystemPromptValue = ref<any[]>([])

const prompt = ref('')
const promptSelected = ref('')
const promptList = ref<IStringKeyMap[]>([])
const addPromptVisible = ref(false)
const addPromptAlias = ref('')
const addPromptValue = ref('')
const removePromptVisible = ref(false)
const removePromptValue = ref<any[]>([])

const result = ref('res')
const loading = ref(false)
const router = useRouter()
const historyDialog = ref<any[]>([])
const parentMessageId = ref('')
const conversationId = ref('')

const jsonIssue = ref(false)
const errorIssue = ref(false)

const insertType = ref('replace')
const insertTypeList = [
  {
    label: 'replace',
    value: 'replace'
  },
  {
    label: 'append',
    value: 'append'
  },
  {
    label: 'newLine',
    value: 'newLine'
  },
  {
    label: 'NoAction',
    value: 'NoAction'
  }
]

async function getSystemPromptList () {
  const table = promptDbInstance.table('systemPrompt')
  const list = await table.toArray() as unknown as IStringKeyMap[]
  systemPromptList.value = list
}

async function addSystemPrompt () {
  const table = promptDbInstance.table('systemPrompt')
  await table.put({
    key: addSystemPromptAlias.value,
    value: addSystemPromptValue.value
  })
  addSystemPromptVisible.value = false
  getSystemPromptList()
}

async function removeSystemPrompt () {
  removeSystemPromptVisible.value = false
  const table = promptDbInstance.table('systemPrompt')
  for (const value of removeSystemPromptValue.value) {
    await table.delete(value)
  }
  removeSystemPromptValue.value = []
  getSystemPromptList()
}

async function removePrompt () {
  removePromptVisible.value = false
  const table = promptDbInstance.table('userPrompt')
  for (const value of removePromptValue.value) {
    await table.delete(value)
  }
  removePromptValue.value = []
  getPromptList()
}

function handelSystemPromptChange (val: string) {
  systemPrompt.value = val
  localStorage.setItem(localStorageKey.defaultSystemPrompt, val)
}

async function getPromptList () {
  const table = promptDbInstance.table('userPrompt')
  const list = await table.toArray() as unknown as IStringKeyMap[]
  promptList.value = list
}

async function addPrompt () {
  const table = promptDbInstance.table('userPrompt')
  await table.put({
    key: addPromptAlias.value,
    value: addPromptValue.value
  })
  addPromptVisible.value = false
  getPromptList()
}

function handelPromptChange (val: string) {
  prompt.value = val
  localStorage.setItem(localStorageKey.defaultPrompt, val)
}

onBeforeMount(async () => {
  api.value = localStorage.getItem(localStorageKey.api) as 'web-api' | 'official' | 'azure' | 'palm' | 'gemini' | 'ollama' || 'official'
  replyLanguage.value = localStorage.getItem(localStorageKey.replyLanguage) || 'English'
  localLanguage.value = localStorage.getItem(localStorageKey.localLanguage) || 'en'
  apiKey.value = localStorage.getItem(localStorageKey.apiKey) || ''
  accessToken.value = localStorage.getItem(localStorageKey.accessToken) || ''
  azureAPIKey.value = localStorage.getItem(localStorageKey.azureAPIKey) || ''
  palmAPIKey.value = localStorage.getItem(localStorageKey.palmAPIKey) || ''
  geminiAPIKey.value = localStorage.getItem(localStorageKey.geminiAPIKey) || ''
  webModel.value = localStorage.getItem(localStorageKey.webModel) || 'default'
  temperature.value = forceNumber(localStorage.getItem(localStorageKey.temperature)) || 0.7
  maxTokens.value = forceNumber(localStorage.getItem(localStorageKey.maxTokens)) || 800
  const modelTemp = localStorage.getItem(localStorageKey.model) || availableModels['gpt-3.5']
  if (Object.keys(availableModels).includes(modelTemp)) {
    model.value = availableModels[modelTemp]
  } else if (Object.values(availableModels).includes(modelTemp)) {
    model.value = modelTemp
  } else {
    model.value = availableModels['gpt-3.5']
  }
  basePath.value = localStorage.getItem(localStorageKey.basePath) || ''
  azureAPIEndpoint.value = localStorage.getItem(localStorageKey.azureAPIEndpoint) || ''
  azureDeploymentName.value = localStorage.getItem(localStorageKey.azureDeploymentName) || ''
  azureMaxTokens.value = forceNumber(localStorage.getItem(localStorageKey.azureMaxTokens)) || 800
  azureTemperature.value = forceNumber(localStorage.getItem(localStorageKey.azureTemperature)) || 0.7
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
  insertType.value = localStorage.getItem(localStorageKey.insertType) || 'replace' as 'replace' | 'append' | 'newLine' | 'NoAction'
  systemPrompt.value = localStorage.getItem(localStorageKey.defaultSystemPrompt) || 'Act like a personal assistant.'
  await getSystemPromptList()
  if (systemPromptList.value.find((item) => item.value === systemPrompt.value)) {
    systemPromptSelected.value = systemPrompt.value
  }
  prompt.value = localStorage.getItem(localStorageKey.defaultPrompt) || ''
  await getPromptList()
  if (promptList.value.find((item) => item.value === prompt.value)) {
    promptSelected.value = prompt.value
  }
})

function handelReplyLanguageChange (val: string) {
  replyLanguage.value = val
  localStorage.setItem(localStorageKey.replyLanguage, val)
}

function handelInsertTypeChange (val: string) {
  insertType.value = val as 'replace' | 'append' | 'newLine' | 'NoAction'
  localStorage.setItem(localStorageKey.insertType, val)
}

async function template (taskType: keyof typeof buildInPrompt | 'custom') {
  loading.value = true
  let systemMessage
  let userMessage = ''
  const getSeletedText = async () => {
    return Word.run(async (context) => {
      const range = context.document.getSelection()
      range.load('text')
      await context.sync()
      return range.text
    })
  }
  const selectedText = await getSeletedText()
  if (taskType === 'custom') {
    if (systemPrompt.value.includes('{language}')) {
      systemMessage = systemPrompt.value.replace('{language}', replyLanguage.value)
    } else {
      systemMessage = systemPrompt.value
    }
    if (userMessage.includes('{text}')) {
      userMessage = userMessage.replace('{text}', selectedText)
    } else {
      userMessage = `Reply in ${replyLanguage.value} ${prompt.value} ${selectedText}`
    }
  } else {
    systemMessage = buildInPrompt[taskType].system(replyLanguage.value)
    userMessage = buildInPrompt[taskType].user(selectedText, replyLanguage.value)
  }
  if (api.value === 'official' && apiKey.value) {
    const config = API.official.setConfig(apiKey.value, basePath.value)
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
    await API.official.createChatCompletionStream(
      config,
      historyDialog.value,
      result,
      historyDialog,
      errorIssue,
      loading,
      maxTokens.value,
      temperature.value,
      model.value
    )
  } else if (api.value === 'web-api' && accessToken.value) {
    const config = API.webapi.setUnofficalConfig(accessToken.value)
    await API.webapi.createChatCompletionUnoffical(
      config,
      [systemMessage, userMessage],
      parentMessageId,
      conversationId,
      jsonIssue,
      errorIssue,
      result,
      insertType,
      loading
    )
  } else if (api.value === 'azure' && azureAPIKey.value) {
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
    await API.azure.createChatCompletionStream(
      {
        azureAPIKey: azureAPIKey.value,
        azureAPIEndpoint: azureAPIEndpoint.value,
        azureDeploymentName: azureDeploymentName.value,
        messages: historyDialog.value,
        result,
        historyDialog,
        errorIssue,
        loading,
        maxTokens: azureMaxTokens.value,
        temperature: azureTemperature.value
      }
    )
  } else if (api.value === 'palm' && palmAPIKey.value) {
    await API.palm.createChatCompletionStream(
      palmAPIKey.value,
      palmAPIEndpoint.value,
      palmModel.value,
      `${systemMessage}\n${userMessage}`,
      result,
      errorIssue,
      loading,
      palmMaxTokens.value,
      palmTemperature.value
    )
  } else if (api.value === 'gemini' && geminiAPIKey.value) {
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
    await API.gemini.createChatCompletionStream(
      {
        geminiAPIKey: geminiAPIKey.value,
        messages: userMessage,
        result,
        historyDialog,
        errorIssue,
        loading,
        maxTokens: geminiMaxTokens.value,
        temperature: geminiTemperature.value,
        geminiModel: geminiModel.value
      }
    )
  } else if (api.value === 'ollama' && ollamaEndpoint.value) {
    historyDialog.value = [
      {
        role: 'user',
        content: systemMessage + '\n' + userMessage
      }
    ]
    await API.ollama.createChatCompletionStream(
      ollamaEndpoint.value,
      ollamaModel.value,
      historyDialog.value,
      result,
      historyDialog,
      errorIssue,
      loading,
      ollamaTemperature.value
    )
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

function checkApiKey () {
  const auth = {
    type: api.value,
    accessToken: accessToken.value,
    apiKey: apiKey.value,
    azureAPIKey: azureAPIKey.value,
    palmAPIKey: palmAPIKey.value,
    geminiAPIKey: geminiAPIKey.value
  }
  if (!checkAuth(auth)) {
    ElMessage.error('Set API Key or Access Token first')
    return false
  }
  return true
}

async function translate () {
  if (!checkApiKey()) return
  template('translate')
}

function summarize () {
  if (!checkApiKey()) return
  template('summary')
}

function polish () {
  if (!checkApiKey()) return
  template('polish')
}

function academic () {
  if (!checkApiKey()) return
  template('academic')
}

function grammar () {
  if (!checkApiKey()) return
  template('grammar')
}

function settings () {
  router.push('/settings')
}

function StartChat () {
  if (!checkApiKey()) return
  template('custom')
}

async function continueChat () {
  if (!checkApiKey()) return
  loading.value = true
  if (api.value === 'official') {
    historyDialog.value.push({
      role: 'user',
      content: 'continue'
    })
    try {
      await API.official.createChatCompletionStream(
        API.official.setConfig(apiKey.value, basePath.value),
        historyDialog.value,
        result,
        historyDialog,
        errorIssue,
        loading,
        maxTokens.value,
        temperature.value,
        model.value
      )
    } catch (error) {
      result.value = String(error)
      errorIssue.value = true
      console.error(error)
    }
  } else if (api.value === 'azure') {
    try {
      historyDialog.value.push({
        role: 'user',
        content: 'continue'
      })
      await API.azure.createChatCompletionStream(
        {
          azureAPIKey: azureAPIKey.value,
          azureAPIEndpoint: azureAPIEndpoint.value,
          azureDeploymentName: azureDeploymentName.value,
          messages: historyDialog.value,
          result,
          historyDialog,
          errorIssue,
          loading,
          maxTokens: azureMaxTokens.value,
          temperature: azureTemperature.value
        }
      )
    } catch (error) {
      result.value = String(error)
      errorIssue.value = true
      console.error(error)
    }
  } else if (api.value === 'gemini') {
    try {
      historyDialog.value.push(...[
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
      ])
      await API.gemini.createChatCompletionStream(
        {
          geminiAPIKey: geminiAPIKey.value,
          messages: 'continue',
          result,
          historyDialog,
          errorIssue,
          loading,
          maxTokens: geminiMaxTokens.value,
          temperature: geminiTemperature.value,
          geminiModel: geminiModel.value
        }
      )
    } catch (error) {
      result.value = String(error)
      errorIssue.value = true
      console.error(error)
    }
  } else if (api.value === 'ollama') {
    try {
      historyDialog.value.push({
        role: 'user',
        content: 'continue'
      })
      await API.ollama.createChatCompletionStream(
        ollamaEndpoint.value,
        ollamaModel.value,
        historyDialog.value,
        result,
        historyDialog,
        errorIssue,
        loading,
        ollamaTemperature.value
      )
    } catch (error) {
      result.value = String(error)
      errorIssue.value = true
      console.error(error)
    }
  } else if (api.value === 'web-api') {
    try {
      const config = API.webapi.setUnofficalConfig(accessToken.value)
      const unOfficalAPI = new ChatGPTUnofficialProxyAPI(config)
      const response = await unOfficalAPI.sendMessage(
        'continue',
        {
          parentMessageId: parentMessageId.value,
          conversationId: conversationId.value,
          onProgress: (partialResponse: ChatMessage) => {
            result.value = partialResponse.text
          }
        }
      )
      parentMessageId.value = response.parentMessageId ?? ''
      conversationId.value = response.conversationId ?? ''
      loading.value = false
    } catch (error) {
      console.error(error)
      if (String(error).includes('SyntaxError') && String(error).includes('JSON')) {
        let count = 0
        let oldResult = ''
        jsonIssue.value = true
        const interval = setInterval(() => {
          if (count > 30) {
            clearInterval(interval)
            jsonIssue.value = false
            loading.value = false
            API.common.insertResult(result, insertType)
          }
          if (oldResult !== result.value) {
            oldResult = result.value
            count = 0
          } else {
            count++
          }
        }, 100)
      } else {
        result.value = String(error)
        errorIssue.value = true
        loading.value = false
      }
    }
  }
  if (errorIssue.value === true) {
    errorIssue.value = false
    ElMessage.error('Something is wrong')
    return
  }
  API.common.insertResult(result, insertType)
}

</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
}

.input-group {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.api-button {
  margin-left: 10px;
  border-radius: 10px;
}

.result-group {
  width: 100%;
}

</style>
