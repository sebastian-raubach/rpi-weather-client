// Utilities
import { defineStore } from 'pinia'

let name = import.meta.env.VUE_APP_INSTANCE_NAME

if (!name) {
  name = 'gridscore-next-' + window.location.pathname
}

export const coreStore = defineStore('core', {
  state: () => ({
    darkMode: null as (boolean | null),
    systemTheme: 'dark',
    theme: 'light',
    locale: 'en-GB',
    serverUrl: null as (string | null),
    adminUuid: undefined as (string | undefined),
  }),
  getters: {
    storeDarkMode: (state): boolean | null => state.darkMode,
    storeTheme: (state): string => state.theme,
    storeIsDarkMode: (state): boolean => (state.theme === 'system' ? state.systemTheme : state.theme) === 'dark',
    storeSystemTheme: (state): string => state.systemTheme || 'dark',
    storeLocale: (state): string => (state.locale || 'en-GB').replace('_', '-'),
    storeServerUrl: (state): string | null => state.serverUrl,
    storeAdminUuid: (state): string | undefined => state.adminUuid,
  },
  actions: {
    setDarkMode (newDarkMode: boolean) {
      this.darkMode = newDarkMode
    },
    setAdminUuid (newAdminUuid: string | undefined) {
      this.adminUuid = newAdminUuid
    },
    setTheme (newTheme: string) {
      this.theme = newTheme

      if (newTheme !== 'system') {
        this.setDarkMode(newTheme === 'dark')
      }
    },
    setSystemTheme (newSystemTheme: string) {
      this.systemTheme = newSystemTheme
    },
    setLocale (newLocale: string) {
      this.locale = newLocale
    },
    setServerUrl (newServerUrl: string) {
      this.serverUrl = newServerUrl
    },
  },
  persist: {
    key: name,
  },
})
