import { createApp } from 'vue'

import Message from '@/components/Message.vue'

interface MessageOptions {
  message: string
  type?: 'error' | 'success' | 'info' | 'warning'
  duration?: number
}

let messageInstance: any = null

function showMessage(options: MessageOptions) {
  if (messageInstance) {
    messageInstance.unmount()
    const existingContainer = document.getElementById('message-container')
    if (existingContainer) {
      document.body.removeChild(existingContainer)
    }
  }

  const container = document.createElement('div')
  container.id = 'message-container'
  document.body.appendChild(container)

  messageInstance = createApp(Message, {
    ...options,
    onClose: () => {
      setTimeout(() => {
        if (messageInstance) {
          messageInstance.unmount()
          const msgContainer = document.getElementById('message-container')
          if (msgContainer && document.body.contains(msgContainer)) {
            document.body.removeChild(msgContainer)
          }
          messageInstance = null
        }
      }, 300)
    },
  })

  messageInstance.mount(container)
}

export const message = {
  error: (msg: string, duration = 3000) => {
    showMessage({ message: msg, type: 'error', duration })
  },
  success: (msg: string, duration = 3000) => {
    showMessage({ message: msg, type: 'success', duration })
  },
  info: (msg: string, duration = 3000) => {
    showMessage({ message: msg, type: 'info', duration })
  },
  warning: (msg: string, duration = 3000) => {
    showMessage({ message: msg, type: 'warning', duration })
  },
}
