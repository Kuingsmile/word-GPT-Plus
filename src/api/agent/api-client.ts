import { ref } from 'vue'
import API from '../index'
import { AgentChatCompletionOptions } from './types'

export class AgentAPIClient {
  private options: AgentChatCompletionOptions
  private debugMode: boolean

  constructor(options: AgentChatCompletionOptions, debugMode = true) {
    this.options = options
    this.debugMode = debugMode
  }

  private debugLog(message: string, data?: any): void {
    if (this.debugMode) {
      console.log(`[Agent API] ${message}`, data || '')
    }
  }

  async callBaseAPI(messages: any[]): Promise<string> {
    const { agentBaseModeAPI } = this.options
    
    this.debugLog(`Calling base API: ${agentBaseModeAPI}`, { 
      message: messages,
      lastMessage: messages[messages.length - 1]?.content?.substring(0, 100) + '...'
    })
    
    switch (agentBaseModeAPI) {
      case 'official':
        return this.callOfficialAPI(messages)
      case 'azure':
        return this.callAzureAPI(messages)
      case 'gemini':
        return this.callGeminiAPI(messages)
      case 'groq':
        return this.callGroqAPI(messages)
      case 'ollama':
        return this.callOllamaAPI(messages)
      default:
        const error = `Unsupported base API: ${agentBaseModeAPI}`
        this.debugLog('Base API call failed', error)
        throw new Error(error)
    }
  }

  private async callOfficialAPI(messages: any[]): Promise<string> {
    return new Promise((resolve, reject) => {
      this.debugLog('Making official API call')
      const result = ref('')
      const historyDialog = ref([])
      const errorIssue = ref(false)
      const loading = ref(false)

      API.official.createChatCompletionStream({
        config: API.official.setConfig(
          this.options.apiKey!,
          this.options.officialBasePath
        ),
        messages,
        result,
        historyDialog,
        errorIssue,
        loading,
        maxTokens: this.options.maxTokens,
        temperature: this.options.temperature,
        model: this.options.officialModel
      }).then(() => {
        if (errorIssue.value) {
          this.debugLog('Official API call failed', errorIssue.value)
          reject(new Error(result.value))
        } else {
          this.debugLog('Official API call successful', { result: result.value })
          resolve(result.value)
        }
      }).catch((error) => {
        this.debugLog('Official API call error', error)
        reject(error)
      })
    })
  }

  private async callAzureAPI(messages: any[]): Promise<string> {
    return new Promise((resolve, reject) => {
      this.debugLog('Making Azure API call')
      const result = ref('')
      const historyDialog = ref([])
      const errorIssue = ref(false)
      const loading = ref(false)

      API.azure.createChatCompletionStream({
        azureAPIKey: this.options.azureAPIKey!,
        azureAPIEndpoint: this.options.azureAPIEndpoint!,
        azureDeploymentName: this.options.azureDeploymentName!,
        azureAPIVersion: this.options.azureAPIVersion,
        messages,
        result,
        historyDialog,
        errorIssue,
        loading,
        maxTokens: this.options.maxTokens,
        temperature: this.options.temperature
      }).then(() => {
        if (errorIssue.value) {
          this.debugLog('Azure API call failed', errorIssue.value)
          reject(new Error(result.value))
        } else {
          this.debugLog('Azure API call successful', { result: result.value })
          resolve(result.value)
        }
      }).catch((error) => {
        this.debugLog('Azure API call error', error)
        reject(error)
      })
    })
  }

  private async callGeminiAPI(messages: any[]): Promise<string> {
    return new Promise((resolve, reject) => {
      this.debugLog('Making Gemini API call')
      const result = ref('')
      const historyDialog = ref([])
      const errorIssue = ref(false)
      const loading = ref(false)

      API.gemini.createChatCompletionStream({
        geminiAPIKey: this.options.geminiAPIKey!,
        messages: Array.isArray(messages) ? messages[messages.length - 1]?.content : messages,
        result,
        historyDialog,
        errorIssue,
        loading,
        maxTokens: this.options.maxTokens,
        temperature: this.options.temperature,
        geminiModel: this.options.geminiModel
      }).then(() => {
        if (errorIssue.value) {
          this.debugLog('Gemini API call failed', errorIssue.value)
          reject(new Error(result.value))
        } else {
          this.debugLog('Gemini API call successful', { result: result.value })
          resolve(result.value)
        }
      }).catch((error) => {
        this.debugLog('Gemini API call error', error)
        reject(error)
      })
    })
  }

  private async callGroqAPI(messages: any[]): Promise<string> {
    return new Promise((resolve, reject) => {
      this.debugLog('Making Groq API call')
      const result = ref('')
      const historyDialog = ref([])
      const errorIssue = ref(false)
      const loading = ref(false)

      API.groq.createChatCompletionStream({
        groqAPIKey: this.options.groqAPIKey!,
        groqModel: this.options.groqModel!,
        messages,
        result,
        historyDialog,
        errorIssue,
        loading,
        maxTokens: this.options.maxTokens,
        temperature: this.options.temperature
      }).then(() => {
        if (errorIssue.value) {
          this.debugLog('Groq API call failed', errorIssue.value)
          reject(new Error(result.value))
        } else {
          this.debugLog('Groq API call successful', { result: result.value })
          resolve(result.value)
        }
      }).catch((error) => {
        this.debugLog('Groq API call error', error)
        reject(error)
      })
    })
  }

  private async callOllamaAPI(messages: any[]): Promise<string> {
    return new Promise((resolve, reject) => {
      this.debugLog('Making Ollama API call')
      const result = ref('')
      const historyDialog = ref([])
      const errorIssue = ref(false)
      const loading = ref(false)

      API.ollama.createChatCompletionStream({
        ollamaEndpoint: this.options.ollamaEndpoint!,
        ollamaModel: this.options.ollamaModel!,
        messages,
        result,
        historyDialog,
        errorIssue,
        loading,
        maxTokens: this.options.maxTokens,
        temperature: this.options.temperature
      }).then(() => {
        if (errorIssue.value) {
          this.debugLog('Ollama API call failed', errorIssue.value)
          reject(new Error(result.value))
        } else {
          this.debugLog('Ollama API call successful', { result: result.value })
          resolve(result.value)
        }
      }).catch((error) => {
        this.debugLog('Ollama API call error', error)
        reject(error)
      })
    })
  }
}
