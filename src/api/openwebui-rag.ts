export interface KnowledgeBase {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

export interface KnowledgeCollection {
  id: string
  name: string
  knowledge_base_id: string
  documents_count: number
}

/**
 * Fetch all knowledge bases from OpenWebUI
 */
export async function fetchKnowledgeBases(baseURL: string, jwtToken: string): Promise<KnowledgeBase[]> {
  const url = `${baseURL.replace(/\/$/, '')}/api/knowledge/bases`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch knowledge bases: ${response.status}`)
  }

  const data = await response.json()
  return data.data || []
}

/**
 * Fetch collections for a knowledge base
 */
export async function fetchCollections(
  baseURL: string,
  jwtToken: string,
  knowledgeBaseId: string,
): Promise<KnowledgeCollection[]> {
  const url = `${baseURL}/api/knowledge/bases/${knowledgeBaseId}/collections`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch collections: ${response.status}`)
  }

  return response.json()
}

/**
 * Query knowledge base
 */
export async function queryKnowledge(
  baseURL: string,
  jwtToken: string,
  query: string,
  options: {
    collections?: string[]
    searchType?: 'similarity' | 'mmr' | 'similarity_score_threshold'
    topK?: number
  },
): Promise<any> {
  const url = `${baseURL}/api/knowledge/query`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      collections: options.collections || [],
      search_type: options.searchType || 'similarity',
      top_k: options.topK || 5,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to query knowledge: ${response.status}`)
  }

  return response.json()
}
