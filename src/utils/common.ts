export function checkAuth (auth: { type: 'web-api' | 'official'; [propName: string]: any }): boolean {
  if (!auth) return false
  if (auth.type === 'web-api') return !!auth.accessToken
  if (auth.type === 'official') return !!auth.apiKey
  return false
}
