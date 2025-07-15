interface IStringKeyMap {
  [propName: string]: any
}

type supportedPlatforms = 'official' | 'azure' | 'gemini' | 'ollama' | 'groq' | 'agent'

type insertTypes = 'replace' |  'append' |  'newLine' | 'NoAction'