interface IStringKeyMap {
  [propName: string]: any
}

type supportedPlatforms = 'official' | 'azure' | 'palm' | 'gemini' | 'ollama'

type insertTypes = 'replace' |  'append' |  'newLine' | 'NoAction'