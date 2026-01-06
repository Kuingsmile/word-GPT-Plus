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
              class="checkpoint-item vertical"
              :class="{ active: currentCheckpointId === item.id }"
              :title="'ID: ' + item.id"
              @click="handleRestore(item)"
            >
              <div class="checkpoint-info">
                <component :is="getIcon(item.type)" :size="16" :class="getIconClass(item.type)" />
                <span style="font-weight: 600; font-size: 13px"> Step {{ item.step }}</span>
                <span
                  v-if="item.toolName"
                  style="font-size: 12px; color: #e65100; background: #fff3e0; padding: 0 4px; border-radius: 4px"
                >
                  {{ item.toolName }}
                </span>
                <span style="color: #656d76; font-size: 12px; margin-left: auto">
                  {{ formatTime(item.timestamp) }}
                </span>
              </div>

              <div class="checkpoint-control left-gap">
                <div
                  style="
                    font-size: 13px;
                    color: #57606a;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  "
                >
                  <button class="back-button" :title="$t('back')" @click="loadHistory">
                    <ArrowLeft :size="20" />
                  </button>
                  {{ item.previewText }}
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
import { ArrowLeft, Bot, Clock, Hammer, User } from 'lucide-vue-next'
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

// 图标映射逻辑
const getIcon = (type: string) => {
  switch (type) {
    case 'human':
      return User
    case 'tool':
      return Hammer
    case 'ai':
      return Bot
    default:
      return Clock
  }
}

// 图标颜色样式（内联或辅助类）
const getIconClass = (type: string) => {
  switch (type) {
    case 'human':
      return 'text-blue-500'
    case 'tool':
      return 'text-orange-500'
    case 'ai':
      return 'text-green-500'
    default:
      return 'text-gray-500'
  }
}

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

// // 核心逻辑：加载历史
// const loadHistory = async () => {
//   if (!props.threadId) return
//   loading.value = true
//   historyItems.value = []

//   try {
//     const config: RunnableConfig = {
//       configurable: { thread_id: props.threadId },
//     }

//     // 调用 Saver 的 list 方法
//     // limit: 50 限制加载数量，避免卡顿
//     const iterator = props.saver.list(config, { limit: 50 })

//     for await (const tuple of iterator) {
//       const { checkpoint, metadata, config } = tuple

//       // 解析 checkpoint 里的消息
//       // HACK: 类型断言处理
//       interface CheckpointMessage {
//         _getType: () => 'ai' | 'human' | 'tool'
//         content: string | any
//         tool_calls?: { name: string }[]
//       }

//       const messages = (checkpoint.channel_values?.messages || []) as CheckpointMessage[]
//       const lastMsg = messages.at(-1)

//       if (!lastMsg) continue

//       // 构建视图数据
//       // 这里的 getType 需要做安全检查，防止某些非标准消息报错
//       const msgType = lastMsg._getType ? lastMsg._getType() : 'ai'
//       const isTool = msgType === 'tool'
//       const isAI = msgType === 'ai'
//       const isHuman = msgType === 'human'

//       let type: 'ai' | 'human' | 'tool' = 'ai'
//       if (isTool) type = 'tool'
//       else if (isHuman) type = 'human'

//       // 内容预览处理：处理字符串或复杂对象
//       let previewText = '[Complex Content]'
//       if (typeof lastMsg.content === 'string') {
//         previewText = lastMsg.content
//       } else if (Array.isArray(lastMsg.content)) {
//         // 处理多模态内容或 Block 内容
//         previewText = lastMsg.content.map((c: any) => c.text || '').join(' ')
//       }

//       // 截断过长文本
//       previewText = previewText.slice(0, 100) + (previewText.length > 100 ? '...' : '')
//       if (!previewText) previewText = '[Empty Message]'

//       historyItems.value.push({
//         id: config.configurable?.checkpoint_id || '',
//         step: metadata?.step || 0,
//         timestamp: checkpoint.ts,
//         previewText,
//         type,
//         toolName: isAI && lastMsg.tool_calls?.length ? lastMsg.tool_calls[0].name : undefined,
//       })
//     }
//   } catch (err) {
//     console.error('Failed to load history:', err)
//   } finally {
//     loading.value = false
//   }
// }
const loadHistory = async () => {
  if (!props.threadId) return
  loading.value = true
  historyItems.value = []

  try {
    console.log('[CheckpointsPage] Loading history for thread:', props.threadId)

    const config: RunnableConfig = {
      configurable: { thread_id: props.threadId },
    }

    const iterator = props.saver.list(config, { limit: 50 })

    let count = 0
    for await (const tuple of iterator) {
      count++
      console.log(`[CheckpointsPage] Processing checkpoint ${count}:`, {
        checkpoint_id: tuple.config.configurable?.checkpoint_id,
        step: tuple.metadata?.step,
        has_messages: !!tuple.checkpoint.channel_values?.messages,
        // message_count: tuple.checkpoint.channel_values?.messages?.length,
      })

      const { checkpoint, metadata, config } = tuple

      interface CheckpointMessage {
        _getType?: () => 'ai' | 'human' | 'tool'
        content: string | any
        tool_calls?: { name: string }[]
      }

      const messages = (checkpoint.channel_values?.messages || []) as CheckpointMessage[]
      console.log(`[CheckpointsPage] Messages in checkpoint:`, messages.length)

      const lastMsg = messages.at(-1)

      if (!lastMsg) {
        console.warn('[CheckpointsPage] No last message found')
        continue
      }

      // ✅ 安全地获取消息类型
      let msgType: 'ai' | 'human' | 'tool' = 'ai'
      if (typeof lastMsg._getType === 'function') {
        try {
          msgType = lastMsg._getType()
        } catch (e) {
          console.warn('[CheckpointsPage] Failed to get message type:', e)
        }
      }

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
        previewText = lastMsg.content.map((c: any) => (typeof c === 'string' ? c : c.text || '')).join(' ')
      } else if (lastMsg.content && typeof lastMsg.content === 'object') {
        // 处理对象类型的 content
        previewText = JSON.stringify(lastMsg.content).slice(0, 100)
      }

      previewText = previewText.slice(0, 100) + (previewText.length > 100 ? '...' : '')
      if (!previewText || previewText.trim() === '') previewText = '[Empty Message]'

      historyItems.value.push({
        id: config.configurable?.checkpoint_id || '',
        step: metadata?.step || 0,
        timestamp: checkpoint.ts,
        previewText,
        type,
        toolName: isAI && lastMsg.tool_calls?.length ? lastMsg.tool_calls[0].name : undefined,
      })
    }

    console.log(`[CheckpointsPage] Loaded ${historyItems.value.length} history items`)
  } catch (err) {
    console.error('[CheckpointsPage] Failed to load history:', err)
  } finally {
    loading.value = false
  }
}
// 点击恢复
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
