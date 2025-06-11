import Vue from 'vue'
import VueI18n from 'vue-i18n'

import enGB from '@/plugin/i18n/en_GB.json'

Vue.use(VueI18n)

const messages = {
  en_GB: enGB
}

export const i18n = new VueI18n({
  locale: 'en_GB',
  fallbackLocale: 'en_GB',
  warnHtmlInMessage: 'off',
  messages: messages
})
