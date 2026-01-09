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

      <div v-else-if="sessionItems.length === 0" class="no-checkpoint-body">
        {{ $t('NocheckPoints') || 'No History Records' }}
      </div>
      <div v-else class="checkpoint-body">
        <div class="checkpoint-section">
          <div class="checkpoint-card">
            <div
              v-for="item in sessionItems"
              :key="item.threadId"
              class="checkpoint-item card-style"
              @click="handleSelectSession(item.threadId)"
            >
              <div class="card-content">
                {{ item.previewText }}
              </div>

              <div class="card-footer">
                <span class="card-time">
                  {{ formatTime(item.timestamp) }}
                </span>

                <div class="card-actions">
                  <button class="icon-btn" :title="$t('detail')" @click.stop="handleSelectSession(item.threadId)">
                    <SquareMousePointer :size="14" />
                  </button>
                  <button class="icon-btn" :title="$t('copy')" @click.stop="copyItemPrompt(item.previewText)">
                    <Copy :size="14" />
                  </button>
                  <button class="icon-btn" :title="$t('delete')" @click.stop="deleteSession(item.threadId)">
                    <Delete :size="14" />
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
import { ArrowLeft, Copy, Delete, SquareMousePointer } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { IndexedDBSaver } from '@/api/checkpoints'
import { message as messageUtil } from '@/utils/message'

// 定义 Props
const props = defineProps<{
  threadId?: string
  saver: IndexedDBSaver
  currentCheckpointId?: string // 当前正在显示的节点 ID
}>()

// 定义 Emits
const emit = defineEmits<{
  (e: 'select-thread', threadId: string): void
  (e: 'restore', checkpointId: string): void
  (e: 'close'): void
}>()

const { t } = useI18n()

interface SessionViewItem {
  threadId: string
  timestamp: string
  previewText: string
  messageCount: number
  toolName?: string
}

const sessionItems = ref<SessionViewItem[]>([])
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
// 加载所有会话
const loadAllSessions = async () => {
  loading.value = true
  sessionItems.value = []

  const sessionMap = new Map<string, SessionViewItem>()
  try {
    const config: RunnableConfig = {
      configurable: {},
    }

    const iterator = props.saver.list(config, { limit: 50 })

    for await (const tuple of iterator) {
      const { checkpoint, config } = tuple

      const tId = config.configurable?.thread_id
      if (!tId) continue

      const existing = sessionMap.get(tId)
      const currentTs = checkpoint.ts
      if (existing && new Date(existing.timestamp) >= new Date(currentTs)) {
        continue
      }

      interface CheckpointMessage {
        _getType: () => 'ai' | 'human' | 'tool'
        content: string | any
        tool_calls?: { name: string }[]
      }

      const messages = (checkpoint.channel_values?.messages || []) as CheckpointMessage[]
      const lastMsg = messages.at(-1)

      if (!lastMsg) continue
      let previewText = '[Complex Content]'
      if (typeof lastMsg.content === 'string') {
        previewText = lastMsg.content
      } else if (Array.isArray(lastMsg.content)) {
        previewText = lastMsg.content.map((c: any) => c.text || '').join(' ')
      }

      previewText = previewText.slice(0, 100) + (previewText.length > 100 ? '...' : '')
      if (!previewText) previewText = '[Empty Message]'

      sessionMap.set(tId, {
        threadId: tId,
        timestamp: currentTs,
        previewText: previewText || '[Empty Session]',
        messageCount: messages.length,
        toolName: lastMsg.tool_calls?.length ? lastMsg.tool_calls[0].name : undefined,
      })
    }
    sessionItems.value = Array.from(sessionMap.values()).sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
  } catch (err) {
    console.error('Failed to load sessions:', err)
  } finally {
    loading.value = false
  }
}

const handleSelectSession = (threadId: string) => {
  emit('select-thread', threadId)
}

const deleteSession = async (threadId: string) => {
  try {
    await props.saver.deleteThread(threadId)
    sessionItems.value = sessionItems.value.filter(item => item.threadId !== threadId)
    messageUtil.success(t('deleteSuccess', 'Session deleted.'))
  } catch (error) {
    console.error('Failed to delete session:', error)
    messageUtil.error(t('deleteFail', 'Failed to delete session.'))
  }
}

const copyItemPrompt = (text: string) => {
  if (!text) return
  navigator.clipboard.writeText(text)
  messageUtil.success(t('copied'))
}

onMounted(() => {
  loadAllSessions()
})

function backToHome() {
  emit('close')
}
</script>

<style scoped src="./checkPointsPage.css"></style>
