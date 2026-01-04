# Word GPT Plus - Refactoring & Improvement Plan

## Executive Summary

This document outlines a comprehensive plan to improve the Word GPT Plus architecture, focusing on:
1. **Settings consolidation** - Unify fragmented settings management
2. **Agent mode transparency** - Make agent behavior clear and visible
3. **OpenWebUI RAG integration** - Enable knowledge base selection
4. **Type organization** - Centralize scattered type definitions
5. **Error handling** - Improve user feedback and debugging

---

## Phase 1: Critical Architecture Fixes (High Priority)

### 1.1 Settings System Consolidation

**Problem:** Settings are managed across 4 different systems:
- `utils/enum.ts` - Storage key constants
- `utils/settingPreset.ts` - Schema definitions + defaults
- `utils/settingForm.ts` - Reactive singleton state
- Direct localStorage access in components

**Solution:** Unified settings architecture

#### New Structure:
```
src/settings/
├── schema.ts           # Single source of truth for all settings
├── useSettings.ts      # One composable hook for all settings
├── storage.ts          # LocalStorage abstraction layer
├── providers.ts        # Provider-specific settings
└── validation.ts       # Zod schemas for runtime validation
```

#### Implementation:

**settings/schema.ts:**
```typescript
import { z } from 'zod'

// Define all settings in one place
export const SettingsSchema = z.object({
  // UI Settings
  localLanguage: z.enum(['en', 'zh-CN']).default('zh-CN'),
  replyLanguage: z.enum(['en', 'zh-CN', 'auto']).default('auto'),

  // Provider Settings
  provider: z.enum(['official', 'ollama', 'groq', 'gemini', 'azure', 'mistral', 'openwebui']),

  // OpenAI Settings
  openai: z.object({
    apiKey: z.string(),
    baseURL: z.string().default('https://api.openai.com/v1'),
    model: z.string().default('gpt-4'),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().min(1).max(32000).default(800),
  }),

  // OpenWebUI Settings
  openwebui: z.object({
    jwtToken: z.string(),
    baseURL: z.string(),
    model: z.string(),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().min(1).max(32000).default(1024),
    // NEW: RAG/Knowledge Base settings
    knowledgeBase: z.object({
      enabled: z.boolean().default(false),
      selectedCollections: z.array(z.string()).default([]),
      searchType: z.enum(['similarity', 'mmr', 'similarity_score_threshold']).default('similarity'),
      topK: z.number().min(1).max(20).default(5),
    }),
  }),

  // Tool Settings
  tools: z.object({
    wordTools: z.array(z.string()),
    generalTools: z.array(z.string()),
  }),
})

export type Settings = z.infer<typeof SettingsSchema>
```

**settings/useSettings.ts:**
```typescript
import { ref, watch } from 'vue'
import { SettingsSchema, type Settings } from './schema'
import { SettingsStorage } from './storage'

let settingsInstance: Ref<Settings> | null = null

export function useSettings() {
  if (!settingsInstance) {
    // Load from storage
    const stored = SettingsStorage.load()

    // Validate and merge with defaults
    const validated = SettingsSchema.parse(stored)

    settingsInstance = ref(validated)

    // Auto-save on changes
    watch(
      settingsInstance,
      (newSettings) => {
        SettingsStorage.save(newSettings)
      },
      { deep: true }
    )
  }

  return settingsInstance
}
```

**Migration Path:**
1. Create new `src/settings/` directory
2. Implement new schema and composable
3. Update components to use `useSettings()`
4. Deprecate old system (keep for 1 version)
5. Remove old files in next major version

---

### 1.2 Type Definition Organization

**Problem:** Types scattered across 5+ files with no clear pattern

**Solution:** Centralized type structure

#### New Structure:
```
src/types/
├── index.ts            # Re-export all types
├── providers.ts        # All LLM provider types
├── tools.ts            # Word & general tool types
├── settings.ts         # Settings types (from schema)
├── api.ts              # API request/response types
├── errors.ts           # Error types
└── common.ts           # Shared utility types
```

**Migration:**
- Move all provider types from `api/types.ts` → `types/providers.ts`
- Move tool types from utils → `types/tools.ts`
- Create proper barrel exports in `types/index.ts`

---

### 1.3 Error Handling System

**Problem:**
- Silent failures
- Generic error messages
- No distinction between error types
- Poor user feedback

**Solution:** Typed error system with user-friendly messages

**types/errors.ts:**
```typescript
export enum ErrorType {
  AUTHENTICATION = 'AUTHENTICATION',
  RATE_LIMIT = 'RATE_LIMIT',
  NETWORK = 'NETWORK',
  INVALID_MODEL = 'INVALID_MODEL',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNKNOWN = 'UNKNOWN',
}

export class LLMError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public userMessage: string,
    public troubleshootingUrl?: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'LLMError'
  }
}

export const ErrorMessages: Record<ErrorType, string> = {
  [ErrorType.AUTHENTICATION]: 'Authentication failed. Please check your API key or JWT token.',
  [ErrorType.RATE_LIMIT]: 'Rate limit exceeded. Please wait and try again.',
  [ErrorType.NETWORK]: 'Network error. Please check your connection.',
  [ErrorType.INVALID_MODEL]: 'The selected model is not available.',
  [ErrorType.QUOTA_EXCEEDED]: 'Your API quota has been exceeded.',
  [ErrorType.INVALID_REQUEST]: 'Invalid request. Please check your settings.',
  [ErrorType.UNKNOWN]: 'An unexpected error occurred.',
}
```

**utils/errorHandler.ts:**
```typescript
export function handleLLMError(error: unknown): LLMError {
  if (error instanceof LLMError) return error

  // Parse HTTP status codes
  if (error.response?.status === 401 || error.response?.status === 403) {
    return new LLMError(
      ErrorType.AUTHENTICATION,
      'Auth failed',
      ErrorMessages[ErrorType.AUTHENTICATION],
      'https://docs.wordgptplus.com/troubleshooting/auth',
      error
    )
  }

  if (error.response?.status === 429) {
    return new LLMError(
      ErrorType.RATE_LIMIT,
      'Rate limited',
      ErrorMessages[ErrorType.RATE_LIMIT],
      'https://docs.wordgptplus.com/troubleshooting/rate-limit',
      error
    )
  }

  // ... handle other cases

  return new LLMError(
    ErrorType.UNKNOWN,
    'Unknown error',
    ErrorMessages[ErrorType.UNKNOWN],
    undefined,
    error
  )
}
```

---

## Phase 2: Agent Mode Transparency (Critical UX Issue)

### 2.1 Problem Analysis

**Current Issues:**
1. Users don't understand what "Agent" mode does vs "Ask" mode
2. No visibility into which tools are being called
3. Tool execution results are hidden
4. No way to see agent's reasoning process
5. Tool selection happens invisibly

**User Confusion Points:**
- "Why is it taking so long?" → Tool execution is invisible
- "What tools did it use?" → No log or history
- "Can I control which tools it uses?" → Limited control
- "What did the tool return?" → Results not shown

### 2.2 Solution: Transparent Agent Mode

#### A. Agent Activity Panel (New Component)

**Create: `src/components/AgentActivityPanel.vue`**

```vue
<template>
  <div v-if="isAgentMode" class="agent-activity-panel">
    <!-- Mode Indicator -->
    <div class="mode-badge">
      <BotIcon :size="16" />
      <span>Agent Mode Active</span>
      <Tooltip text="Agent can use tools to complete tasks" />
    </div>

    <!-- Activity Log -->
    <div v-if="activities.length > 0" class="activity-log">
      <h4>Agent Activity</h4>

      <div v-for="activity in activities" :key="activity.id" class="activity-item">
        <!-- Tool Call -->
        <div v-if="activity.type === 'tool_call'" class="tool-call">
          <ToolIcon :size="14" />
          <div class="tool-info">
            <strong>{{ formatToolName(activity.toolName) }}</strong>
            <code>{{ JSON.stringify(activity.args, null, 2) }}</code>
          </div>
          <Spinner v-if="activity.status === 'pending'" />
          <CheckIcon v-if="activity.status === 'success'" />
          <XIcon v-if="activity.status === 'error'" />
        </div>

        <!-- Tool Result -->
        <div v-if="activity.type === 'tool_result'" class="tool-result">
          <div class="result-content">
            <span class="label">Result:</span>
            <pre>{{ formatResult(activity.result) }}</pre>
          </div>
        </div>

        <!-- Agent Thinking -->
        <div v-if="activity.type === 'thinking'" class="thinking">
          <BrainIcon :size="14" />
          <span>{{ activity.thought }}</span>
        </div>
      </div>
    </div>

    <!-- Tool Selection Panel -->
    <div class="tool-selection">
      <h4>Available Tools ({{ enabledTools.length }})</h4>
      <div class="tool-chips">
        <span v-for="tool in enabledTools" :key="tool" class="tool-chip">
          {{ formatToolName(tool) }}
        </span>
      </div>
      <button @click="configureTools">Configure Tools</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Activity {
  id: string
  type: 'tool_call' | 'tool_result' | 'thinking'
  timestamp: Date
  toolName?: string
  args?: any
  result?: any
  thought?: string
  status?: 'pending' | 'success' | 'error'
}

const activities = ref<Activity[]>([])
const isAgentMode = ref(true)

const enabledTools = computed(() => {
  // Get from settings
  return ['getSelectedText', 'insertText', 'formatText', 'searchWeb']
})

function formatToolName(name: string): string {
  return name.replace(/([A-Z])/g, ' $1').trim()
}

function formatResult(result: any): string {
  if (typeof result === 'string') return result
  return JSON.stringify(result, null, 2)
}
</script>
```

#### B. Update HomePage.vue to Show Agent Activity

**Add to `src/pages/HomePage.vue`:**

```typescript
// Agent activity tracking
const agentActivities = ref<Activity[]>([])

function onToolCall(toolName: string, args: any) {
  const activity: Activity = {
    id: `tool-${Date.now()}`,
    type: 'tool_call',
    timestamp: new Date(),
    toolName,
    args,
    status: 'pending',
  }
  agentActivities.value.push(activity)

  // Show in UI
  console.log(`[Agent] Calling tool: ${toolName}`, args)
}

function onToolResult(toolName: string, result: any) {
  // Update pending tool call
  const pendingCall = agentActivities.value
    .reverse()
    .find(a => a.toolName === toolName && a.status === 'pending')

  if (pendingCall) {
    pendingCall.status = 'success'
  }

  // Add result
  agentActivities.value.push({
    id: `result-${Date.now()}`,
    type: 'tool_result',
    timestamp: new Date(),
    toolName,
    result,
  })

  console.log(`[Agent] Tool result: ${toolName}`, result)
}

// Update agent call to include callbacks
await getAgentResponse({
  // ... existing options
  onToolCall,      // ← Now actually used!
  onToolResult,    // ← Now actually used!
})
```

#### C. Mode Explanation Modal

**Create: `src/components/AgentModeExplainer.vue`**

```vue
<template>
  <Modal v-model="show">
    <h2>Understanding Agent Mode</h2>

    <div class="comparison">
      <div class="mode-card">
        <h3>💬 Ask Mode</h3>
        <ul>
          <li>Simple question & answer</li>
          <li>No tool access</li>
          <li>Fast responses</li>
          <li>Good for: Writing, translation, general chat</li>
        </ul>
      </div>

      <div class="mode-card">
        <h3>🤖 Agent Mode</h3>
        <ul>
          <li>Can use Word tools</li>
          <li>Can search the web</li>
          <li>Multi-step reasoning</li>
          <li>Good for: Complex tasks, document editing, research</li>
        </ul>
      </div>
    </div>

    <div class="example">
      <h4>Example: Agent Mode in Action</h4>
      <ol>
        <li>You ask: "Find the latest GDP data and insert it into my document"</li>
        <li>Agent thinks: "I need to search the web for GDP data"</li>
        <li>Agent calls: <code>searchWeb("latest GDP data")</code></li>
        <li>Agent receives: GDP statistics</li>
        <li>Agent calls: <code>insertText("GDP: $X trillion")</code></li>
        <li>Done! ✓</li>
      </ol>
    </div>

    <button @click="show = false">Got it!</button>
  </Modal>
</template>
```

#### D. Tool Execution Visibility

**Add progress indicator for each tool:**

```vue
<!-- In AgentActivityPanel -->
<div class="tool-execution-progress">
  <div v-if="currentTool" class="executing">
    <Spinner />
    <span>Executing: {{ currentTool.name }}</span>
    <span class="duration">{{ executionDuration }}s</span>
  </div>
</div>
```

---

## Phase 3: OpenWebUI RAG/Knowledge Base Integration

### 3.1 Current Gap

**Missing Features:**
- No way to select OpenWebUI knowledge bases
- Can't enable/disable RAG
- No search configuration (similarity, MMR, etc.)
- No way to choose which collections to query

### 3.2 OpenWebUI RAG API Endpoints

OpenWebUI provides these RAG endpoints:

```
GET  /api/knowledge/bases          # List all knowledge bases
GET  /api/knowledge/bases/:id      # Get specific knowledge base
POST /api/knowledge/query           # Query knowledge base
GET  /api/knowledge/collections     # List collections
```

### 3.3 Implementation Plan

#### A. Fetch Knowledge Bases

**Create: `src/api/openwebui-rag.ts`**

```typescript
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
export async function fetchKnowledgeBases(
  baseURL: string,
  jwtToken: string
): Promise<KnowledgeBase[]> {
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
  knowledgeBaseId: string
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
  }
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
```

#### B. RAG Settings UI

**Add to `src/pages/SettingsPage.vue` (OpenWebUI section):**

```vue
<template>
  <div v-if="settingForm.api === 'openwebui'" class="openwebui-rag-settings">
    <div class="setting-divider" />

    <!-- RAG Enable Toggle -->
    <div class="setting-item">
      <div class="setting-info">
        <label class="setting-label">Enable Knowledge Base (RAG)</label>
        <p class="setting-description">
          Query your OpenWebUI knowledge bases for context-aware responses
        </p>
      </div>
      <div class="setting-control">
        <Switch v-model="ragEnabled" />
      </div>
    </div>

    <!-- Knowledge Base Selection -->
    <div v-if="ragEnabled" class="setting-item">
      <div class="setting-info">
        <label class="setting-label">Select Knowledge Bases</label>
      </div>
      <div class="setting-control full-width">
        <button
          @click="fetchKnowledgeBases"
          :disabled="isFetchingKB"
          class="icon-button"
        >
          <RefreshCw :class="{ spin: isFetchingKB }" />
          Fetch Knowledge Bases
        </button>

        <div v-if="knowledgeBases.length > 0" class="knowledge-base-list">
          <div
            v-for="kb in knowledgeBases"
            :key="kb.id"
            class="kb-item"
          >
            <input
              type="checkbox"
              :id="`kb-${kb.id}`"
              v-model="selectedKnowledgeBases"
              :value="kb.id"
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
        <select v-model="ragSearchType" class="select-input">
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
          type="number"
          v-model.number="ragTopK"
          min="1"
          max="20"
          class="text-input number-input"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { fetchKnowledgeBases, type KnowledgeBase } from '@/api/openwebui-rag'

const ragEnabled = ref(false)
const knowledgeBases = ref<KnowledgeBase[]>([])
const selectedKnowledgeBases = ref<string[]>([])
const ragSearchType = ref<'similarity' | 'mmr' | 'similarity_score_threshold'>('similarity')
const ragTopK = ref(5)
const isFetchingKB = ref(false)
const kbFetchError = ref<string | null>(null)

async function fetchKnowledgeBases() {
  const baseURL = settingForm.value.openwebuiBaseURL
  const jwtToken = settingForm.value.openwebuiAPIKey

  if (!baseURL || !jwtToken) {
    kbFetchError.value = 'Please configure Base URL and JWT Token first'
    return
  }

  isFetchingKB.value = true
  kbFetchError.value = null

  try {
    const bases = await fetchKnowledgeBases(baseURL, jwtToken)
    knowledgeBases.value = bases
  } catch (error) {
    kbFetchError.value = error.message || 'Failed to fetch knowledge bases'
  } finally {
    isFetchingKB.value = false
  }
}
</script>
```

#### C. Integrate RAG into Chat Flow

**Update `src/api/union.ts`:**

```typescript
openwebui: (opts: OpenWebUIOptions) => {
  let baseURL = opts.openwebuiBaseURL.replace(/\/$/, '')

  if (!baseURL.includes('/api/v1')) {
    baseURL = `${baseURL}/api/v1`
  }

  console.log('[OpenWebUI] Using baseURL:', baseURL)

  // Build configuration with RAG if enabled
  const config: any = {
    apiKey: opts.openwebuiAPIKey,
    baseURL: baseURL,
  }

  // Add RAG configuration if enabled
  if (opts.ragEnabled && opts.selectedKnowledgeBases?.length > 0) {
    config.modelKwargs = {
      rag: {
        enabled: true,
        knowledge_bases: opts.selectedKnowledgeBases,
        search_type: opts.ragSearchType || 'similarity',
        top_k: opts.ragTopK || 5,
      },
    }

    console.log('[OpenWebUI] RAG enabled with knowledge bases:', opts.selectedKnowledgeBases)
  }

  return new ChatOpenAI({
    modelName: opts.openwebuiModel || 'llama3.1:latest',
    configuration: config,
    temperature: opts.temperature ?? 0.7,
    maxTokens: opts.maxTokens ?? 1024,
  })
},
```

#### D. Update Types

**Add to `src/api/types.ts`:**

```typescript
export interface OpenWebUIOptions extends ProviderOptions {
  openwebuiAPIKey: string
  openwebuiBaseURL: string
  openwebuiModel: string

  // RAG Options
  ragEnabled?: boolean
  selectedKnowledgeBases?: string[]
  ragSearchType?: 'similarity' | 'mmr' | 'similarity_score_threshold'
  ragTopK?: number
}
```

---

## Phase 4: File Size Reduction

### 4.1 Split Large Files

**Problem:** `wordTools.ts` is 893 lines - too large

**Solution:** Split into logical modules

```
src/utils/wordTools/
├── index.ts                    # Main export
├── types.ts                    # Tool type definitions
├── text-tools.ts               # Insert, delete, replace, select
├── formatting-tools.ts         # Format, font, clear formatting
├── navigation-tools.ts         # Find, bookmark, goto
├── document-tools.ts           # Get content, properties, range
├── structure-tools.ts          # Table, list, paragraph, page break
├── content-control-tools.ts    # Content controls
└── image-tools.ts              # Insert image
```

Each file exports tools for that category, `index.ts` combines them all.

---

## Phase 5: Documentation & Testing

### 5.1 User Documentation

**Create: `docs/agent-mode-guide.md`**
- Explain Ask vs Agent mode
- List all available tools
- Show example use cases
- Troubleshooting guide

**Create: `docs/openwebui-rag-setup.md`**
- How to set up knowledge bases in OpenWebUI
- How to enable RAG in Word GPT Plus
- Best practices for RAG queries
- Performance considerations

### 5.2 Developer Documentation

**Create: `docs/architecture.md`**
- Complete architecture diagram
- Data flow explanation
- Settings system documentation
- Adding new providers guide
- Adding new tools guide

---

## Implementation Timeline

### Week 1: Critical Fixes
- [ ] Phase 1.1: Settings consolidation
- [ ] Phase 1.2: Type organization
- [ ] Phase 1.3: Error handling

### Week 2: Agent Transparency
- [ ] Phase 2.1: Agent Activity Panel
- [ ] Phase 2.2: Mode explanation UI
- [ ] Phase 2.3: Tool visibility

### Week 3: RAG Integration
- [ ] Phase 3.1: OpenWebUI RAG API integration
- [ ] Phase 3.2: Knowledge base selection UI
- [ ] Phase 3.3: RAG settings persistence

### Week 4: Polish & Documentation
- [ ] Phase 4: File splitting
- [ ] Phase 5: Documentation
- [ ] Testing & bug fixes
- [ ] Release v2.1.0

---

## Testing Checklist

### Settings System
- [ ] Settings persist across sessions
- [ ] Settings validate correctly
- [ ] Migration from old settings works
- [ ] All providers use unified settings

### Agent Mode
- [ ] Tool calls are visible in UI
- [ ] Tool results are shown
- [ ] Activity log updates in real-time
- [ ] Mode explanation is clear

### OpenWebUI RAG
- [ ] Can fetch knowledge bases
- [ ] Can select multiple bases
- [ ] RAG queries work correctly
- [ ] Settings persist correctly

### Error Handling
- [ ] Auth errors show helpful message
- [ ] Rate limit errors are clear
- [ ] Network errors provide guidance
- [ ] Unknown errors are logged

---

## Deployment Instructions

### 1. Backup Current Deployment
```bash
docker-compose -f docker-compose.yml down
docker tag word-gpt-plus:latest word-gpt-plus:backup
```

### 2. Pull Latest Code
```bash
git pull origin main
```

### 3. Rebuild with New Architecture
```bash
# Clear all caches
rm -rf node_modules/.vite dist

# Rebuild
docker-compose -f docker-compose.yml up -d --build --no-cache
```

### 4. Verify Deployment
```bash
# Check container is running
docker ps | grep word-gpt-plus

# Check logs for errors
docker logs word-gpt-plus

# Test settings persistence
# 1. Open Word GPT Plus
# 2. Configure settings
# 3. Reload page
# 4. Verify settings persisted
```

### 5. User Migration
```bash
# Clear Office cache (users must do this)
.\clear-office-cache.ps1

# Hard refresh browser
Ctrl+Shift+R
```

### 6. Rollback Plan (if needed)
```bash
docker stop word-gpt-plus
docker rm word-gpt-plus
docker tag word-gpt-plus:backup word-gpt-plus:latest
docker-compose -f docker-compose.yml up -d
```

---

## Success Metrics

After refactoring, we should see:

1. **Code Quality**
   - Settings management in 1 place (not 4)
   - Type definitions in 1 directory (not scattered)
   - Error handling is consistent
   - Files under 500 lines

2. **User Experience**
   - Users understand agent mode
   - Tool execution is visible
   - Error messages are helpful
   - RAG selection is easy

3. **Maintainability**
   - New providers: ~50 lines of code
   - New tools: Clear location to add
   - Settings: Single schema to update
   - Types: Centralized and consistent

---

## Questions for Review

1. **Settings Migration:** Should we auto-migrate old settings or require manual reconfiguration?
2. **Agent Activity Log:** Should it persist across sessions or reset on reload?
3. **RAG Default:** Should RAG be enabled by default if knowledge bases exist?
4. **Tool Visibility:** Should all tool calls be shown or only specific ones?
5. **Error Reporting:** Should we add telemetry for error tracking?

---

## Conclusion

This refactoring plan addresses all major architectural issues:
- ✅ Consolidates fragmented settings
- ✅ Makes agent mode transparent
- ✅ Enables OpenWebUI RAG integration
- ✅ Organizes type definitions
- ✅ Improves error handling
- ✅ Reduces file sizes

Expected outcome: **Cleaner, more maintainable, user-friendly architecture** that's easier to extend and debug.
