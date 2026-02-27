<template>
  <v-card :title="$t(title)">
    <template #append>
      <v-switch color="primary" hide-details v-model="isInteractive" />
    </template>
    <template #prepend><v-icon :icon="icon" :color="color" /></template>
    <template #text>
      <div ref="chart" />
    </template>

    <slot name="append" />
  </v-card>
</template>

<script setup lang="ts">
  import type { MinimalMeasurement } from '@/plugins/types/rpi-weather'
  import { coreStore } from '@/stores/app'
  import Plotly from 'plotly.js/lib/core'
  import scatter from 'plotly.js/lib/scatter'
  import { useI18n } from 'vue-i18n'

  // Only register the chart types we're actually using to reduce the final bundle size
  Plotly.register([
    scatter,
  ])

  export interface Trace {
    measurements: MinimalMeasurement[]
    fill?: 'tozeroy' | undefined
    name: string
    color: string
  }

  const compProps = defineProps<{
    title: string
    xTitle: string
    yTitle: string
    traces: Trace[]
    forecast?: Trace
    icon: string
    smooth?: boolean
  }>()

  const store = coreStore()
  const { t } = useI18n()

  const isInteractive = ref(false)
  const chart = useTemplateRef('chart')

  const color = computed(() => (compProps.traces && compProps.traces.length > 0) ? compProps.traces[0]?.color : undefined)

  function draw () {
    if (!chart.value) {
      return
    }

    try {
      Plotly.purge(chart.value)
    } catch {
      // Do nothing here
    }

    let minDateTime: number | undefined
    let maxDateTime: number | undefined

    compProps.traces.forEach(tr => {
      tr.measurements.forEach(v => {
        minDateTime = minDateTime === undefined ? new Date(v.created).getTime() : Math.min(minDateTime, new Date(v.created).getTime())
        maxDateTime = maxDateTime === undefined ? new Date(v.created).getTime() : Math.max(maxDateTime, new Date(v.created).getTime())
      })
    })
    compProps.forecast?.measurements.forEach(v => {
      minDateTime = minDateTime === undefined ? new Date(v.created).getTime() : Math.min(minDateTime, new Date(v.created).getTime())
      maxDateTime = maxDateTime === undefined ? new Date(v.created).getTime() : Math.max(maxDateTime, new Date(v.created).getTime())
    })

    const traces: any = compProps.traces.map(tr => {
      return {
        x: tr.measurements.map(v => v.created),
        y: tr.measurements.map(v => v.value),
        type: 'scatter' as const,
        name: t(tr.name),
        mode: 'lines' as const,
        fill: tr.fill,
        marker: {
          color: tr.color,
        },
        line: {
          dash: 'solid' as const,
          shape: compProps.smooth ? 'spline' : undefined,
        },
        legenditem: {
          textfont: {
            color: store.storeIsDarkMode ? 'white' : 'black',
          },
        },
      }
    })

    if (compProps.forecast) {
      traces.push({
        x: compProps.forecast.measurements.map(v => v.created),
        y: compProps.forecast.measurements.map(v => v.value),
        type: 'scatter' as const,
        name: t(compProps.forecast.name),
        mode: 'lines' as const,
        marker: {
          color: compProps.forecast.color,
        },
        line: {
          dash: 'dashdot' as const,
        },
        legenditem: {
          textfont: {
            color: store.storeIsDarkMode ? 'white' : 'black',
          },
        },
      })
    }

    const minDate = new Date(minDateTime || Date.now())
    const maxDate = new Date(maxDateTime || Date.now())
    minDate.setUTCHours(0, 0, 0, 0)
    maxDate.setUTCHours(23, 59, 59, 999)

    const layout: any = {
      height: 400,
      margin: {
        t: 0,
        r: 10,
        l: 50,
        b: 40,
      },
      hovermode: 'x' as const,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      dragmode: compProps.traces[0]?.name === 'variableRainfall' ? 'select' : null,
      xaxis: {
        gridcolor: store.storeIsDarkMode ? 'rgba(1.0, 1.0, 1.0, 0.1)' : 'rgba(0.0, 0.0, 0.0, 0.1)',
        title: { text: t(compProps.xTitle), font: { color: store.storeIsDarkMode ? 'white' : 'black' } },
        tickfont: { color: store.storeIsDarkMode ? 'white' : 'black' },
        range: [minDate, maxDate],
      },
      yaxis: {
        gridcolor: store.storeIsDarkMode ? 'rgba(1.0, 1.0, 1.0, 0.1)' : 'rgba(0.0, 0.0, 0.0, 0.1)',
        title: { text: t(compProps.yTitle), font: { color: store.storeIsDarkMode ? 'white' : 'black' } },
        tickfont: { color: store.storeIsDarkMode ? 'white' : 'black' },
      },
      legend: {
        bgcolor: 'rgba(0,0,0,0)',
        orientation: 'h' as const,
        font: { color: store.storeIsDarkMode ? 'white' : 'black' },
      },
    }

    const config = {
      responsive: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['toImage' as const, 'lasso2d' as const, 'select2d' as const],
    }

    Plotly.newPlot(chart.value, traces, layout, config)
      .then(element => {
        // @ts-ignore
        Plotly.Fx.hover(chart.value, compProps.traces.map((tr, tri) => {
          return {
            curveNumber: tri,
            pointNumber: tr.measurements.length - 1,
          }
        }))

        element.on('plotly_selected', eventData => emit('rainfall-range-selected', eventData ? eventData.range?.x : undefined))
      })
  }

  watch(() => store.storeIsDarkMode, async () => draw())
  watch(() => compProps.traces, async () => draw(), { deep: true })

  watch(isInteractive, async newValue => {
    if (chart.value) {
      const layoutDelta = {
        'xaxis.fixedrange': !newValue,
        'yaxis.fixedrange': !newValue,
      }

      // @ts-ignore
      Plotly.relayout(chart.value, layoutDelta)
    }
  })

  onMounted(() => draw())

  const emit = defineEmits(['rainfall-range-selected'])
</script>
