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
          :color="variable.traces[0]?.color || '#00acef'"
          :icon="variable.icon"
          :title="variable.title"
          :subtitle="variable.yTitle"
          :measurements="variable.traces[0]?.measurements || []"
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
      <v-col cols="12" lg="6" v-if="tidalData">
        <LineChart
          :icon="mdiWaves"
          smooth
          :traces="[{ name: 'Tide', color: '#1289A7', measurements: tidalData, fill: 'tozeroy' }]"
          :title="$t('variableTide')"
          x-title="axisTitleTime"
          y-title=""
        />
      </v-col>
      <template v-for="variable in availableVariables" :key="`chart-${variable.key}`">
        <v-col cols="12" lg="6" v-if="variable.traces" class="d-flex flex-grow-1">
          <LineChart
            class="flex-grow-1"
            :icon="variable.icon"
            :traces="variable.traces"
            :forecast="variable.forecast"
            :title="variable.title"
            x-title="axisTitleTime"
            :y-title="variable.yTitle"
            @rainfall-range-selected="setRainfallRange"
          >
            <template #append v-if="variable.traces[0]?.name === 'variableRainfall' && rainfallRange">
              <v-card-actions>
                <v-spacer />
                <v-btn color="error" :prepend-icon="mdiVectorSquareRemove" variant="tonal" :text="$t('buttonDeleteRainfall')" @click="attemptDeleteRainfall" />
              </v-card-actions>
            </template>
          </LineChart>
        </v-col>
      </template>
    </v-row>

    <v-fab
      app
      color="primary"
      location="bottom right"
      @click="update"
      :icon="mdiRefresh"
    />
  </v-container>
</template>

<script setup lang="ts">
  import { apiDeleteRainfall, apiGetData, apiGetForecast, apiGetLatestDate, apiGetLocation, apiGetTidal } from '@/plugins/api'
  import VariableCard from '@/components/VariableCard.vue'
  import { mdiRefresh, mdiSunAngle, mdiVectorSquareRemove, mdiWaves } from '@mdi/js'
  import type { Location, ExtendedMeasurement, MinimalMeasurement, Measurements } from '@/plugins/types/rpi-weather'
  import { useI18n } from 'vue-i18n'
  import LineChart, { type Trace } from '@/components/chart/LineChart.vue'
  import { VARIABLES } from '@/plugins/constants'
  import { useGeolocation } from '@vueuse/core'

  import SunCalc from 'suncalc'
  import { coreStore } from '@/stores/app'
  import emitter from 'tiny-emitter/instance'

  interface Variable {
    key: string
    icon: string
    title: string
    yTitle: string
    traces: Trace[]
    forecast?: Trace
  }

  const { t } = useI18n()
  const store = coreStore()
  const { coords } = useGeolocation()

  const dateRange = ref<string[]>([new Date().toISOString().slice(0, 10)])

  const weatherData = ref<ExtendedMeasurement[]>([])
  const forecast = ref<Measurements[]>([])
  const loading = ref(false)
  const location = ref<Location>()
  const rainfallRange = ref<string[] | undefined>(undefined)
  const latestMeasurement = ref<Date>()
  const now = ref<Date>(new Date())
  const tidalData = ref<MinimalMeasurement[]>([])

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
    if (dateRange.value && dateRange.value.length > 0 && usedLocation.value) {
      const current = new Date(dateRange.value[0] || new Date().toISOString().slice(0, 10))
      current.setHours(0, 0, 0, 0)
      const end = new Date(dateRange.value[dateRange.value.length - 1] || new Date().toISOString().slice(0, 10))
      end.setHours(23, 59, 59, 999)
      const sun: MinimalMeasurement[] = []
      const moon: MinimalMeasurement[] = []

      let sunElevation = SunCalc.getPosition(current, usedLocation.value.latitude, usedLocation.value.longitude)
      sun.push({ created: new Date(current), value: sunElevation.altitude })
      let moonElevation = SunCalc.getMoonPosition(current, usedLocation.value.latitude, usedLocation.value.longitude)
      moon.push({ created: new Date(current), value: moonElevation.altitude })

      do {
        sunElevation = SunCalc.getPosition(current, usedLocation.value.latitude, usedLocation.value.longitude)
        sun.push({ created: new Date(current), value: sunElevation.altitude })
        moonElevation = SunCalc.getMoonPosition(current, usedLocation.value.latitude, usedLocation.value.longitude)
        moon.push({ created: new Date(current), value: moonElevation.altitude })

        current.setMinutes(current.getMinutes() + 30)
      } while (current.getTime() < end.getTime())

      current.setMinutes(current.getMinutes() - 1)
      sunElevation = SunCalc.getPosition(current, usedLocation.value.latitude, usedLocation.value.longitude)
      sun.push({ created: new Date(current), value: sunElevation.altitude })
      moonElevation = SunCalc.getMoonPosition(current, usedLocation.value.latitude, usedLocation.value.longitude)
      moon.push({ created: new Date(current), value: moonElevation.altitude })

      return {
        moon,
        sun,
      }
    } else {
      return undefined
    }
  })

  const usedLocation = computed(() => {
    if (coords.value && isFinite(coords.value.latitude) && isFinite(coords.value.longitude)) {
      return {
        latitude: coords.value.latitude,
        longitude: coords.value.longitude,
      }
    } else {
      return location.value
    }
  })

  const variables: ComputedRef<Variable[]> = computed(() => {
    let ms = (weatherDataByVariable.value['rainfall'] || [])

    const ns: MinimalMeasurement[] = []
    ms.forEach((mm, mi) => {
      ns.push({
        created: mm.created,
        value: mi > 0 ? ((ms[mi]?.value || 0) + (ns[mi - 1]?.value || 0)) : (ms[mi]?.value || 0),
      })
    })

    const rainfall: Variable = {
      key: 'rainfall',
      icon: VARIABLES.rainfall?.icon || '',
      title: t(VARIABLES.rainfall?.title || ''),
      yTitle: t(VARIABLES.rainfall?.unit || ''),
      traces: [{ name: 'variableRainfall', color: VARIABLES.rainfall?.color || '', measurements: ns }],
      forecast: { name: 'variableForecast', color: VARIABLES.rainfall?.color || '', measurements: forecastDataByVariable.value['rainfall'] || [] },
    }

    ms = weatherDataByVariable.value['rainfall'] || []
    if (ms.length > 2) {
      const xs = ms.map(v => v.created)
      const ys = ms.map(v => v.value)

      // @ts-ignore
      const minDate = new Date(xs[0])
      minDate.setMinutes(0)
      minDate.setSeconds(0)
      minDate.setMilliseconds(0)
      // @ts-ignore
      const maxDate = new Date(xs[xs.length - 1])
      const hours = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60))

      const xr = Array.from(new Array(hours).keys()).map(i => new Date(minDate.getTime() + (i * 1000 * 60 * 60)))
      const yr = xr.map(_ => 0)

      let yi = 0
      ys.forEach((yy, i) => {
        // @ts-ignore
        yr[yi] += yy

        // @ts-ignore
        if (new Date(xs[i]) >= xr[yi + 1]) {
          yi++
        }
      })

      rainfall.traces.push({ name: 'variableRainfallMMH', type: 'bar', color: VARIABLES.rainfall?.color || '', measurements: xr.map((xrr, xri) => {
        return {
          created: xrr,
          value: yr[xri] || 0,
        }
      }) })
    }

    console.log(rainfall)

    return [{
      key: 'ambientTemp',
      icon: VARIABLES.ambientTemp?.icon || '',
      title: t(VARIABLES.ambientTemp?.title || ''),
      yTitle: t(VARIABLES.ambientTemp?.unit || ''),
      traces: [{ name: 'variableAmbientTemp', color: VARIABLES.ambientTemp?.color || '', measurements: weatherDataByVariable.value['ambientTemp'] || [] }],
      forecast: { name: 'variableForecast', color: VARIABLES.ambientTemp?.color || '', measurements: forecastDataByVariable.value['ambientTemp'] || [] },
    }, {
      key: 'groundTemp',
      icon: VARIABLES.groundTemp?.icon || '',
      title: t(VARIABLES.groundTemp?.title || ''),
      yTitle: t(VARIABLES.groundTemp?.unit || ''),
      traces: [{ name: 'variableGroundTemp', color: VARIABLES.groundTemp?.color || '', measurements: weatherDataByVariable.value['groundTemp'] || [] }],
    }, rainfall, {
      key: 'humidity',
      icon: VARIABLES.humidity?.icon || '',
      title: t(VARIABLES.humidity?.title || ''),
      yTitle: t(VARIABLES.humidity?.unit || ''),
      traces: [{ name: 'variableHumidity', color: VARIABLES.humidity?.color || '', measurements: weatherDataByVariable.value['humidity'] || [] }],
      forecast: { name: 'variableForecast', color: VARIABLES.humidity?.color || '', measurements: forecastDataByVariable.value['humidity'] || [] },
    }, {
      key: 'pressure',
      icon: VARIABLES.pressure?.icon || '',
      title: t(VARIABLES.pressure?.title || ''),
      yTitle: t(VARIABLES.pressure?.unit || ''),
      traces: [{ name: 'variablePressure', color: VARIABLES.pressure?.color || '', measurements: weatherDataByVariable.value['pressure'] || [] }],
      forecast: { name: 'variableForecast', color: VARIABLES.pressure?.color || '', measurements: forecastDataByVariable.value['pressure'] || [] },
    }, {
      key: 'lux',
      icon: VARIABLES.lux?.icon || '',
      title: t(VARIABLES.lux?.title || ''),
      yTitle: t(VARIABLES.lux?.unit || ''),
      traces: [{ name: 'variableLux', color: VARIABLES.lux?.color || '', measurements: weatherDataByVariable.value['lux'] || [] }],
    }, {
      key: 'piTemp',
      icon: VARIABLES.piTemp?.icon || '',
      title: t(VARIABLES.piTemp?.title || ''),
      yTitle: t(VARIABLES.piTemp?.unit || ''),
      traces: [{ name: 'variablePiTemp', color: VARIABLES.piTemp?.color || '', measurements: weatherDataByVariable.value['piTemp'] || [] }],
    }, {
      key: 'windSpeed',
      icon: VARIABLES.windSpeed?.icon || '',
      title: t(VARIABLES.windSpeed?.title || ''),
      yTitle: t(VARIABLES.windSpeed?.unit || ''),
      traces: [{ name: 'variableWindSpeed', color: VARIABLES.windSpeed?.color || '', measurements: weatherDataByVariable.value['windSpeed'] || [] }],
      forecast: { name: 'variableForecast', color: VARIABLES.windSpeed?.color || '', measurements: forecastDataByVariable.value['windSpeed'] || [] },
    }, {
      key: 'windGust',
      icon: VARIABLES.windGust?.icon || '',
      title: t(VARIABLES.windGust?.title || ''),
      yTitle: t(VARIABLES.windGust?.unit || ''),
      traces: [{ name: 'variableGustSpeed', color: VARIABLES.windGust?.color || '', measurements: weatherDataByVariable.value['windGust'] || [] }],
    }, {
      key: 'loftTemp',
      icon: VARIABLES.loftTemp?.icon || '',
      title: t(VARIABLES.loftTemp?.title || ''),
      yTitle: t(VARIABLES.loftTemp?.unit || ''),
      traces: [{ name: 'variableLoftTemp', color: VARIABLES.loftTemp?.color || '', measurements: weatherDataByVariable.value['loftTemp'] || [] }],
    }, {
      key: 'loftHumidity',
      icon: VARIABLES.loftHumidity?.icon || '',
      title: t(VARIABLES.loftHumidity?.title || ''),
      yTitle: t(VARIABLES.loftHumidity?.unit || ''),
      traces: [{ name: 'variableLoftHumidity', color: VARIABLES.loftHumidity?.color || '', measurements: weatherDataByVariable.value['loftHumidity'] || [] }],
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

          result[k].push({
            // @ts-ignore
            created: wv.created,
            // @ts-ignore
            value: wv[k],
          })
        })
      })
    }

    return result
  })

  const lastUpdatedMoreThanTenMins = computed(() => {
    if (latestMeasurement.value && now.value) {
      const duration = Math.abs((now.value.getTime() - latestMeasurement.value.getTime()) / 1000)

      return duration > 600
    } else {
      return false
    }
  })

  const lastUpdatedMoreThanFiveMins = computed(() => {
    if (latestMeasurement.value && now.value) {
      const duration = Math.abs((now.value.getTime() - latestMeasurement.value.getTime()) / 1000)

      return duration > 300
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

  function getTimestamp (date: Date) {
    return date.toISOString().split('T')[0]
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
    const [from, to] = [dates[0], dates[dates.length - 1]]

    if (from && to) {
      apiGetData(from, to)
        .then(data => {
          if (data) {
            data.forEach(d => {
              d.created = d.created.slice(0, 19)
            })
          }

          loading.value = false
          weatherData.value = data || []

          getLatest()
        })
        .catch(() => {
          loading.value = false
        })
      apiGetForecast(from, to)
        .then(fc => {
          if (fc) {
            fc.forEach(d => {
              d.created = d.created.slice(0, 19)
            })
          }

          forecast.value = fc || []
        })
      apiGetTidal()
        .then(tide => {
          const tl = tide?.levels

          if (tl) {
            tidalData.value = tl.filter((l, i) => {
              l.time = l.time.slice(0, 19)
              // @ts-ignore
              if (i > 0 && tl[i - 1] && new Date(l.time) < new Date(tl[i - 1].time)) {
                // Sometimes the tidal API will return values that shouldn't be there, just exclude them...
                return false
              } else {
                const str = l.time.split('T')[0] || ''
                return str >= from && str <= to
              }
            }).map(l => {
              return {
                created: new Date(l.time),
                value: l.sg,
              }
            })
          } else {
            return []
          }
        })
    }
  }

  function setNow () {
    now.value = new Date()
  }

  function visibilityListener () {
    if (document.visibilityState === 'visible' && lastUpdatedMoreThanFiveMins.value) {
      update()
    }
  }

  onBeforeUnmount(() => {
    if (interval) {
      clearInterval(interval)
    }

    document.removeEventListener('visibilitychange', visibilityListener)
  })

  onMounted(() => {
    interval = setInterval(setNow, 60_000)

    update()

    apiGetLocation()
      .then(l => {
        location.value = l
      })

    document.addEventListener('visibilitychange', visibilityListener)
  })

  watch(dateRange, async () => update())
</script>
