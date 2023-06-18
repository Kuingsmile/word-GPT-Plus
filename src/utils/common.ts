export function checkAuth (auth: { type: 'web-api' | 'official' | 'azure' | 'palm'; [propName: string]: any }): boolean {
  if (!auth) return false
  if (auth.type === 'web-api') return !!auth.accessToken
  if (auth.type === 'official') return !!auth.apiKey
  if (auth.type === 'azure') return !!auth.azureAPIKey
  if (auth.type === 'palm') return !!auth.palmAPIKey
  return false
}
