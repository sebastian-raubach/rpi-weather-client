<template>
  <v-app>
    <v-main>
      <v-app-bar :extension-height="60" absolute class="border-b border-primary border-opacity-100">
        <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer" v-if="smAndDown" />

        <v-img
          class="ms-4"
          style="cursor: pointer" @click="$router.push('/')"
          src="/img/logo.svg"
          max-height="40"
          max-width="40"
          contain
        />

        <v-app-bar-title style="cursor: pointer" @click="$router.push('/')">
          <span v-if="smAndUp">Weather</span>
        </v-app-bar-title>

        <v-spacer />

        <v-menu
          :close-on-content-click="false"
        >
          <template #activator="{ props }">
            <v-btn v-bind="props" :icon="mdiMoonWaningCrescent" />
          </template>
          <v-list>
            <MoonPhaseCalendar />
          </v-list>
        </v-menu>

        <v-menu>
          <template #activator="{ props }">
            <v-btn :icon="mdiThemeLightDark" v-bind="props" />
          </template>
          <v-list>
            <v-list-subheader class="text-high-emphasis text-uppercase font-weight-black">{{ $t('menuTheme') }}</v-list-subheader>
            <v-list-item :prepend-icon="mdiWhiteBalanceSunny" :active="store.storeTheme === 'light'" @click="store.setTheme('light')" :title="$t('menuItemThemeLight')"><template #append><v-icon :icon="mdiCheck" v-if="store.storeTheme === 'light'" /></template></v-list-item>
            <v-list-item :prepend-icon="mdiWeatherNight" :active="store.storeTheme === 'dark'" @click="store.setTheme('dark')" :title="$t('menuItemThemeDark')"><template #append><v-icon :icon="mdiCheck" v-if="store.storeTheme === 'dark'" /></template></v-list-item>
            <v-list-item :prepend-icon="mdiDesktopTowerMonitor" :active="store.storeTheme === 'system'" @click="store.setTheme('system')" :title="$t('menuItemThemeSystem')"><template #append><v-icon :icon="mdiCheck" v-if="store.storeTheme === 'system'" /></template></v-list-item>
          </v-list>
        </v-menu>

        <v-menu>
          <template #activator="{ props }">
            <v-btn v-bind="props" :icon="mdiTranslate" />
          </template>
          <v-list>
            <v-list-subheader class="text-high-emphasis text-uppercase font-weight-black">{{ $t('menuLocale') }}</v-list-subheader>
            <v-list-item
              @click="changeLocale(language.locale)"
              v-for="language in locales"
              :key="`locale-${language.icon}`"
              :value="language.locale"
              :active="language.locale === store.storeLocale"
            >
              <v-list-item-title>{{ language.name }}</v-list-item-title>
              <template #prepend>
                <span class="me-3">{{ language.icon }}</span>
              </template>
              <template #append>
                <v-icon v-if="language.locale === store.storeLocale" :icon="mdiCheck" />
              </template>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-app-bar>

      <v-navigation-drawer
        v-model="drawer"
        :location="mdAndUp ? 'start' : 'top'"
        absolute
        :rail="mdAndUp"
        :permanent="mdAndUp"
        :expand-on-hover="mdAndUp"
      >
        <v-list density="compact" slim nav>
          <v-list-item :prepend-icon="mdiViewDashboard" :title="$t('menuDashboard')" to="/" />
          <v-list-item :prepend-icon="mdiCalendarWeekend" :title="$t('menuMonthly')" to="/monthly" />
          <v-list-item :prepend-icon="mdiCalendarExpandHorizontal" :title="$t('menuYearly')" to="/yearly" />
        </v-list>
      </v-navigation-drawer>

      <div class="h-100">
        <router-view :key="$route.path" class="h-100" />
      </div>
    </v-main>

    <InputModal />

    <v-snackbar-queue timeout="4000" location="bottom" v-model="snackbarQueue" />
    <v-overlay
      :model-value="loading"
      class="align-center justify-center"
      :close-on-content-click="false"
      persistent
    >
      <v-card :title="$t('modalTitleLoading')" width="min(50vw, 400px)" class="d-flex align-center justify-center" :loading="loading">
        <template #loader="{ isActive }">
          <v-progress-linear
            :active="isActive"
            color="primary"
            height="4"
            indeterminate
          />
        </template>
      </v-card>
    </v-overlay>
  </v-app>
</template>

<script lang="ts" setup>
  import { useDisplay, useTheme, type SnackbarQueueMessage } from 'vuetify'
  import { coreStore } from '@/stores/app'
  import { loadLanguageAsync, locales } from '@/plugins/vuetify'
  import { useDark } from '@vueuse/core'

  import emitter from 'tiny-emitter/instance'
  import { mdiTranslate, mdiDesktopTowerMonitor, mdiWeatherNight, mdiWhiteBalanceSunny, mdiThemeLightDark, mdiCheck, mdiViewDashboard, mdiCalendarExpandHorizontal, mdiCalendarWeekend, mdiMoonWaningCrescent } from '@mdi/js'

  const { smAndUp, mdAndUp, smAndDown } = useDisplay()
  const theme = useTheme()
  const store = coreStore()
  const isDark = useDark()

  const drawer = ref(true)
  const loading = ref(false)
  const snackbarQueue = ref<SnackbarQueueMessage[]>([])

  // Set base URL based on environment
  let baseUrl = './api/'
  if (import.meta.env.VITE_BASE_URL) {
    baseUrl = import.meta.env.VITE_BASE_URL
  }

  function changeLocale (locale: string) {
    store.setLocale(locale)
  }

  function showSnackbar (message: SnackbarQueueMessage) {
    snackbarQueue.value.push(message)
  }

  function showLoading (visible: boolean) {
    loading.value = visible
  }

  // Listen for theme changes in the store
  watchEffect(() => {
    const str = isDark.value ? 'dark' : 'light'
    theme.change(store.storeTheme === 'system' ? str : store.storeTheme)
    store.setSystemTheme(str)
  })

  // Listen for changes to store locale and update Vuetify current
  watchEffect(() => {
    loadLanguageAsync(store.storeLocale)
  })

  onBeforeMount(() => {
    loadLanguageAsync(store.storeLocale)
    store.setServerUrl(baseUrl)
  })

  onMounted(() => {
    emitter.on('show-snackbar', showSnackbar)
    emitter.on('show-loading', showLoading)
  })
  onBeforeUnmount(() => {
    emitter.off('show-snackbar', showSnackbar)
    emitter.off('show-loading', showLoading)
  })
</script>
