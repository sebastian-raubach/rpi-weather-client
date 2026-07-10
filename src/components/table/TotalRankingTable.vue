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
  import type { Day } from '@/plugins/types/rpi-weather'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const compProps = defineProps<{
    data: Day[]
    sort: 'asc' | 'desc'
  }>()

  const headers = computed(() => {
    return [{
      key: 'position',
      title: '',
    }, {
      key: 'date',
      title: t('tableColumnDate'),
      value: (value: Day) => value.date ? new Date(value.date).toLocaleDateString() : undefined,
    }, {
      key: 'value',
      title: t('tableColumnValue'),
      value: (item: Day) => item.value,
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
