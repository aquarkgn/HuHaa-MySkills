import { defineStore } from 'pinia'

export const useI18nStore = defineStore('i18n', {
  state: () => ({
    locale: 'zh-CN',
    messages: {
      'zh-CN': {},
      'en-US': {}
    }
  }),
  
  getters: {
    currentLocale: (state) => state.locale,
    t: (state) => (key) => key
  },
  
  actions: {
    setLocale(locale) {
      this.locale = locale
    },
    
    setMessages(locale, messages) {
      this.messages[locale] = messages
    }
  }
})
