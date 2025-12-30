<template>
  <Teleport to="body">
    <Transition name="toast-slide">
      <div v-if="visible" class="toast-container" :class="`toast-${type}`">
        <div class="toast-content">
          <div class="toast-icon">
            <AlertCircle v-if="type === 'error'" />
            <CheckCircle v-if="type === 'success'" />
            <Info v-if="type === 'info'" />
            <AlertTriangle v-if="type === 'warning'" />
          </div>
          <span class="toast-text">{{ message }}</span>
        </div>
        <div class="toast-progress" :style="{ animationDuration: `${duration}ms` }"></div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'

interface Props {
  message: string
  type?: 'error' | 'success' | 'info' | 'warning'
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000,
})

const visible = ref(false)
const emit = defineEmits(['close'])

onMounted(() => {
  visible.value = true
  if (props.duration > 0) {
    setTimeout(() => {
      visible.value = false
      setTimeout(() => emit('close'), 300)
    }, props.duration)
  }
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 9999;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  border-radius: 8px;
  padding: 8px 10px;
  min-width: 20px;
  max-width: 360px;
  box-shadow:
    0 8px 24px rgb(0 0 0 / 12%),
    0 2px 8px rgb(0 0 0 / 8%);
  flex-direction: column;
  backdrop-filter: blur(12px);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.toast-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.toast-icon svg {
  width: 18px;
  height: 18px;
}

.toast-text {
  font-size: 13px;
  line-height: 1.4;
  flex: 1;
  font-weight: 500;
  word-break: break-word;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  transform-origin: left;
  animation: toast-progress linear forwards;
}

@keyframes toast-progress {
  from {
    transform: scaleX(1);
  }

  to {
    transform: scaleX(0);
  }
}

.toast-error {
  border: 1px solid rgb(252 165 165 / 80%);
  color: #991b1b;
  background: linear-gradient(135deg, rgb(254 226 226 / 98%) 0%, rgb(254 226 226 / 95%) 100%);
}

.toast-error .toast-icon svg {
  color: #dc2626;
}

.toast-error .toast-progress {
  background: linear-gradient(90deg, #dc2626, #ef4444);
}

.toast-success {
  border: 1px solid rgb(134 239 172 / 80%);
  color: #14532d;
  background: linear-gradient(135deg, rgb(220 252 231 / 98%) 0%, rgb(220 252 231 / 95%) 100%);
}

.toast-success .toast-icon svg {
  color: #16a34a;
}

.toast-success .toast-progress {
  background: linear-gradient(90deg, #16a34a, #22c55e);
}

.toast-info {
  border: 1px solid rgb(147 197 253 / 80%);
  color: #1e3a8a;
  background: linear-gradient(135deg, rgb(224 242 254 / 98%) 0%, rgb(224 242 254 / 95%) 100%);
}

.toast-info .toast-icon svg {
  color: #2563eb;
}

.toast-info .toast-progress {
  background: linear-gradient(90deg, #2563eb, #3b82f6);
}

.toast-warning {
  border: 1px solid rgb(252 211 77 / 80%);
  color: #78350f;
  background: linear-gradient(135deg, rgb(254 243 199 / 98%) 0%, rgb(254 243 199 / 95%) 100%);
}

.toast-warning .toast-icon svg {
  color: #f59e0b;
}

.toast-warning .toast-progress {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}
</style>
