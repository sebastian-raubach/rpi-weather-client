<template>
  <v-container fluid>
    <v-date-input
      v-model="dateRange"
      class="mb-3"
      prepend-icon=""
      prepend-inner-icon="$calendar"
      hint="m"
      :persistent-hint="lastUpdateXAgo !== undefined"
      :label="$t('formLabelSelectDateRange')"
      multiple="range"
    >
      <template #message>
        <span :class="lastUpdatedMoreThanTenMins ? 'text-error' : undefined">{{ lastUpdateXAgo }}</span>
      </template>
      <template #append>
        <v-btn @click="update" :icon="mdiRefresh" variant="tonal" color="primary" />
      </template>
    </v-date-input>

    <v-row v-if="weatherData && weatherData.length > 0">
      <v-col
        cols="12"
        sm="6"
        md="4"
        lg="3"
        v-for="variable in availableVariables"
        :key="`variable-card-${variable}`"
      >
        <VariableCard
          :color="variable.trace.color"
          :icon="variable.icon"
          :title="variable.title"
          :subtitle="variable.yTitle"
          :measurements="weatherDataByVariable[variable.key] || []"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="6" v-if="arcs && arcs.sun && arcs.moon">
        <LineChart
          :icon="mdiSunAngle"
          :traces="[{ name: 'Sun', color: '#FFC312', measurements: arcs.sun, fill: 'tozeroy' }, { name: 'Moon', color: '#a5b1c2', measurements: arcs.moon, fill: 'tozeroy' }]"
          :title="$t('variableSunMoon')"
          x-title="axisTitleTime"
          y-title=""
        />
      </v-col>
      <template v-for="variable in availableVariables" :key="`chart-${variable.key}`">
        <v-col cols="12" lg="6" v-if="variable.trace" class="d-flex flex-grow-1">
          <LineChart
            class="flex-grow-1"
            :icon="variable.icon"
            :traces="[variable.trace]"
            :forecast="variable.forecast"
            :title="variable.title"
            x-title="axisTitleTime"
            :y-title="variable.yTitle"
            @rainfall-range-selected="setRainfallRange"
          >
            <template #append v-if="variable.trace.name === 'variableRainfall' && rainfallRange">
              <v-card-actions>
                <v-spacer />
                <v-btn color="error" :prepend-icon="mdiVectorSquareRemove" variant="tonal" :text="$t('buttonDeleteRainfall')" @click="attemptDeleteRainfall" />
              </v-card-actions>
            </template>
          </LineChart>
        </v-col>
      </template>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import { apiDeleteRainfall, apiGetData, apiGetForecast, apiGetLatestDate, apiGetLocation } from '@/plugins/api'
  import VariableCard from '@/components/VariableCard.vue'
  import { mdiRefresh, mdiSunAngle, mdiVectorSquareRemove } from '@mdi/js'
  import type { Location, ExtendedMeasurement, MinimalMeasurement, Measurements } from '@/plugins/types/rpi-weather'
  import { useI18n } from 'vue-i18n'
  import LineChart, { type Trace } from '@/components/chart/LineChart.vue'
  import { VARIABLES } from '@/plugins/constants'

  import SunCalc from 'suncalc'
  import { coreStore } from '@/stores/app'
  import emitter from 'tiny-emitter/instance'

  interface Variable {
    key: string
    icon: string
    title: string
    yTitle: string
    trace: Trace
    forecast?: Trace
  }

  const { t } = useI18n()
  const store = coreStore()

  const dateRange = ref<Date[]>([new Date()])

  const weatherData = ref<ExtendedMeasurement[]>([])
  const forecast = ref<Measurements[]>([])
  const loading = ref(false)
  const location = ref<Location>()
  const rainfallRange = ref<string[] | undefined>(undefined)
  const latestMeasurement = ref<Date>()
  const now = ref<Date>(new Date())

  let interval: number

  const DIVISIONS = [
    { amount: 60, name: 'seconds' },
    { amount: 60, name: 'minutes' },
    { amount: 24, name: 'hours' },
    { amount: 7, name: 'days' },
    { amount: 4.345_24, name: 'weeks' },
    { amount: 12, name: 'months' },
    { amount: Number.POSITIVE_INFINITY, name: 'years' },
  ]

  const arcs = computed(() => {
    if (dateRange.value && dateRange.value.length > 0 && location.value) {
      const current = new Date(dateRange.value[0]?.getTime() || Date.now())
      current.setHours(0, 0, 0, 0)
      const end = dateRange.value[dateRange.value.length - 1] || new Date()
      end.setHours(23, 59, 59, 999)
      const sun: MinimalMeasurement[] = []
      const moon: MinimalMeasurement[] = []

      let sunElevation = SunCalc.getPosition(current, location.value.latitude, location.value.longitude)
      sun.push({ created: new Date(current), value: sunElevation.altitude })
      let moonElevation = SunCalc.getMoonPosition(current, location.value.latitude, location.value.longitude)
      moon.push({ created: new Date(current), value: moonElevation.altitude })

      do {
        sunElevation = SunCalc.getPosition(current, location.value.latitude, location.value.longitude)
        sun.push({ created: new Date(current), value: sunElevation.altitude })
        moonElevation = SunCalc.getMoonPosition(current, location.value.latitude, location.value.longitude)
        moon.push({ created: new Date(current), value: moonElevation.altitude })

        current.setMinutes(current.getMinutes() + 30)
      } while (current.getTime() < end.getTime())

      current.setMinutes(current.getMinutes() - 1)
      sunElevation = SunCalc.getPosition(current, location.value.latitude, location.value.longitude)
      sun.push({ created: new Date(current), value: sunElevation.altitude })
      moonElevation = SunCalc.getMoonPosition(current, location.value.latitude, location.value.longitude)
      moon.push({ created: new Date(current), value: moonElevation.altitude })

      return {
        moon,
        sun,
      }
    } else {
      return undefined
    }
  })

  const variables: ComputedRef<Variable[]> = computed(() => {
    return [{
      key: 'ambientTemp',
      icon: VARIABLES.ambientTemp?.icon || '',
      title: t(VARIABLES.ambientTemp?.title || ''),
      yTitle: t(VARIABLES.ambientTemp?.unit || ''),
      trace: { name: 'variableAmbientTemp', color: VARIABLES.ambientTemp?.color || '', measurements: weatherDataByVariable.value['ambientTemp'] || [] },
      forecast: { name: 'variableForecast', color: VARIABLES.ambientTemp?.color || '', measurements: forecastDataByVariable.value['ambientTemp'] || [] },
    }, {
      key: 'groundTemp',
      icon: VARIABLES.groundTemp?.icon || '',
      title: t(VARIABLES.groundTemp?.title || ''),
      yTitle: t(VARIABLES.groundTemp?.unit || ''),
      trace: { name: 'variableGroundTemp', color: VARIABLES.groundTemp?.color || '', measurements: weatherDataByVariable.value['groundTemp'] || [] },
    }, {
      key: 'rainfall',
      icon: VARIABLES.rainfall?.icon || '',
      title: t(VARIABLES.rainfall?.title || ''),
      yTitle: t(VARIABLES.rainfall?.unit || ''),
      trace: { name: 'variableRainfall', color: VARIABLES.rainfall?.color || '', measurements: weatherDataByVariable.value['rainfall'] || [] },
      forecast: { name: 'variableForecast', color: VARIABLES.rainfall?.color || '', measurements: forecastDataByVariable.value['rainfall'] || [] },

    }, {
      key: 'humidity',
      icon: VARIABLES.humidity?.icon || '',
      title: t(VARIABLES.humidity?.title || ''),
      yTitle: t(VARIABLES.humidity?.unit || ''),
      trace: { name: 'variableHumidity', color: VARIABLES.humidity?.color || '', measurements: weatherDataByVariable.value['humidity'] || [] },
      forecast: { name: 'variableForecast', color: VARIABLES.humidity?.color || '', measurements: forecastDataByVariable.value['humidity'] || [] },
    }, {
      key: 'pressure',
      icon: VARIABLES.pressure?.icon || '',
      title: t(VARIABLES.pressure?.title || ''),
      yTitle: t(VARIABLES.pressure?.unit || ''),
      trace: { name: 'variablePressure', color: VARIABLES.pressure?.color || '', measurements: weatherDataByVariable.value['pressure'] || [] },
      forecast: { name: 'variableForecast', color: VARIABLES.pressure?.color || '', measurements: forecastDataByVariable.value['pressure'] || [] },
    }, {
      key: 'lux',
      icon: VARIABLES.lux?.icon || '',
      title: t(VARIABLES.lux?.title || ''),
      yTitle: t(VARIABLES.lux?.unit || ''),
      trace: { name: 'variableLux', color: VARIABLES.lux?.color || '', measurements: weatherDataByVariable.value['lux'] || [] },
    }, {
      key: 'piTemp',
      icon: VARIABLES.piTemp?.icon || '',
      title: t(VARIABLES.piTemp?.title || ''),
      yTitle: t(VARIABLES.piTemp?.unit || ''),
      trace: { name: 'variablePiTemp', color: VARIABLES.piTemp?.color || '', measurements: weatherDataByVariable.value['piTemp'] || [] },
    }, {
      key: 'windSpeed',
      icon: VARIABLES.windSpeed?.icon || '',
      title: t(VARIABLES.windSpeed?.title || ''),
      yTitle: t(VARIABLES.windSpeed?.unit || ''),
      trace: { name: 'variableWindSpeed', color: VARIABLES.windSpeed?.color || '', measurements: weatherDataByVariable.value['windSpeed'] || [] },
      forecast: { name: 'variableForecast', color: VARIABLES.windSpeed?.color || '', measurements: forecastDataByVariable.value['windSpeed'] || [] },
    }, {
      key: 'windGust',
      icon: VARIABLES.windGust?.icon || '',
      title: t(VARIABLES.windGust?.title || ''),
      yTitle: t(VARIABLES.windGust?.unit || ''),
      trace: { name: 'variableGustSpeed', color: VARIABLES.windGust?.color || '', measurements: weatherDataByVariable.value['windGust'] || [] },
    }, {
      key: 'loftTemp',
      icon: VARIABLES.loftTemp?.icon || '',
      title: t(VARIABLES.loftTemp?.title || ''),
      yTitle: t(VARIABLES.loftTemp?.unit || ''),
      trace: { name: 'variableLoftTemp', color: VARIABLES.loftTemp?.color || '', measurements: weatherDataByVariable.value['loftTemp'] || [] },
    }, {
      key: 'loftHumidity',
      icon: VARIABLES.loftHumidity?.icon || '',
      title: t(VARIABLES.loftHumidity?.title || ''),
      yTitle: t(VARIABLES.loftHumidity?.unit || ''),
      trace: { name: 'variableLoftHumidity', color: VARIABLES.loftHumidity?.color || '', measurements: weatherDataByVariable.value['loftHumidity'] || [] },
    }]
  })

  const availableVariables = computed(() => {
    if (weatherDataByVariable.value) {
      return variables.value.filter(v => weatherDataByVariable.value[v.key])
    } else {
      return []
    }
  })

  const forecastDataByVariable: ComputedRef<{ [index: string]: MinimalMeasurement[] }> = computed(() => {
    const result: { [index: string]: MinimalMeasurement[] } = {}

    if (forecast.value) {
      forecast.value.forEach(wv => {
        Object.keys(wv).forEach(k => {
          if (!result[k]) {
            result[k] = []
          }

          let prev = 0

          if (k === 'rainfall') {
            if (result[k].length === 0 && weatherDataByVariable.value[k] && weatherDataByVariable.value[k].length > 0) {
              // If this is the first forecast value, make sure it starts at the level of the last actual measurement (vertically aligning the forecast with the actuals)
              prev = weatherDataByVariable.value[k][weatherDataByVariable.value[k].length - 1]?.value || 0
            } else if (result[k].length > 0 && result[k][result[k].length - 1]?.value) {
              prev = result[k][result[k].length - 1]?.value || 0
            }
          }

          result[k].push({
            // @ts-ignore
            created: wv.created,
            // @ts-ignore
            value: prev + wv[k],
          })
        })
      })
    }

    return result
  })

  const weatherDataByVariable: ComputedRef<{ [index: string]: MinimalMeasurement[] }> = computed(() => {
    const result: { [index: string]: MinimalMeasurement[] } = {}

    if (weatherData.value) {
      weatherData.value.forEach(wv => {
        Object.keys(wv).forEach(k => {
          if (!result[k]) {
            result[k] = []
          }

          let prev = 0

          if (k === 'rainfall' && result[k].length > 0 && result[k][result[k].length - 1]?.value) {
            prev = result[k][result[k].length - 1]?.value || 0
          }

          result[k].push({
            // @ts-ignore
            created: wv.created,
            // @ts-ignore
            value: prev + wv[k],
          })
        })
      })
    }

    return result
  })

  const lastUpdatedMoreThanTenMins = computed(() => {
    if (latestMeasurement.value && now.value) {
      const duration = (latestMeasurement.value.getTime() - now.value.getTime()) / 1000

      return duration > 600
    } else {
      return false
    }
  })

  const lastUpdateXAgo = computed(() => {
    if (latestMeasurement.value && now.value) {
      const formatter = new Intl.RelativeTimeFormat('en', {
        numeric: 'always',
      })

      let duration = (latestMeasurement.value.getTime() - now.value.getTime()) / 1000

      for (let i = 0; i <= DIVISIONS.length; i++) {
        const division = DIVISIONS[i]
        if (division) {
          if (Math.abs(duration) < division.amount) {
            // @ts-ignore
            return formatter.format(Math.round(duration), division.name)
          }
          duration /= division.amount
        }
      }

      return undefined
    } else {
      return undefined
    }
  })

  function getLatest () {
    apiGetLatestDate()
      .then(result => {
        latestMeasurement.value = new Date(result?.[0] || '')
      })
  }

  function attemptDeleteRainfall () {
    if (store.storeAdminUuid) {
      deleteRainfall()
    } else {
      emitter.emit('show-input', {
        title: t('modalTitleAdminUuid'),
        message: t('modalTitleAdminUuid'),
        okTitle: t('buttonOk'),
        cancelTitle: t('buttonCancel'),
        okVariant: 'success',
        callback: (result: string | undefined) => {
          if (result !== undefined) {
            store.setAdminUuid(result)

            nextTick(() => deleteRainfall())
          }
        },
      })
    }
  }

  function deleteRainfall () {
    if (rainfallRange.value && store.storeAdminUuid) {
      const start = new Date(rainfallRange.value[0] || '').toISOString()
      const end = new Date(rainfallRange.value[1] || '').toISOString()

      apiDeleteRainfall(start, end, store.storeAdminUuid)
        .then(() => {
          update()
        })
    }
  }

  function getTimestamp (date: Date, start: boolean) {
    if (start) {
      return new Date(`${date.toISOString().split('T')[0]} 00:00:01`)
    } else {
      return new Date(`${date.toISOString().split('T')[0]} 23:59:59`)
    }
  }

  function setRainfallRange (range: string[] | undefined) {
    rainfallRange.value = range
  }

  function update () {
    rainfallRange.value = undefined

    if (loading.value) {
      return
    }

    loading.value = true

    const dates = dateRange.value || [new Date()]

    if (dates.length === 0 || !dates[0]) {
      return
    }
    const [from, to] = [getTimestamp(dates[0], true), getTimestamp(dates[dates.length - 1] || new Date(), false)]

    if (from && to) {
      apiGetData(from, to)
        .then(data => {
          loading.value = false
          weatherData.value = data || []

          getLatest()
        })
        .catch(() => {
          loading.value = false
        })
      apiGetForecast(from, to)
        .then(fc => {
          forecast.value = fc || []
        })
    }
  }

  function setNow () {
    now.value = new Date()
  }

  onBeforeUnmount(() => {
    if (interval) {
      clearInterval(interval)
    }
  })

  onMounted(() => {
    interval = setInterval(setNow, 60_000)

    update()

    apiGetLocation()
      .then(l => {
        location.value = l
      })
  })

  watch(dateRange, async () => update())
</script>
