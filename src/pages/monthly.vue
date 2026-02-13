<template>
  <v-container fluid>
    <div class="d-flex flex-row flex-wrap ga-3">
      <div>
        <div class="text-subtitle-2 mt-3">{{ $t('formLabelYear') }}</div>
        <v-select
          v-model="selectedYear"
          :items="years"
          min-width="300"
          density="comfortable"
        />
      </div>
      <div>
        <div class="text-subtitle-2 mt-3">{{ $t('formLabelMonth') }}</div>
        <v-select
          v-model="selectedMonth"
          :items="months"
          min-width="300"
          density="comfortable"
        />
      </div>
    </div>

    <v-row v-if="yearMonthStats">
      <v-col cols="12" sm="6" md="4" class="d-flex" v-if="yearMonthStats.mostRain">
        <VariableCard
          class="flex-grow-1"
          color="#0652DD"
          :icon="mdiWeatherPouring"
          :title="$t('monthlyStatsMostRainfall')"
          :subtitle="$t(VARIABLES[Variables.rainfall]?.unit || '')"
          :additional-info="`${new Date(yearMonthStats.mostRain.date).toLocaleDateString('en-GB', { weekday: 'long' })} ${new Date(yearMonthStats.mostRain.date).toLocaleDateString()}`"
          :measurements="[{ value: yearMonthStats.mostRain.value, created: yearMonthStats.mostRain.date }]"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4" class="d-flex" v-if="yearMonthStats.totalRain !== undefined">
        <VariableCard
          class="flex-grow-1"
          color="#1289A7"
          :icon="mdiCupWater"
          :title="$t('monthlyStatsTotalRainfall')"
          :subtitle="$t(VARIABLES[Variables.rainfall]?.unit || '')"
          :measurements="[{ value: yearMonthStats.totalRain, created: new Date }]"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4" class="d-flex" v-if="yearMonthStats.mostWind">
        <VariableCard
          class="flex-grow-1"
          color="#833471"
          :icon="mdiWeatherWindy"
          :title="$t('monthlyStatsHighestWind')"
          :subtitle="$t(VARIABLES[Variables.windSpeed]?.unit || '')"
          :additional-info="`${new Date(yearMonthStats.mostWind.date).toLocaleDateString('en-GB', { weekday: 'long' })} ${new Date(yearMonthStats.mostWind.date).toLocaleDateString()}`"
          :measurements="[{ value: yearMonthStats.mostWind.value, created: yearMonthStats.mostWind.date }]"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4" class="d-flex" v-if="yearMonthStats.lowestTemp">
        <VariableCard
          class="flex-grow-1"
          color="#F79F1F"
          :icon="mdiThermometerLow"
          :title="$t('monthlyStatsLowestTemperature')"
          :subtitle="$t(VARIABLES[Variables.ambientTemp]?.unit || '')"
          :additional-info="`${new Date(yearMonthStats.lowestTemp.date).toLocaleDateString('en-GB', { weekday: 'long' })} ${new Date(yearMonthStats.lowestTemp.date).toLocaleDateString()}`"
          :measurements="[{ value: yearMonthStats.lowestTemp.value, created: yearMonthStats.lowestTemp.date }]"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4" class="d-flex" v-if="yearMonthStats.avgTemp !== undefined">
        <VariableCard
          class="flex-grow-1"
          color="#EE5A24"
          :icon="mdiThermometer"
          :title="$t('monthlyStatsAverageTemperature')"
          :subtitle="$t(VARIABLES[Variables.ambientTemp]?.unit || '')"
          :measurements="[{ value: yearMonthStats.avgTemp, created: new Date() }]"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4" class="d-flex" v-if="yearMonthStats.highestTemp">
        <VariableCard
          class="flex-grow-1"
          color="#EA2027"
          :icon="mdiThermometerHigh"
          :title="$t('monthlyStatsHighestTemperature')"
          :subtitle="$t(VARIABLES[Variables.ambientTemp]?.unit || '')"
          :additional-info="`${new Date(yearMonthStats.highestTemp.date).toLocaleDateString('en-GB', { weekday: 'long' })} ${new Date(yearMonthStats.highestTemp.date).toLocaleDateString()}`"
          :measurements="[{ value: yearMonthStats.highestTemp.value, created: yearMonthStats.highestTemp.date }]"
        />
      </v-col>
    </v-row>
    <v-row v-if="aggregatedYearMonths && aggregatedYearMonths.length > 0 && selectedYear">
      <v-col>
        <v-card
          :title="$t(VARIABLES[Variables.ambientTemp]?.title || '')"
          :subtitle="$t(VARIABLES[Variables.ambientTemp]?.unit || '')"
          :prepend-icon="VARIABLES[Variables.ambientTemp]?.icon || ''"
        >
          <YearlyMonthRankingTable variable="avgAmbientTemp" :data="aggregatedYearMonths" sort="desc" :highlight="selectedYear" />
        </v-card>
      </v-col>
      <v-col>
        <v-card
          :title="$t(VARIABLES[Variables.groundTemp]?.title || '')"
          :subtitle="$t(VARIABLES[Variables.groundTemp]?.unit || '')"
          :prepend-icon="VARIABLES[Variables.groundTemp]?.icon || ''"
        >
          <YearlyMonthRankingTable variable="avgGroundTemp" :data="aggregatedYearMonths" sort="desc" :highlight="selectedYear" />
        </v-card>
      </v-col>
      <v-col>
        <v-card
          :title="$t(VARIABLES[Variables.rainfall]?.title || '')"
          :subtitle="$t(VARIABLES[Variables.rainfall]?.unit || '')"
          :prepend-icon="VARIABLES[Variables.rainfall]?.icon || ''"
        >
          <YearlyMonthRankingTable variable="sumRainfall" :data="aggregatedYearMonths" sort="desc" :highlight="selectedYear" />
        </v-card>
      </v-col>
      <v-col>
        <v-card
          :title="$t(VARIABLES[Variables.humidity]?.title || '')"
          :subtitle="$t(VARIABLES[Variables.humidity]?.unit || '')"
          :prepend-icon="VARIABLES[Variables.humidity]?.icon || ''"
        >
          <YearlyMonthRankingTable variable="avgHumidity" :data="aggregatedYearMonths" sort="desc" :highlight="selectedYear" />
        </v-card>
      </v-col>
      <v-col>
        <v-card
          :title="$t(VARIABLES[Variables.windSpeed]?.title || '')"
          :subtitle="$t(VARIABLES[Variables.windSpeed]?.unit || '')"
          :prepend-icon="VARIABLES[Variables.windSpeed]?.icon || ''"
        >
          <YearlyMonthRankingTable variable="avgWindSpeed" :data="aggregatedYearMonths" sort="desc" :highlight="selectedYear" />
        </v-card>
      </v-col>
      <v-col>
        <v-card
          :title="$t(VARIABLES[Variables.windGust]?.title || '')"
          :subtitle="$t(VARIABLES[Variables.windGust]?.unit || '')"
          :prepend-icon="VARIABLES[Variables.windGust]?.icon || ''"
        >
          <YearlyMonthRankingTable variable="avgWindGust" :data="aggregatedYearMonths" sort="desc" :highlight="selectedYear" />
        </v-card>
      </v-col>
      <v-col>
        <v-card
          :title="$t(VARIABLES[Variables.pressure]?.title || '')"
          :subtitle="$t(VARIABLES[Variables.pressure]?.unit || '')"
          :prepend-icon="VARIABLES[Variables.pressure]?.icon || ''"
        >
          <YearlyMonthRankingTable variable="avgPressure" :data="aggregatedYearMonths" sort="desc" :highlight="selectedYear" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import { apiGetMonthly, apiGetMonthlyStats, apiGetYears } from '@/plugins/api'
  import { VARIABLES } from '@/plugins/constants'
  import { type AggregatedYearMonth, type AggregatedStats, Variables } from '@/plugins/types/rpi-weather'
  import { coreStore } from '@/stores/app'
  import { mdiCupWater, mdiThermometer, mdiThermometerHigh, mdiThermometerLow, mdiWeatherPouring, mdiWeatherWindy } from '@mdi/js'

  const store = coreStore()

  const years = ref<number[]>([])
  const yearMonthStats = ref<AggregatedStats>()
  const aggregatedYearMonths = ref<AggregatedYearMonth[] | undefined>([])

  const selectedMonth = ref<number>()
  const selectedYear = ref<number>()

  const months = computed(() => {
    const year = selectedYear.value
    if (year) {
      return [...new Array(12).keys()].map(m => {
        return {
          title: intl.value(new Date(Date.UTC(year, m % 12))),
          value: m + 1,
        }
      })
    } else {
      return []
    }
  })

  const intl = computed(() => {
    return new Intl.DateTimeFormat(store.storeLocale, { month: 'long' }).format
  })

  onMounted(() => {
    apiGetYears()
      .then(result => {
        years.value = result || []

        if (years.value.length > 0) {
          selectedYear.value = years.value[years.value.length - 1]
          selectedMonth.value = new Date().getMonth() + 1
        }
      })
  })

  watchEffect(() => {
    if (selectedMonth.value !== undefined && selectedYear.value !== undefined) {
      apiGetMonthly(selectedMonth.value, selectedYear.value)
        .then(result => {
          yearMonthStats.value = result
        })
      apiGetMonthlyStats(selectedMonth.value)
        .then(result => {
          aggregatedYearMonths.value = result
        })
    }
  })
</script>
