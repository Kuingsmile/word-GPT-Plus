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
  padding: 8px 10px;
  border-radius: 8px;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-width: 20px;
  max-width: 360px;
  backdrop-filter: blur(12px);
  overflow: hidden;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
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
  height: 3px;
  width: 100%;
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
  background: linear-gradient(135deg, rgba(254, 226, 226, 0.98) 0%, rgba(254, 226, 226, 0.95) 100%);
  border: 1px solid rgba(252, 165, 165, 0.8);
  color: #991b1b;
}

.toast-error .toast-icon svg {
  color: #dc2626;
}

.toast-error .toast-progress {
  background: linear-gradient(90deg, #dc2626, #ef4444);
}

.toast-success {
  background: linear-gradient(135deg, rgba(220, 252, 231, 0.98) 0%, rgba(220, 252, 231, 0.95) 100%);
  border: 1px solid rgba(134, 239, 172, 0.8);
  color: #14532d;
}

.toast-success .toast-icon svg {
  color: #16a34a;
}

.toast-success .toast-progress {
  background: linear-gradient(90deg, #16a34a, #22c55e);
}

.toast-info {
  background: linear-gradient(135deg, rgba(224, 242, 254, 0.98) 0%, rgba(224, 242, 254, 0.95) 100%);
  border: 1px solid rgba(147, 197, 253, 0.8);
  color: #1e3a8a;
}

.toast-info .toast-icon svg {
  color: #2563eb;
}

.toast-info .toast-progress {
  background: linear-gradient(90deg, #2563eb, #3b82f6);
}

.toast-warning {
  background: linear-gradient(135deg, rgba(254, 243, 199, 0.98) 0%, rgba(254, 243, 199, 0.95) 100%);
  border: 1px solid rgba(252, 211, 77, 0.8);
  color: #78350f;
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
