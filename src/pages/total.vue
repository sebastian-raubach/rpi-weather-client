<template>
  <v-container fluid>
    <v-row v-if="totalStats">
      <v-col cols="12" sm="6" md="4" class="d-flex" v-if="totalStats.mostRain">
        <VariableCard
          class="flex-grow-1"
          color="#0652DD"
          :icon="mdiWeatherPouring"
          :title="$t('monthlyStatsMostRainfall')"
          :subtitle="$t(VARIABLES[Variables.rainfall]?.unit || '')"
          :additional-info="`${new Date(totalStats.mostRain.date).toLocaleDateString('en-GB', { weekday: 'long' })} ${new Date(totalStats.mostRain.date).toLocaleDateString()}`"
          :measurements="[{ value: totalStats.mostRain.value, created: totalStats.mostRain.date }]"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4" class="d-flex" v-if="totalStats.totalRain !== undefined">
        <VariableCard
          class="flex-grow-1"
          color="#1289A7"
          :icon="mdiCupWater"
          :title="$t('monthlyStatsTotalRainfall')"
          :subtitle="$t(VARIABLES[Variables.rainfall]?.unit || '')"
          :measurements="[{ value: totalStats.totalRain, created: new Date }]"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4" class="d-flex" v-if="totalStats.mostWind">
        <VariableCard
          class="flex-grow-1"
          color="#833471"
          :icon="mdiWeatherWindy"
          :title="$t('monthlyStatsHighestWind')"
          :subtitle="$t(VARIABLES[Variables.windSpeed]?.unit || '')"
          :additional-info="`${new Date(totalStats.mostWind.date).toLocaleDateString('en-GB', { weekday: 'long' })} ${new Date(totalStats.mostWind.date).toLocaleDateString()}`"
          :measurements="[{ value: totalStats.mostWind.value, created: totalStats.mostWind.date }]"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4" class="d-flex" v-if="totalStats.lowestTemp">
        <VariableCard
          class="flex-grow-1"
          color="#F79F1F"
          :icon="mdiThermometerLow"
          :title="$t('monthlyStatsLowestTemperature')"
          :subtitle="$t(VARIABLES[Variables.ambientTemp]?.unit || '')"
          :additional-info="`${new Date(totalStats.lowestTemp.date).toLocaleDateString('en-GB', { weekday: 'long' })} ${new Date(totalStats.lowestTemp.date).toLocaleDateString()}`"
          :measurements="[{ value: totalStats.lowestTemp.value, created: totalStats.lowestTemp.date }]"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4" class="d-flex" v-if="totalStats.avgTemp !== undefined">
        <VariableCard
          class="flex-grow-1"
          color="#EE5A24"
          :icon="mdiThermometer"
          :title="$t('monthlyStatsAverageTemperature')"
          :subtitle="$t(VARIABLES[Variables.ambientTemp]?.unit || '')"
          :measurements="[{ value: totalStats.avgTemp, created: new Date() }]"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4" class="d-flex" v-if="totalStats.highestTemp">
        <VariableCard
          class="flex-grow-1"
          color="#EA2027"
          :icon="mdiThermometerHigh"
          :title="$t('monthlyStatsHighestTemperature')"
          :subtitle="$t(VARIABLES[Variables.ambientTemp]?.unit || '')"
          :additional-info="`${new Date(totalStats.highestTemp.date).toLocaleDateString('en-GB', { weekday: 'long' })} ${new Date(totalStats.highestTemp.date).toLocaleDateString()}`"
          :measurements="[{ value: totalStats.highestTemp.value, created: totalStats.highestTemp.date }]"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import { apiGetTotal } from '@/plugins/api'
  import { VARIABLES } from '@/plugins/constants'
  import { Variables, type AggregatedStats } from '@/plugins/types/rpi-weather'
  import { mdiCupWater, mdiThermometer, mdiThermometerHigh, mdiThermometerLow, mdiWeatherPouring, mdiWeatherWindy } from '@mdi/js'

  const totalStats = ref<AggregatedStats>()

  onMounted(() => {
    apiGetTotal()
      .then(result => {
        totalStats.value = result
      })
  })
</script>
