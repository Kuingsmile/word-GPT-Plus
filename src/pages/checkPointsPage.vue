<template>
  <div class="flex h-full w-full flex-col gap-2 overflow-hidden bg-bg-secondary p-2">
    <div
      class="flex shrink-0 items-center gap-2.5 rounded-md border-b border-b-border bg-bg-secondary px-4 py-2 shadow-sm"
    >
      <CustomButton text="" :icon="ArrowLeft" type="secondary" class="border-none p-1!" @click="backToHome" />
      <h2 class="text-sm font-semibold text-main">
        {{ t('checkPoints') }}
      </h2>
    </div>

    <div
      class="flex flex-1 flex-col items-center justify-center overflow-hidden rounded-md border border-border bg-bg-secondary shadow-sm"
    >
      <div v-if="loading" class="flex h-full w-full items-center justify-center">
        <div class="flex flex-col items-center gap-2">
          <div class="h-12 w-12 animate-spin rounded-full border-3 border-t-3 border-accent border-t-white"></div>
          <div class="p-4 text-center font-semibold text-secondary">{{ t('loading') }}</div>
        </div>
      </div>
      <div v-if="sessionItems.length === 0" class="flex h-full flex-col items-center justify-center gap-4">
        <PackageIcon :size="48" class="text-secondary opacity-50" />
        <span class="text-sm text-secondary">{{ t('NocheckPoints') }}</span>
      </div>
      <div v-else class="flex h-full w-full overflow-auto p-2">
        <div class="flex w-full flex-col gap-2">
          <div
            v-for="item in sessionItems"
            :key="item.threadId"
            class="flex cursor-pointer flex-col gap-2 rounded-md border border-border-secondary bg-surface p-2 shadow-sm hover:border-2 hover:border-accent"
            @click="handleSelectSession(item.threadId)"
          >
            <div
              class="text line-clamp-3 overflow-hidden text-sm leading-normal font-medium break-all text-ellipsis text-secondary"
            >
              {{ item.previewText }}
            </div>

            <div class="flex items-center justify-between">
              <span class="text-xs text-secondary">
                {{ formatTime(item.timestamp) }}
              </span>

              <div class="flex gap-2">
                <button
                  class="flex cursor-pointer items-center justify-center rounded-md border-none p-1 text-secondary hover:bg-accent/30 hover:text-white"
                  :title="t('detail')"
                  @click.stop="handleSelectSession(item.threadId)"
                >
                  <SquareMousePointer :size="14" />
                </button>
                <button
                  class="flex cursor-pointer items-center justify-center rounded-md border-none p-1 text-secondary hover:bg-success/30 hover:text-white"
                  :title="t('copyToClipboard')"
                  @click.stop="copyItemPrompt(item.previewText)"
                >
                  <Copy :size="14" />
                </button>
                <button
                  class="flex cursor-pointer items-center justify-center rounded-md border-none p-1 text-secondary hover:bg-danger/50 hover:text-white"
                  :title="t('delete')"
                  @click.stop="deleteSession(item.threadId)"
                >
                  <Delete :size="14" />
                </button>
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
import { ArrowLeft, Copy, Delete, PackageIcon, SquareMousePointer } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { IndexedDBSaver } from '@/api/checkpoints'
import CustomButton from '@/components/CustomButton.vue'
import { message as messageUtil } from '@/utils/message'

const props = defineProps<{
  threadId?: string
  saver: IndexedDBSaver
  currentCheckpointId?: string // 当前正在显示的节点 ID
}>()

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
    messageUtil.success(t('deleteSuccess'))
  } catch (error) {
    console.error('Failed to delete session:', error)
    messageUtil.error(t('deleteFailed'))
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
