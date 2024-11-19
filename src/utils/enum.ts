export enum localStorageKey {
  // common
  api = 'api',
  localLanguage = 'localLanguage',
  replyLanguage = 'replyLanguage',
  insertType = 'insertType',
  // official api
  apiKey = 'apiKey',
  model = 'model',
  customModel = 'customModel',
  temperature = 'temperature',
  maxTokens = 'maxTokens',
  basePath = 'basePath',
  // azure api
  azureAPIKey = 'azureAPIKey',
  azureAPIEndpoint = 'azureAPIEndpoint',
  azureDeploymentName = 'azureDeploymentName',
  azureMaxTokens = 'azureMaxTokens',
  azureTemperature = 'azureTemperature',
  // gemini api
  geminiAPIKey = 'geminiAPIKey',
  geminiMaxTokens = 'geminiMaxTokens',
  geminiTemperature = 'geminiTemperature',
  geminiModel = 'geminiModel',
  geminiCustomModel = 'geminiCustomModel',
  // ollama api
  ollamaEndpoint = 'ollamaEndpoint',
  ollamaModel = 'ollamaModel',
  ollamaTemperature = 'ollamaTemperature',
  ollamaCustomModel = 'ollamaCustomModel',
  // groq api
  groqAPIKey = 'groqAPIKey',
  groqTemperature = 'groqTemperature',
  groqMaxTokens = 'groqMaxTokens',
  groqModel = 'groqModel',
  groqCustomModel = 'groqCustomModel',
  // proxy
  enableProxy = 'enableProxy',
  proxy = 'proxy',
  defaultSystemPrompt = 'defaultSystemPrompt',
  defaultPrompt = 'defaultPrompt'
}
