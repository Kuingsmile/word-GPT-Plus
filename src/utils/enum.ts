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
  // palm api
  palmAPIKey = 'palmAPIKey',
  palmAPIEndpoint = 'palmAPIEndpoint',
  palmMaxTokens = 'palmMaxTokens',
  palmTemperature = 'palmTemperature',
  palmModel = 'palmModel',
  palmCustomModel = 'palmCustomModel',
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
  // proxy
  enableProxy = 'enableProxy',
  proxy = 'proxy',
  defaultSystemPrompt = 'defaultSystemPrompt',
  defaultPrompt = 'defaultPrompt'
}
