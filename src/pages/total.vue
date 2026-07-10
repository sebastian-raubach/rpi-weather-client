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
          :additional-info="[`${new Date(totalStats.mostRain.date).toLocaleDateString('en-GB', { weekday: 'long' })} ${new Date(totalStats.mostRain.date).toLocaleDateString()}`]"
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
          :additional-info="[`${new Date(totalStats.mostWind.date).toLocaleDateString('en-GB', { weekday: 'long' })} ${new Date(totalStats.mostWind.date).toLocaleDateString()}`]"
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
          :additional-info="[`${new Date(totalStats.lowestTemp.date).toLocaleDateString('en-GB', { weekday: 'long' })} ${new Date(totalStats.lowestTemp.date).toLocaleDateString()}`]"
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
          :additional-info="[`${new Date(totalStats.highestTemp.date).toLocaleDateString('en-GB', { weekday: 'long' })} ${new Date(totalStats.highestTemp.date).toLocaleDateString()}`]"
          :measurements="[{ value: totalStats.highestTemp.value, created: totalStats.highestTemp.date }]"
        />
      </v-col>
    </v-row>

    <template v-if="rankedStats">
      <v-row>
        <v-col cols="12" sm="6" class="d-flex" v-if="rankedStats.longestDryPeriod">
          <VariableCard
            class="flex-grow-1"
            color="#1289A7"
            :icon="mdiWaterOff"
            :title="$t('totalStatsLongestDryPeriod')"
            :subtitle="$t('variableDays')"
            :to-fixed="0"
            :additional-info="[new Date(rankedStats.longestDryPeriod.startDate).toLocaleDateString(), new Date(rankedStats.longestDryPeriod.endDate).toLocaleDateString()]"
            :measurements="[{ value: rankedStats.longestDryPeriod.consecutiveDays, created: new Date() }]"
          />
        </v-col>
        <v-col cols="12" sm="6" class="d-flex" v-if="rankedStats.longestWetPeriod">
          <VariableCard
            class="flex-grow-1"
            color="#0652DD"
            :icon="mdiWeatherPouring"
            :title="$t('totalStatsLongestWetPeriod')"
            :subtitle="$t('variableDays')"
            :to-fixed="0"
            :additional-info="[new Date(rankedStats.longestWetPeriod.startDate).toLocaleDateString(), new Date(rankedStats.longestWetPeriod.endDate).toLocaleDateString()]"
            :measurements="[{ value: rankedStats.longestWetPeriod.consecutiveDays, created: new Date() }]"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-card
            :title="$t('monthlyStatsLowestTemperature')"
            :subtitle="$t(VARIABLES[Variables.ambientTemp]?.unit || '')"
            :prepend-icon="VARIABLES[Variables.ambientTemp]?.icon || ''"
          >
            <TotalRankingTable :data="rankedStats.lowestTemp || []" sort="asc" />
          </v-card>
        </v-col>
        <v-col>
          <v-card
            :title="$t('monthlyStatsHighestTemperature')"
            :subtitle="$t(VARIABLES[Variables.ambientTemp]?.unit || '')"
            :prepend-icon="VARIABLES[Variables.ambientTemp]?.icon || ''"
          >
            <TotalRankingTable :data="rankedStats.highestTemp || []" sort="desc" />
          </v-card>
        </v-col>
        <v-col>
          <v-card
            :title="$t('monthlyStatsTotalRainfall')"
            :subtitle="$t(VARIABLES[Variables.rainfall]?.unit || '')"
            :prepend-icon="VARIABLES[Variables.rainfall]?.icon || ''"
          >
            <TotalRankingTable :data="rankedStats.highestRain || []" sort="desc" />
          </v-card>
        </v-col>
        <v-col>
          <v-card
            :title="$t('monthlyStatsHighestWind')"
            :subtitle="$t(VARIABLES[Variables.windGust]?.unit || '')"
            :prepend-icon="VARIABLES[Variables.windGust]?.icon || ''"
          >
            <TotalRankingTable :data="rankedStats.highestWind || []" sort="desc" />
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
  import { apiGetTotal, apiGetTotalRanked } from '@/plugins/api'
  import { VARIABLES } from '@/plugins/constants'
  import { type RankedStats, Variables, type AggregatedStats } from '@/plugins/types/rpi-weather'
  import { mdiCupWater, mdiThermometer, mdiThermometerHigh, mdiThermometerLow, mdiWaterOff, mdiWeatherPouring, mdiWeatherWindy } from '@mdi/js'

  const totalStats = ref<AggregatedStats>()
  const rankedStats = ref<RankedStats>()

  onMounted(() => {
    apiGetTotal()
      .then(result => {
        totalStats.value = result
      })
    apiGetTotalRanked()
      .then(result => {
        rankedStats.value = result
      })
  })
</script>
