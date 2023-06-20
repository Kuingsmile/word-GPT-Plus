export interface Auth {
  type: 'web-api' | 'official' | 'azure' | 'palm';
  [propName: string]: any;
}

export function checkAuth (auth: Auth): boolean {
  return (
    auth &&
    ((auth.type === 'web-api' && !!auth.accessToken) ||
      (auth.type === 'official' && !!auth.apiKey) ||
      (auth.type === 'azure' && !!auth.azureAPIKey) ||
      (auth.type === 'palm' && !!auth.palmAPIKey))
  )
}
