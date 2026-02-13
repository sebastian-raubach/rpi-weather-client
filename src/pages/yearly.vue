<template>
  <v-container fluid>
    <div class="d-flex flex-row flex-wrap ga-3">
      <div>
        <div class="text-subtitle-2 mt-3">{{ $t('formLabelYear') }}</div>
        <v-btn-toggle
          v-model="selectedYears"
          color="primary"
          variant="tonal"
          multiple
          mandatory
        >
          <v-btn
            v-for="year in years"
            :key="`year-${year}`"
            :value="year"
            :text="year"
          />
        </v-btn-toggle>
      </div>
      <div>
        <div class="text-subtitle-2 mt-3">{{ $t('formLabelVariable') }}</div>
        <v-select
          v-model="selectedVariable"
          :items="variableOptions"
          hide-details
          min-width="300"
          density="comfortable"
        />
      </div>
      <div>
        <div class="text-subtitle-2 mt-3">{{ $t('formLabelAggregation') }}</div>
        <v-btn-toggle
          v-model="aggregation"
          color="primary"
          variant="tonal"
          mandatory
          :direction="smAndUp ? 'horizontal' : 'vertical'"
        >
          <v-btn :value="ValueAggregation.min" :text="$t('aggregationMin')" :prepend-icon="mdiFormatVerticalAlignBottom" />
          <v-btn :value="ValueAggregation.avg" :text="$t('aggregationAvg')" :prepend-icon="mdiFormatVerticalAlignCenter" />
          <v-btn :value="ValueAggregation.max" :text="$t('aggregationMax')" :prepend-icon="mdiFormatVerticalAlignTop" />
          <v-btn :value="ValueAggregation.stdv" :text="$t('aggregationStd')" :prepend-icon="mdiChartBellCurve" />
        </v-btn-toggle>
      </div>
    </div>

    <v-row v-if="selectedVariable && sortedYears.length > 0">
      <v-col
        v-for="year in sortedYears"
        :key="`heatmap-${year}`"
        cols="12"
        :md="Math.max(1, Math.ceil(12 / sortedYears.length))"
      >
        <YearHeatmap
          class="mt-5"
          :year="year"
          :data="dailyData"
          :aggregation="aggregation"
          :variable="selectedVariable"
        />
      </v-col>

      <v-col
        v-for="year in sortedYears"
        :key="`scatter-${year}`"
        cols="12"
        :md="Math.max(1, Math.ceil(12 / sortedYears.length))"
      >
        <YearScatter
          class="mt-5"
          :year="year"
          :data="dailyData"
          :aggregation="aggregation"
          :variable="selectedVariable"
        />
      </v-col>

      <v-col
        v-for="year in sortedYears"
        :key="`boxplot-${year}`"
        cols="12"
        :md="Math.max(1, Math.ceil(12 / sortedYears.length))"
      >
        <YearBoxplot
          class="mt-5"
          :year="year"
          :data="dailyData"
          :aggregation="aggregation"
          :variable="selectedVariable"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import YearHeatmap from '@/components/chart/YearHeatmap.vue'
  import YearScatter from '@/components/chart/YearScatter.vue'
  import YearBoxplot from '@/components/chart/YearBoxplot.vue'
  import { apiGetVariables, apiGetYearly, apiGetYears } from '@/plugins/api'
  import { VARIABLES } from '@/plugins/constants'
  import { ValueAggregation, type DailyStats, Variables } from '@/plugins/types/rpi-weather'
  import { mdiChartBellCurve, mdiFormatVerticalAlignBottom, mdiFormatVerticalAlignCenter, mdiFormatVerticalAlignTop } from '@mdi/js'
  import { useI18n } from 'vue-i18n'
  import { useDisplay } from 'vuetify'

  const { t } = useI18n()
  const { smAndUp } = useDisplay()

  const variables = ref<string[]>([])
  const years = ref<number[]>([])
  const aggregation = ref<ValueAggregation>(ValueAggregation.max)

  const selectedYears = ref<number[]>([])
  const selectedVariable = ref<Variables>(Variables.ambientTemp)

  const dailyData = ref<DailyStats[]>([])

  const sortedYears = computed(() => selectedYears.value.sort((a, b) => a - b))

  const variableOptions = computed(() => {
    if (variables.value) {
      return variables.value.filter(v => VARIABLES[v]).map(v => {
        return {
          title: t(VARIABLES[v]?.title || ''),
          props: { subtitle: t(VARIABLES[v]?.unit || '') },
          value: v,
        }
      })
    } else {
      return []
    }
  })

  function getData () {
    const start = sortedYears.value[0] ? new Date(sortedYears.value[0], 0, 1) : new Date()
    const end = sortedYears.value[sortedYears.value.length - 1] ? new Date(sortedYears.value[sortedYears.value.length - 1] || 2025, 11, 31) : new Date()
    apiGetYearly(start, end)
      .then(result => {
        dailyData.value = result || []
      })
  }

  watch(sortedYears, async () => getData())

  onMounted(() => {
    apiGetVariables()
      .then(result => {
        variables.value = (result || []).map(v => v.replace(/_([a-z])/g, (g: string) => g && g.length > 1 && g[1] ? g[1].toUpperCase() : ''))
      })
    apiGetYears()
      .then(result => {
        years.value = result || []

        if (years.value.length > 0) {
          // @ts-ignore
          selectedYears.value = [years.value[years.value.length - 1]]
        }
      })
  })
</script>
