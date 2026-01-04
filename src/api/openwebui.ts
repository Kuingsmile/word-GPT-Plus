/**
 * Open WebUI API utilities for fetching models dynamically
 */

export interface OpenWebUIModel {
  id: string
  name: string
  object?: string
  created?: number
  owned_by?: string
}

export interface OpenWebUIModelsResponse {
  data: OpenWebUIModel[]
}

/**
 * Fetch available models from Open WebUI instance
 * @param baseURL - Open WebUI base URL (e.g., https://wordai.hekanet.de)
 * @param jwtToken - Open WebUI JWT token (from login)
 * @returns Array of model IDs
 */
export async function fetchOpenWebUIModels(baseURL: string, jwtToken: string): Promise<string[]> {
  try {
    // Remove trailing slash and ensure we have the base URL
    const cleanBaseURL = baseURL.replace(/\/$/, '')

    // Use /api/models endpoint which accepts JWT authentication
    const modelsURL = `${cleanBaseURL}/api/models`

    console.log('[OpenWebUI] Fetching models from:', modelsURL)

    const response = await fetch(modelsURL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`)
    }

    const data: OpenWebUIModelsResponse = await response.json()

    // Extract model IDs from the response
    const modelIds = data.data.map((model: OpenWebUIModel) => model.id)

    console.log('[OpenWebUI] Fetched models:', modelIds)

    return modelIds
  } catch (error) {
    console.error('[OpenWebUI] Error fetching models:', error)
    throw error
  }
}

/**
 * Save fetched models to localStorage
 */
export function saveOpenWebUIModels(models: string[]): void {
  localStorage.setItem('openwebuiFetchedModels', JSON.stringify(models))
  localStorage.setItem('openwebuiModelsLastFetch', new Date().toISOString())
}

/**
 * Load cached models from localStorage
 */
export function loadOpenWebUIModels(): string[] {
  try {
    const stored = localStorage.getItem('openwebuiFetchedModels')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Get last fetch timestamp
 */
export function getModelsLastFetchTime(): string | null {
  return localStorage.getItem('openwebuiModelsLastFetch')
}
