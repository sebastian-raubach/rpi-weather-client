<template>
  <v-data-table
    :items="compProps.data"
    :headers="headers"
    :items-per-page="compProps.data.length"
    hide-default-footer
    :sort-by="[{ key: 'value', order: compProps.sort }]"
    :row-props="getRowProps"
  >
    <template #item.position="{ index }">{{ index + 1 }}</template>
  </v-data-table>
</template>

<script setup lang="ts">
  import type { AggregatedYearMonth } from '@/plugins/types/rpi-weather'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const compProps = defineProps<{
    data: AggregatedYearMonth[]
    variable: 'avgAmbientTemp' | 'avgGroundTemp' | 'avgLux' | 'avgPressure' | 'avgHumidity' | 'avgWindSpeed' | 'avgWindGust' | 'sumRainfall' | 'year' | 'month'
    sort: 'asc' | 'desc'
    highlight: number
  }>()

  const headers = computed(() => {
    return [{
      key: 'position',
      title: '',
    }, {
      key: 'year',
      title: t('tableColumnYear'),
    }, {
      key: 'value',
      title: t('tableColumnValue'),
      value: (item: AggregatedYearMonth) => item[compProps.variable],
    }]
  })

  function getRowProps (item: any) {
    if (item.item.year === compProps.highlight) {
      return {
        class: 'bg-primary',
      }
    }
    return null
  }
</script>
