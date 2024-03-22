export interface Auth {
  type: 'web-api' | 'official' | 'azure' | 'palm' | 'gemini' | 'ollama'
  [propName: string]: any;
}

export function checkAuth (auth: Auth): boolean {
  return (
    auth &&
    ((auth.type === 'web-api' && !!auth.accessToken) ||
      (auth.type === 'official' && !!auth.apiKey) ||
      (auth.type === 'azure' && !!auth.azureAPIKey) ||
      (auth.type === 'palm' && !!auth.palmAPIKey) ||
      (auth.type === 'gemini' && !!auth.geminiAPIKey) ||
      (auth.type === 'ollama'))
  )
}

export function forceNumber (val: any) {
  if (val === '') {
    return 0
  }
  return isNaN(Number(val)) ? 0 : Number(val)
}
