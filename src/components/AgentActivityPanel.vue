<template>
  <div v-if="isAgentMode" class="agent-activity-panel">
    <!-- Mode Indicator -->
    <div class="mode-badge">
      <span class="badge-icon">🤖</span>
      <span>Agent Mode Active</span>
      <span class="badge-tooltip">Agent can use tools to complete tasks</span>
    </div>

    <!-- Activity Log -->
    <div v-if="activities.length > 0" class="activity-log">
      <h4>Agent Activity</h4>

      <div v-for="activity in activities" :key="activity.id" class="activity-item">
        <!-- Tool Call -->
        <div v-if="activity.type === 'tool_call'" class="tool-call">
          <span class="tool-icon">🛠️</span>
          <div class="tool-info">
            <strong>{{ formatToolName(activity.toolName) }}</strong>
            <code>{{ JSON.stringify(activity.args, null, 2) }}</code>
          </div>
          <span v-if="activity.status === 'pending'" class="status-icon">⏳</span>
          <span v-if="activity.status === 'success'" class="status-icon success">✅</span>
          <span v-if="activity.status === 'error'" class="status-icon error">❌</span>
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
          <span class="thinking-icon">🧠</span>
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
    </div>

    <!-- Current Tool Execution -->
    <div v-if="currentTool" class="tool-execution-progress">
      <div class="executing">
        <span class="spinner">🌀</span>
        <span>Executing: {{ currentTool.name }}</span>
        <span class="duration">{{ executionDuration }}s</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { useSettings } from '../settings/useSettings'

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
const currentTool = ref<{ name: string } | null>(null)
const executionStart = ref<number | null>(null)

const settings = useSettings()

const enabledTools = computed(() => {
  // Get from settings
  const tools = settings.value.tools
  return [...(tools.wordTools || []), ...(tools.generalTools || [])]
})

const executionDuration = computed(() => {
  if (!executionStart.value) return 0
  return Math.floor((Date.now() - executionStart.value) / 1000)
})

function formatToolName(name: string): string {
  return name.replace(/([A-Z])/g, ' $1').trim()
}

function formatResult(result: any): string {
  if (typeof result === 'string') return result
  return JSON.stringify(result, null, 2)
}

function onToolCall(toolName: string, args: any) {
  const activity: Activity = {
    id: `tool-${Date.now()}`,
    type: 'tool_call',
    timestamp: new Date(),
    toolName,
    args,
    status: 'pending',
  }
  activities.value.push(activity)

  currentTool.value = { name: toolName }
  executionStart.value = Date.now()

  console.log(`[Agent] Calling tool: ${toolName}`, args)
}

function onToolResult(toolName: string, result: any) {
  // Update pending tool call
  const pendingCall = activities.value.reverse().find(a => a.toolName === toolName && a.status === 'pending')

  if (pendingCall) {
    pendingCall.status = 'success'
  }

  // Add result
  activities.value.push({
    id: `result-${Date.now()}`,
    type: 'tool_result',
    timestamp: new Date(),
    toolName,
    result,
  })

  console.log(`[Agent] Tool result: ${toolName}`, result)

  currentTool.value = null
  executionStart.value = null
}

function onAgentThinking(thought: string) {
  activities.value.push({
    id: `thinking-${Date.now()}`,
    type: 'thinking',
    timestamp: new Date(),
    thought,
  })
}

// Expose methods for parent component
defineExpose({
  onToolCall,
  onToolResult,
  onAgentThinking,
})

// Cleanup
onUnmounted(() => {
  activities.value = []
  currentTool.value = null
  executionStart.value = null
})
</script>

<style scoped>
.agent-activity-panel {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  background-color: #f9f9f9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.mode-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #4a90e2;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  margin-bottom: 16px;
}

.badge-tooltip {
  font-size: 12px;
  opacity: 0.8;
}

.activity-log {
  margin: 16px 0;
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
}

.activity-log h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
}

.activity-item {
  margin-bottom: 12px;
  padding: 8px;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.tool-call {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-icon,
.thinking-icon {
  font-size: 18px;
}

.tool-info {
  flex: 1;
}

.tool-info strong {
  color: #4a90e2;
  font-size: 14px;
}

.tool-info code {
  background-color: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: block;
  margin-top: 4px;
  overflow-x: auto;
  max-width: 100%;
}

.status-icon {
  font-size: 18px;
}

.status-icon.success {
  color: #2ecc71;
}

.status-icon.error {
  color: #e74c3c;
}

.tool-result {
  margin-top: 8px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.tool-result pre {
  margin: 0;
  white-space: pre-wrap;
  font-size: 13px;
}

.thinking {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-style: italic;
}

.tool-selection {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.tool-selection h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
}

.tool-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tool-chip {
  background-color: #e0e0e0;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  color: #333;
}

.tool-execution-progress {
  margin-top: 12px;
  padding: 8px;
  background-color: #fff8e1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.executing {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.duration {
  color: #666;
  font-size: 12px;
}
</style>
