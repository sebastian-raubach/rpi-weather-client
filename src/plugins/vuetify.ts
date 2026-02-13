/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
// import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import axios from 'axios'

import { aliases as defaultAliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { createVuetify, type IconAliases } from 'vuetify'
import { VDateInput } from 'vuetify/labs/VDateInput'

import enGB from '@/plugins/i18n/en_GB.json'
import deDE from '@/plugins/i18n/de_DE.json'

import { createI18n, useI18n } from 'vue-i18n'
import { en, de } from 'vuetify/locale'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'

const aliases: IconAliases = {
  ...defaultAliases,
}

// @ts-ignore
enGB.$vuetify = en
// @ts-ignore
deDE.$vuetify = de

const locales = [{
  locale: 'en-GB',
  name: 'British English',
  direction: 'ltr',
  icon: '🇬🇧',
}, {
  locale: 'de-DE',
  name: 'Deutsch - Deutschland',
  direction: 'ltr',
  icon: '🇩🇪',
}]

type MessageType = typeof enGB | typeof deDE

const messages: { [key: string]: MessageType } = {
  en: enGB,
  de: deDE,
}

const i18n = createI18n({
  locale: undefined,
  fallbackLocale: 'en',
  messages,
  legacy: false,
  globalInjection: true,
  warnHtmlMessage: false,
})

type VuetifyType = ReturnType<typeof createVuetify>

let vuetify: VuetifyType

function getVuetify () {
  return vuetify
}

function initVuetify () {
  // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
  vuetify = createVuetify({
    components: {
      VDateInput,
    },
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
      },
    },
    theme: {
      defaultTheme: 'system',
      themes: {
        light: {
          dark: false,
          colors: {
            primary: '#2d98da',
            muted: '#868e96',
            info: '#2980b9',
            success: '#27ae60',
            error: '#c0392b',
            warning: '#f39c12',
          },
        },
        dark: {
          dark: true,
          colors: {
            primary: '#41a2cf',
            muted: '#868e96',
            info: '#3498db',
            success: '#2ecc71',
            error: '#e74c3c',
            warning: '#f1c40f',
          },
        },
      },
    },
    locale: {
      adapter: createVueI18nAdapter({ i18n, useI18n }),
    },
  })

  return vuetify
}

function setI18nLanguage (lang: string) {
  if (vuetify) {
    vuetify.locale.current.value = lang
  }
  axios.defaults.headers.common['Accept-Language'] = lang

  let htmlTag = lang
  const underscoreIndex = lang.indexOf('-')
  if (underscoreIndex !== -1) {
    htmlTag = lang.slice(0, underscoreIndex)
  }
  document.querySelector('html')?.setAttribute('lang', htmlTag)

  const match = locales.find(l => l.locale === lang)

  if (match) {
    document.querySelector('html')?.setAttribute('dir', match.direction)
  }

  return lang
}

async function loadLanguageAsync (locale: string) {
  // If different language
  if (i18n.global.locale.value !== locale) {
    // load locale messages with dynamic import
    const messages = await import(
      /* webpackChunkName: "locale-[request]" */ `@/plugins/i18n/${locale.replace('-', '_')}.json`,
    )

    setI18nLanguage(locale)

    // set locale and locale message
    i18n.global.setLocaleMessage(locale, messages.default)
  }

  return nextTick()
}

export {
  initVuetify,
  i18n,
  loadLanguageAsync,
  locales,
  getVuetify,
}
