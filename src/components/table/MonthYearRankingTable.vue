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
    variable: string
    sort: 'asc' | 'desc'
  }>()

  const headers = computed(() => {
    return [{
      key: 'position',
      title: '',
    }, {
      key: 'month',
      title: t('tableColumnMonth'),
      value: (value: AggregatedYearMonth) => value ? new Date(value.year, value.month - 1).toLocaleDateString(undefined, { month: '2-digit', year: 'numeric' }) : undefined,
    }, {
      key: compProps.variable,
      title: t('tableColumnValue'),
      // @ts-expect-error
      value: (value: AggregatedYearMonth) => value[compProps.variable].toFixed(2),
    }]
  })

  function getRowProps (item: any) {
    if (item.index === 0) {
      return {
        class: 'bg-primary',
      }
    }
    return null
  }
</script>
