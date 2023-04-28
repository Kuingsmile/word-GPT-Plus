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
import { AxiosProxyConfig } from 'axios'
import { Configuration, ConfigurationParameters, CreateChatCompletionRequest, OpenAIApi } from 'openai'
import { useRouter } from 'vue-router'
import { localStorageKey, languageMap, buildInPrompt } from '@/utils/constant'
import { promptDbInstance } from '@/store/promtStore'
import { IStringKeyMap, opts } from '@/types'
import { CirclePlus, Remove } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ChatGPTUnofficialProxyAPI, ChatMessage } from 'chatgpt'

const replyLanguageList = Object.values(languageMap).map((key) => ({
  label: key,
  value: key
}))

const api = ref<'web-api' | 'official'>('web-api')
const apiKey = ref('')
const accessToken = ref('')
const localLanguage = ref('en')
const temperature = ref(0.7)
const maxTokens = ref(100)
const model = ref('gpt-3.5-turbo')
const webModel = ref('default')
const replyLanguage = ref('English')
const basePath = ref('')
const proxy = ref<AxiosProxyConfig | false>(false)

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
  api.value = localStorage.getItem(localStorageKey.api) as 'web-api' | 'official' ?? 'web-api'
  apiKey.value = localStorage.getItem(localStorageKey.apiKey) ?? ''
  accessToken.value = localStorage.getItem(localStorageKey.accessToken) ?? ''
  localLanguage.value = localStorage.getItem(localStorageKey.localLanguage) ?? 'en'
  temperature.value = Number(localStorage.getItem(localStorageKey.temperature)) ?? 0.7
  maxTokens.value = Number(localStorage.getItem(localStorageKey.maxTokens)) ?? 100
  model.value = localStorage.getItem(localStorageKey.model) ?? 'gpt-3.5-turbo'
  webModel.value = localStorage.getItem(localStorageKey.webModel) ?? 'default'
  replyLanguage.value = localStorage.getItem(localStorageKey.replyLanguage) ?? 'English'
  basePath.value = localStorage.getItem(localStorageKey.basePath) ?? ''
  proxy.value = localStorage.getItem(localStorageKey.enableProxy) === 'false'
    ? false
    : JSON.parse(localStorage.getItem(localStorageKey.proxy) || 'false')
  insertType.value = localStorage.getItem(localStorageKey.insertType) ?? 'replace' as 'replace' | 'append' | 'newLine' | 'NoAction'
  systemPrompt.value = localStorage.getItem(localStorageKey.defaultSystemPrompt) ?? 'Act like a personal assistant.'
  await getSystemPromptList()
  if (systemPromptList.value.find((item) => item.value === systemPrompt.value)) {
    systemPromptSelected.value = systemPrompt.value
  }
  prompt.value = localStorage.getItem(localStorageKey.defaultPrompt) ?? ''
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

function setConfig (apiKey: string, basePath?: string): Configuration {
  const configParams: ConfigurationParameters = {
    apiKey
  }
  if (basePath) {
    configParams.basePath = basePath
  }
  const config = new Configuration(configParams)
  delete config.baseOptions.headers['User-Agent']
  return config
}

function setUnofficalConfig (accessToken: string): opts {
  const configParams: opts = {
    accessToken,
    apiReverseProxyUrl: 'https://ai.fakeopen.com/api/conversation'
  }
  return configParams
}

async function createChatCompletionStream (
  config: Configuration,
  messages: any[],
  maxTokens?: number,
  temperature?: number,
  model?: string,
  proxy?: AxiosProxyConfig | false
): Promise<void> {
  const openai = new OpenAIApi(config)
  const requestConfig: CreateChatCompletionRequest = {
    model: model ?? 'gpt-3.5-turbo',
    messages,
    temperature: temperature ?? 0.7,
    max_tokens: maxTokens ?? 400
  }
  let response
  let data
  try {
    response = await openai.createChatCompletion(requestConfig, {
      proxy: proxy ?? false,
      timeout: 30000
    })
    data = response.data
    if (response.status === 200) {
      result.value = data.choices[0].message?.content.replace(/\\n/g, '\n') ?? ''
      historyDialog.value.push({
        role: 'assistant',
        content: result.value
      })
    } else {
      result.value = response.statusText?.toString() ?? 'error'
      errorIssue.value = true
      console.log(response)
    }
  } catch (error) {
    result.value = String(error)
    errorIssue.value = true
    console.error(error)
  }
  loading.value = false
}

async function createChatCompletionUnoffical (
  config: opts,
  messages: any[]
) : Promise<void> {
  const unOfficalAPI = new ChatGPTUnofficialProxyAPI(config)
  let response
  try {
    response = await unOfficalAPI.sendMessage(
      messages[0] + '\n' + messages[1],
      {
        timeoutMs: 30000,
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
          insertResult()
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

function insertResult () {
  const paragraph = result.value.replace(/\n+/g, '\n').replace(/\r+/g, '\n').split('\n')
  switch (insertType.value) {
    case 'replace':
      Word.run(async (context) => {
        const range = context.document.getSelection()
        range.insertText(paragraph[0], 'Replace')
        for (let i = paragraph.length - 1; i > 0; i--) {
          range.insertParagraph(paragraph[i], 'After')
        }
        await context.sync()
      })
      break
    case 'append':
      Word.run(async (context) => {
        const range = context.document.getSelection()
        range.insertText(paragraph[0], 'End')
        for (let i = paragraph.length - 1; i > 0; i--) {
          range.insertParagraph(paragraph[i], 'After')
        }
        await context.sync()
      })
      break
    case 'newLine':
      Word.run(async (context) => {
        const range = context.document.getSelection()
        for (let i = paragraph.length - 1; i >= 0; i--) {
          range.insertParagraph(paragraph[i], 'After')
        }
        await context.sync()
      })
      break
    case 'NoAction':
      break
  }
}

async function template (taskType: keyof typeof buildInPrompt | 'custom') {
  loading.value = true
  let systemMessage
  let userMessage
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
    systemMessage = systemPrompt.value
    userMessage = `Reply in ${replyLanguage.value} ${prompt.value} ${selectedText}`
  } else {
    systemMessage = buildInPrompt[taskType].system(replyLanguage.value)
    userMessage = buildInPrompt[taskType].user(selectedText, replyLanguage.value)
  }
  if (api.value === 'official' && apiKey.value) {
    const config = setConfig(apiKey.value, basePath.value)
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
    await createChatCompletionStream(
      config,
      historyDialog.value,
      maxTokens.value,
      temperature.value,
      model.value,
      proxy.value
    )
  } else if (api.value === 'web-api' && accessToken.value) {
    const config = setUnofficalConfig(accessToken.value)
    await createChatCompletionUnoffical(config, [systemMessage, userMessage])
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
    insertResult()
  }
}

function checkApiKey () {
  if (apiKey.value === '' && accessToken.value === '') {
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
  historyDialog.value.push({
    role: 'user',
    content: 'continue'
  })
  if (api.value === 'official') {
    try {
      await createChatCompletionStream(
        setConfig(apiKey.value, basePath.value),
        historyDialog.value,
        maxTokens.value,
        temperature.value,
        model.value,
        proxy.value
      )
    } catch (error) {
      result.value = String(error)
      errorIssue.value = true
      console.error(error)
    }
  } else {
    try {
      const config = setUnofficalConfig(accessToken.value)
      const unOfficalAPI = new ChatGPTUnofficialProxyAPI(config)
      const response = await unOfficalAPI.sendMessage(
        'continue',
        {
          timeoutMs: 30000,
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
            insertResult()
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
  insertResult()
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
