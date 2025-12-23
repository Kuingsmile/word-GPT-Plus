import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zhCn from './locales/zh-cn.json'

const messages = {
  en,
  'zh-cn': zhCn
}

export const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('localLanguage') || 'en',
  fallbackLocale: 'zh-cn',
  messages
})
