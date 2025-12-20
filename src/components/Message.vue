<template>
  <Teleport to="body">
    <Transition name="message-fade">
      <div
        v-if="visible"
        class="message-container"
        :class="`message-${type}`"
      >
        <div class="message-content">
          <div class="message-icon">
            <AlertCircle v-if="type === 'error'" />
            <CheckCircle v-if="type === 'success'" />
            <Info v-if="type === 'info'" />
            <AlertTriangle v-if="type === 'warning'" />
          </div>
          <span class="message-text">{{ message }}</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-vue-next'

interface Props {
  message: string
  type?: 'error' | 'success' | 'info' | 'warning'
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000
})

const visible = ref(false)

onMounted(() => {
  visible.value = true
  if (props.duration > 0) {
    setTimeout(() => {
      visible.value = false
    }, props.duration)
  }
})
</script>

<style scoped>
.message-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  min-width: 80vw;
  max-width: 100vw;
  backdrop-filter: blur(10px);
}

.message-content {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.message-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.message-icon svg {
  width: 20px;
  height: 20px;
}

.message-text {
  font-size: 13px;
  line-height: 1.3;
  flex: 1;
}

.message-error {
  background: rgba(254, 226, 226, 0.95);
  border: 1px solid #fca5a5;
  color: #991b1b;
}

.message-error .message-icon svg {
  color: #dc2626;
}

.message-success {
  background: rgba(220, 252, 231, 0.95);
  border: 1px solid #86efac;
  color: #14532d;
}

.message-success .message-icon svg {
  color: #16a34a;
}

.message-info {
  background: rgba(224, 242, 254, 0.95);
  border: 1px solid #93c5fd;
  color: #1e3a8a;
}

.message-info .message-icon svg {
  color: #2563eb;
}

.message-warning {
  background: rgba(254, 243, 199, 0.95);
  border: 1px solid #fcd34d;
  color: #78350f;
}

.message-warning .message-icon svg {
  color: #f59e0b;
}

.message-fade-enter-active,
.message-fade-leave-active {
  transition: all 0.3s ease;
}

.message-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.message-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>
