<template>
  <div id="setting">
    <el-row
      class="view-title"
      align="middle"
      justify="center"
      style="font-size: 20px;color: black;"
    >
      {{ $t('settings') }}
    </el-row>
    <el-row
      class="setting-list"
      style="margin-top: 20px;"
    >
      <el-col
        :span="20"
        :offset="2"
      />
      <el-row
        style="width: 100%;display: flex;justify-content: center;align-items: center;flex-direction: column;"
      >
        <el-button
          type="primary"
          round
          plain
          style="margin-bottom: 5px;width: 100%;"
          @click="backToHome"
        >
          {{ $t('backToHome') }}
        </el-button>
        <el-form
          label-position="left"
          size="default"
          label-width="50%"
        >
          <el-form-item>
            <template #label>
              <span>
                {{ $t('settingChooseLanguage') }}
              </span>
            </template>
            <el-select
              v-model="currentUILanguage"
              size="small"
              :placeholder="$t('settingChooseLanguage')"
              @change="handleLocalLanguageChange"
            >
              <el-option
                v-for="item in languageList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <template #label>
              <span>
                {{ $t('chooseAPI') }}
              </span>
            </template>
            <el-select
              v-model="api"
              size="small"
              :placeholder="$t('chooseAPIDescription')"
              @change="handleApiChange"
            >
              <el-option
                v-for="item in apiList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="api === 'official'"
          >
            <template #label>
              <span>
                {{ $t('apiKey') }}
              </span>
            </template>
            <el-input
              v-model="apiKey"
              :placeholder="$t('apiKeyDescription')"
              size="small"
              @blur="handleApiKeyChange"
            />
          </el-form-item>
          <el-form-item
            v-if="api === 'web-api'"
          >
            <template #label>
              <span>
                {{ $t('accessToken') }}
              </span>
            </template>
            <el-input
              v-model="accessToken"
              :placeholder="$t('accessTokenDescription')"
              size="small"
              @blur="handleAccessTokenChange"
            />
          </el-form-item>
          <el-form-item
            v-if="api === 'official'"
          >
            <template #label>
              <span>
                {{ $t('settingBasePath') }}
              </span>
            </template>
            <el-input
              v-model="basePath"
              :placeholder="$t('settingBasePath')"
              size="small"
              @blur="handleBasePathChange"
            />
          </el-form-item>
          <el-form-item
            v-if="api === 'official'"
          >
            <template #label>
              <span>
                {{ $t('settingModel') }}
              </span>
            </template>
            <el-select
              v-model="model"
              size="small"
              :placeholder="$t('settingModel')"
              @change="handleModelChange"
            >
              <el-option
                v-for="item in modelList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="false"
          >
            <template #label>
              <span>
                {{ $t('settingModel') }}
              </span>
            </template>
            <el-select
              v-model="webModel"
              size="small"
              :placeholder="$t('settingModel')"
              @change="handleWebModelChange"
            >
              <el-option
                v-for="item in webModelList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="api === 'official'"
          >
            <template #label>
              <span>
                {{ $t('settingTemperature') }}
              </span>
            </template>
            <el-input-number
              v-model="temperature"
              :min="0"
              :max="2"
              :step="0.1"
              size="small"
              @change="handleTemperatureChange"
            />
          </el-form-item>
          <el-form-item
            v-if="api === 'official'"
          >
            <template #label>
              <span>
                {{ $t('settingMaxTokens') }}
              </span>
            </template>
            <el-input-number
              v-model="maxTokens"
              :min="1"
              :step="1"
              size="small"
              @change="handleMaxTokensChange"
            />
          </el-form-item>
          <el-form-item>
            <template #label>
              <span>
                {{ $t('settingReplyLanguage') }}
              </span>
            </template>
            <el-select
              v-model="replyLanguage"
              size="small"
              :placeholder="$t('settingReplyLanguage')"
              @change="handleReplyLanguageChange"
            >
              <el-option
                v-for="item in replyLanguageList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="api === 'official'"
          >
            <template #label>
              <span>
                {{ $t('settingProxy') }}
              </span>
            </template>
            <el-button
              type="primary"
              round
              plain
              size="small"
              @click="proxyVisible = true"
            >
              {{ $t('settingClickToShow') }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-row>
    </el-row>
    <el-dialog
      v-model="proxyVisible"
      width="100%"
      :title="$t('settingProxy')"
      :modal-append-to-body="false"
      center
    >
      <el-form
        label-position="top"
        label-width="120px"
      >
        <el-form-item>
          <template #label>
            <span>
              {{ $t('settingEnableProxy') }}
            </span>
          </template>
          <el-switch
            v-model="enableProxy"
            :active-text="$t('settingOpen')"
            :inactive-text="$t('settingClose')"
            @change="handleEnableProxyChange"
          />
        </el-form-item>
        <template v-if="enableProxy">
          <el-form-item>
            <template #label>
              <span>
                {{ $t('settingProxyProtocol') }}
              </span>
            </template>
            <el-input
              v-model="proxyProtocol"
              :placeholder="$t('settingProxyProtocol')"
              size="small"
            />
          </el-form-item>
          <el-form-item>
            <template #label>
              <span>
                {{ $t('settingProxyHost') }}
              </span>
            </template>
            <el-input
              v-model="proxyHost"
              :placeholder="$t('settingProxyHost')"
              size="small"
            />
          </el-form-item>
          <el-form-item>
            <template #label>
              <span>
                {{ $t('settingProxyPort') }}
              </span>
            </template>
            <el-input
              v-model="proxyPort"
              :placeholder="$t('settingProxyPort')"
              size="small"
            />
          </el-form-item>
          <el-form-item>
            <template #label>
              <span>
                {{ $t('settingProxyUsername') }}
              </span>
            </template>
            <el-input
              v-model="proxyUsername"
              :placeholder="$t('settingProxyUsername')"
              size="small"
            />
          </el-form-item>
          <el-form-item>
            <template #label>
              <span>
                {{ $t('settingProxyPassword') }}
              </span>
            </template>
            <el-input
              v-model="proxyPassword"
              :placeholder="$t('settingProxyPassword')"
              size="small"
            />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button
          round
          @click="cancelProxySetting"
        >
          {{ $t('cancel') }}
        </el-button>
        <el-button
          type="primary"
          round
          @click="confirmProxySetting"
        >
          {{ $t('confirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { languageMap, availableModels, localStorageKey, availableModelsForPlus } from '@/utils/constant'
import { useRouter } from 'vue-router'
import { AxiosProxyConfig } from 'axios'

const router = useRouter()

const languageList = [
  {
    label: 'English',
    value: 'en'
  },
  {
    label: '简体中文',
    value: 'zh-cn'
  }
]

const replyLanguageList = Object.values(languageMap).map((key) => ({
  label: key,
  value: key
}))

const modelList = Object.keys(availableModels).map((key) => ({
  label: availableModels[key],
  value: key
}))

const webModelList = Object.keys(availableModelsForPlus).map((key) => ({
  label: key,
  value: key
}))

const api = ref<'official' | 'web-api'>('web-api')
const currentUILanguage = ref('en')
const temperature = ref(0.7)
const maxTokens = ref(400)
const model = ref(availableModels['gpt-3.5'])
const webModel = ref('default')
const replyLanguage = ref('English')
const apiKey = ref('')
const accessToken = ref('')
const enableProxy = ref(false)
const proxyHost = ref('')
const proxyPort = ref('')
const proxyUsername = ref('')
const proxyPassword = ref('')
const proxyProtocol = ref('http')
const proxyVisible = ref(false)
const basePath = ref('')

const apiList = [
  {
    label: 'web-api',
    value: 'web-api'
  },
  {
    label: 'official',
    value: 'official'
  }
]

const { locale } = useI18n()

onBeforeMount(() => {
  initData()
})

function initData () {
  currentUILanguage.value = localStorage.getItem(localStorageKey.localLanguage) || 'en'
  temperature.value = forceNumber(localStorage.getItem(localStorageKey.temperature)) || 0.7
  maxTokens.value = forceNumber(localStorage.getItem(localStorageKey.maxTokens)) || 100
  model.value = localStorage.getItem(localStorageKey.model) || 'gpt-3.5-turbo'
  webModel.value = localStorage.getItem(localStorageKey.webModel) || 'default'
  replyLanguage.value = localStorage.getItem(localStorageKey.replyLanguage) || 'English'
  apiKey.value = localStorage.getItem(localStorageKey.apiKey) || ''
  api.value = localStorage.getItem(localStorageKey.api) as 'official' | 'web-api' || 'web-api'
  accessToken.value = localStorage.getItem(localStorageKey.accessToken) || ''
  enableProxy.value = localStorage.getItem(localStorageKey.enableProxy) === 'true'
  proxyHost.value = JSON.parse(localStorage.getItem(localStorageKey.proxy) || '{}').host || ''
  proxyPort.value = JSON.parse(localStorage.getItem(localStorageKey.proxy) || '{}').port || ''
  proxyUsername.value = JSON.parse(localStorage.getItem(localStorageKey.proxy) || '{}').username || ''
  proxyPassword.value = JSON.parse(localStorage.getItem(localStorageKey.proxy) || '{}').password || ''
  proxyProtocol.value = JSON.parse(localStorage.getItem(localStorageKey.proxy) || '{}').protocol || 'http'
  basePath.value = localStorage.getItem(localStorageKey.basePath) || ''
}

function handleLocalLanguageChange (val: string) {
  locale.value = val
  localStorage.setItem(localStorageKey.localLanguage, val)
}

function handleReplyLanguageChange (val: string) {
  localStorage.setItem(localStorageKey.replyLanguage, val)
}

function handleModelChange (val: string) {
  localStorage.setItem(localStorageKey.model, val)
}

function handleWebModelChange (val: string) {
  localStorage.setItem(localStorageKey.webModel, val)
}

function handleApiKeyChange () {
  localStorage.setItem(localStorageKey.apiKey, apiKey.value)
}

function handleAccessTokenChange () {
  localStorage.setItem(localStorageKey.accessToken, accessToken.value)
}

function handleApiChange (val: string) {
  console.log(val)
  localStorage.setItem(localStorageKey.api, val)
}

function handleBasePathChange () {
  localStorage.setItem(localStorageKey.basePath, basePath.value)
}

function handleTemperatureChange () {
  localStorage.setItem(localStorageKey.temperature, temperature.value.toString())
}

function handleMaxTokensChange () {
  localStorage.setItem(localStorageKey.maxTokens, maxTokens.value.toString())
}

function handleEnableProxyChange () {
  localStorage.setItem(localStorageKey.enableProxy, enableProxy.value.toString())
}

function cancelProxySetting () {
  proxyVisible.value = false
}

function confirmProxySetting () {
  proxyVisible.value = false
  const proxyToSave: AxiosProxyConfig = {
    host: proxyHost.value,
    port: forceNumber(proxyPort.value),
    protocol: proxyProtocol.value
  }
  if (proxyUsername.value && proxyPassword.value) {
    proxyToSave.auth = {
      username: proxyUsername.value,
      password: proxyPassword.value
    }
  }
  localStorage.setItem(localStorageKey.proxy, JSON.stringify(proxyToSave))
}

function backToHome () {
  router.push('/')
}

function forceNumber (val: any) {
  if (val === '') {
    return 0
  }
  return isNaN(Number(val)) ? 0 : Number(val)
}

</script>

<style lang='stylus'>
#setting
  height 100%
  overflow-y auto
</style>
