<template>
  <div class="checkpoint-container">
    <!-- Header with back button -->
    <div class="checkpoint-header">
      <button class="back-button" :title="$t('back')" @click="backToHome">
        <ArrowLeft :size="20" />
      </button>
      <h2 class="header-title">
        {{ $t('checkPoints') || 'History Records' }}
      </h2>
    </div>

    <div class="checkpoint-main">
      <div v-if="loading" class="loading-body">
        <div class="loading-main">{{ $t('loading') || 'Loading history...' }}</div>
      </div>

      <div v-else-if="historyItems.length === 0" class="no-checkpoint-body">
        {{ $t('NocheckPoints') || 'No History Records' }}
      </div>
      <div v-else class="checkpoint-body">
        <div class="checkpoint-section">
          <div class="checkpoint-card">
            <div
              v-for="item in historyItems"
              :key="item.id"
              class="checkpoint-item card-style"
              @click="handleRestore(item)"
            >
              <div class="card-content">
                {{ item.previewText }}
              </div>

              <div class="card-footer">
                <span class="card-time">
                  {{ formatTime(item.timestamp) }}
                </span>

                <div class="card-actions">
                  <button class="icon-btn" :title="$t('detail')" @click.stop="loadHistory">
                    <SquareMousePointer :size="14" />
                  </button>
                  <button class="icon-btn" :title="$t('copy')" @click.stop="loadHistory">
                    <Copy :size="14" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RunnableConfig } from '@langchain/core/runnables'
import { ArrowLeft, Copy, SquareMousePointer } from 'lucide-vue-next'
import { ref, watch } from 'vue'

import { IndexedDBSaver } from '@/api/checkpoints'

// 定义 Props
const props = defineProps<{
  threadId: string
  saver: IndexedDBSaver
  currentCheckpointId?: string // 当前正在显示的节点 ID
}>()

// 定义 Emits - 允许父组件处理回溯逻辑
const emit = defineEmits<{
  (e: 'restore', checkpointId: string): void
  (e: 'close'): void
}>()

interface HistoryViewItem {
  id: string
  step: number
  timestamp: string
  previewText: string
  type: 'ai' | 'human' | 'tool'
  toolName?: string
}

const historyItems = ref<HistoryViewItem[]>([])
const loading = ref(false)

// 格式化时间
const formatTime = (isoStr: string) => {
  try {
    const date = new Date(isoStr)
    return date.toLocaleString(undefined, {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch (e) {
    console.error('Failed to format time:', e)
    return isoStr
  }
}

const loadHistory = async () => {
  if (!props.threadId) return
  loading.value = true
  historyItems.value = []

  try {
    const config: RunnableConfig = {
      configurable: { thread_id: props.threadId },
    }
    const iterator = props.saver.list(config, { limit: 50 })

    for await (const tuple of iterator) {
      const { checkpoint, metadata, config } = tuple

      interface CheckpointMessage {
        _getType: () => 'ai' | 'human' | 'tool'
        content: string | any
        tool_calls?: { name: string }[]
      }

      const messages = (checkpoint.channel_values?.messages || []) as CheckpointMessage[]
      const lastMsg = messages.at(-1)

      if (!lastMsg) continue

      const msgType = lastMsg._getType ? lastMsg._getType() : 'ai'
      const isTool = msgType === 'tool'
      const isAI = msgType === 'ai'
      const isHuman = msgType === 'human'

      let type: 'ai' | 'human' | 'tool' = 'ai'
      if (isTool) type = 'tool'
      else if (isHuman) type = 'human'

      let previewText = '[Complex Content]'
      if (typeof lastMsg.content === 'string') {
        previewText = lastMsg.content
      } else if (Array.isArray(lastMsg.content)) {
        previewText = lastMsg.content.map((c: any) => c.text || '').join(' ')
      }

      previewText = previewText.slice(0, 100) + (previewText.length > 100 ? '...' : '')
      if (!previewText) previewText = '[Empty Message]'

      historyItems.value.push({
        id: config.configurable?.checkpoint_id || '',
        step: metadata?.step || 0,
        timestamp: checkpoint.ts,
        previewText,
        type,
        toolName: isAI && lastMsg.tool_calls?.length ? lastMsg.tool_calls[0].name : undefined,
      })
    }
  } catch (err) {
    console.error('Failed to load history:', err)
  } finally {
    loading.value = false
  }
}

const handleRestore = (item: HistoryViewItem) => {
  // 简单的确认逻辑，实际业务中可以用 Modal
  if (confirm(`Revert to Step ${item.step}? This will branch the conversation.`)) {
    emit('restore', item.id)
    backToHome() // 恢复后通常跳转回聊天界面
  }
}

// 监听 threadId 变化自动加载
watch(
  () => props.threadId,
  () => {
    loadHistory()
  },
  { immediate: true },
)

// 暴露给父组件
defineExpose({ loadHistory })

function backToHome() {
  emit('close')
}
</script>

<style scoped src="./checkPointsPage.css"></style>
