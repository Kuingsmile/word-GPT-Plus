<template>
  <div class="openwebui-rag-settings">
    <div class="setting-divider" />

    <!-- RAG Enable Toggle -->
    <div class="setting-item">
      <div class="setting-info">
        <label class="setting-label">Enable Knowledge Base (RAG)</label>
        <p class="setting-description">Query your OpenWebUI knowledge bases for context-aware responses</p>
      </div>
      <div class="setting-control">
        <label class="switch">
          <input v-model="ragEnabled" type="checkbox" @change="updateRagSettings" />
          <span class="slider round"></span>
        </label>
      </div>
    </div>

    <!-- Knowledge Base Selection -->
    <div v-if="ragEnabled" class="setting-item">
      <div class="setting-info">
        <label class="setting-label">Select Knowledge Bases</label>
      </div>
      <div class="setting-control full-width">
        <button :disabled="isFetchingKB" class="icon-button" @click="fetchKnowledgeBases">
          <span v-if="isFetchingKB" class="spinner">🌀</span>
          <span v-else>🔄</span>
          Fetch Knowledge Bases
        </button>

        <div v-if="knowledgeBases.length > 0" class="knowledge-base-list">
          <div v-for="kb in knowledgeBases" :key="kb.id" class="kb-item">
            <input
              :id="`kb-${kb.id}`"
              v-model="selectedKnowledgeBases"
              type="checkbox"
              :value="kb.id"
              @change="updateRagSettings"
            />
            <label :for="`kb-${kb.id}`">
              {{ kb.name }}
              <span class="kb-description">{{ kb.description }}</span>
            </label>
          </div>
        </div>

        <p v-if="kbFetchError" class="error-message">{{ kbFetchError }}</p>
      </div>
    </div>

    <!-- Search Configuration -->
    <div v-if="ragEnabled" class="setting-item">
      <div class="setting-info">
        <label class="setting-label">Search Type</label>
      </div>
      <div class="setting-control">
        <select v-model="ragSearchType" class="select-input" @change="updateRagSettings">
          <option value="similarity">Similarity</option>
          <option value="mmr">MMR (Maximal Marginal Relevance)</option>
          <option value="similarity_score_threshold">Similarity with Threshold</option>
        </select>
      </div>
    </div>

    <div v-if="ragEnabled" class="setting-item">
      <div class="setting-info">
        <label class="setting-label">Top K Results</label>
        <p class="setting-description">Number of documents to retrieve</p>
      </div>
      <div class="setting-control">
        <input
          v-model.number="ragTopK"
          type="number"
          min="1"
          max="20"
          class="text-input number-input"
          @change="updateRagSettings"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import { fetchKnowledgeBases, KnowledgeBase } from '../api/openwebui-rag'
import { useSettings } from '../settings/useSettings'

const props = defineProps<{
  baseURL: string
  jwtToken: string
}>()

const settings = useSettings()

const ragEnabled = ref(false)
const knowledgeBases = ref<KnowledgeBase[]>([])
const selectedKnowledgeBases = ref<string[]>([])
const ragSearchType = ref<'similarity' | 'mmr' | 'similarity_score_threshold'>('similarity')
const ragTopK = ref(5)
const isFetchingKB = ref(false)
const kbFetchError = ref<string | null>(null)

// Initialize from settings
function initializeFromSettings() {
  const openwebuiSettings = settings.value.openwebui
  if (openwebuiSettings?.knowledgeBase) {
    ragEnabled.value = openwebuiSettings.knowledgeBase.enabled || false
    selectedKnowledgeBases.value = openwebuiSettings.knowledgeBase.selectedCollections || []
    ragSearchType.value = openwebuiSettings.knowledgeBase.searchType || 'similarity'
    ragTopK.value = openwebuiSettings.knowledgeBase.topK || 5
  }
}

// Update settings
function updateRagSettings() {
  const updatedSettings = {
    ...settings.value,
    openwebui: {
      ...settings.value.openwebui,
      knowledgeBase: {
        enabled: ragEnabled.value,
        selectedCollections: selectedKnowledgeBases.value,
        searchType: ragSearchType.value,
        topK: ragTopK.value,
      },
    },
  }

  // Update settings (this will trigger auto-save via watch in useSettings)
  Object.assign(settings.value, updatedSettings)
}

async function fetchKnowledgeBases() {
  if (!props.baseURL || !props.jwtToken) {
    kbFetchError.value = 'Please configure Base URL and JWT Token first'
    return
  }

  isFetchingKB.value = true
  kbFetchError.value = null

  try {
    const bases = await fetchKnowledgeBases(props.baseURL, props.jwtToken)
    knowledgeBases.value = bases
  } catch (error) {
    kbFetchError.value = error instanceof Error ? error.message : 'Failed to fetch knowledge bases'
  } finally {
    isFetchingKB.value = false
  }
}

// Initialize when component mounts
initializeFromSettings()

// Watch for changes in settings and update local state
watch(
  () => settings.value.openwebui?.knowledgeBase,
  newKB => {
    if (newKB) {
      ragEnabled.value = newKB.enabled || false
      selectedKnowledgeBases.value = newKB.selectedCollections || []
      ragSearchType.value = newKB.searchType || 'similarity'
      ragTopK.value = newKB.topK || 5
    }
  },
  { deep: true },
)
</script>

<style scoped>
.openwebui-rag-settings {
  margin-top: 16px;
}

.setting-description {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 12px;
}

.icon-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.knowledge-base-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.kb-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  background-color: white;
  border-radius: 4px;
}

.kb-item:hover {
  background-color: #f0f0f0;
}

.kb-description {
  font-size: 12px;
  color: #666;
  display: block;
  margin-top: 2px;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 8px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4a90e2;
}

input:checked + .slider:before {
  transform: translateX(20px);
}
</style>
