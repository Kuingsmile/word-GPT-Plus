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
      <div class="checkpoint-body">
        <div class="no-checkpoint-body">
          {{ $t('NocheckPoints') || 'No History Records' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RunnableConfig } from '@langchain/core/runnables'
import { ArrowLeft } from 'lucide-vue-next'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { IndexedDBSaver } from '@/api/checkpoints'
const router = useRouter()

// 定义 Props
const props = defineProps<{
  threadId: string
  saver: IndexedDBSaver
  currentCheckpointId?: string // 当前正在显示的节点 ID
}>()

// 定义 Emits
// const emit = defineEmits<(e: 'restore', checkpointId: string) => void>()

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

// 核心逻辑：加载历史
const loadHistory = async () => {
  if (!props.threadId) return
  loading.value = true
  historyItems.value = []

  try {
    const config: RunnableConfig = {
      configurable: { thread_id: props.threadId },
    }

    // 调用 Saver 的 list 方法
    // 假设 list 返回的是 AsyncGenerator
    const iterator = props.saver.list(config, { limit: 50 })

    for await (const tuple of iterator) {
      const { checkpoint, metadata, config } = tuple

      // 解析 checkpoint 里的消息
      // LangGraph 的 checkpoint 通常包含 channel_values
      // HACK: The type of checkpoint is `any`, manually define the type of the message
      interface CheckpointMessage {
        _getType: () => 'ai' | 'human' | 'tool'
        content: string | any
        tool_calls?: { name: string }[]
      }
      const messages = (checkpoint.channel_values?.messages || []) as CheckpointMessage[]
      const lastMsg = messages.at(-1)

      if (!lastMsg) continue

      // 构建视图数据
      const isTool = lastMsg._getType() === 'tool'
      const isAI = lastMsg._getType() === 'ai'

      historyItems.value.push({
        id: config.configurable?.checkpoint_id || '',
        step: metadata?.step || 0,
        timestamp: checkpoint.ts, // ISO string
        previewText:
          typeof lastMsg.content === 'string'
            ? lastMsg.content.slice(0, 50) + (lastMsg.content.length > 50 ? '...' : '')
            : '[非文本内容]',
        type: isTool ? 'tool' : isAI ? 'ai' : 'human',
        toolName: isAI && lastMsg.tool_calls?.length ? lastMsg.tool_calls[0].name : undefined,
      })
    }
  } catch (err) {
    console.error('Failed to load history:', err)
  } finally {
    loading.value = false
  }
}

// // 格式化时间
// const formatTime = (isoStr: string) => {
//   return new Date(isoStr).toLocaleTimeString()
// }

// // 点击恢复
// const handleRestore = (item: HistoryViewItem) => {
//   if (confirm(`确定要回溯到 Step ${item.step} 吗？之后的操作将被创建一个新的分支。`)) {
//     emit('restore', item.id)
//   }
// }

// 监听 threadId 变化自动加载
watch(
  () => props.threadId,
  () => {
    loadHistory()
  },
  { immediate: true },
)

// 暴露 loadHistory 给父组件，以便在对话更新后刷新列表
defineExpose({ loadHistory })
function backToHome() {
  router.push('/')
}
</script>

<style scoped src="./checkPointsPage.css"></style>
