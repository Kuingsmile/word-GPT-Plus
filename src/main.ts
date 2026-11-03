import './index.css'

import { createApp } from 'vue'

import App from './App.vue'
import { i18n } from './i18n'
import router from './router'
import { logDiagnostic } from './utils/diagnostics'

window.Office.onReady(() => {
  const app = createApp(App)
  // Vue's default error handler can print SDK payloads and component state.
  app.config.errorHandler = error => logDiagnostic('error', '[App] Unhandled error', { error })
  const debounce = (callback: ResizeObserverCallback, delay = 16): ResizeObserverCallback => {
    let timer: number | undefined
    return (entries, observer) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => callback(entries, observer), delay)
    }
  }

  const _ResizeObserver = window.ResizeObserver
  window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      callback = debounce(callback, 16)
      super(callback)
    }
  }
  app.use(i18n)
  app.use(router)
  app.mount('#app')
}).catch(error => logDiagnostic('error', '[App] Initialization failed', { error }))
