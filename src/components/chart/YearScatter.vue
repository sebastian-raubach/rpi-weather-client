<template>
  <v-card :title="year">
    <v-card-text ref="wrapper">
      <div ref="chart" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { CHART_COLORS } from '@/plugins/constants'
  import type { DailyStats, ValueAggregation, Variables } from '@/plugins/types/rpi-weather'
  import { coreStore } from '@/stores/app'
  import { useResizeObserver } from '@vueuse/core'
  import Plotly from 'plotly.js/lib/core'
  import scatter from 'plotly.js/lib/scatter'
  import { useI18n } from 'vue-i18n'

  // Only register the chart types we're actually using to reduce the final bundle size
  Plotly.register([
    scatter,
  ])

  const compProps = defineProps<{
    data: DailyStats[]
    year: number
    aggregation: ValueAggregation
    variable: Variables
  }>()

  const wrapper = useTemplateRef('wrapper')
  const chart = useTemplateRef('chart')

  useResizeObserver(wrapper, entries => {
    const entry = entries[0]
    if (entry) {
      const { width } = entry.contentRect
      chartWidth.value = width

      nextTick(() => redraw())
    }
  })

  const { t, locale } = useI18n()
  const store = coreStore()

  const chartWidth = ref(1000)
  const isRedrawing = ref(false)

  const isVertical = computed(() => chartWidth.value < 720)

  function redraw () {
    if (!chart.value || !compProps.data || isRedrawing.value) {
      return
    }

    isRedrawing.value = true

    try {
      Plotly.purge(chart.value)
    } catch {
      // Ignore
    }

    let minY = Number.MAX_SAFE_INTEGER
    let maxY = -Number.MAX_SAFE_INTEGER
    let yData: any[] = []
    let xData: any[] = []
    const color: number[] = []

    compProps.data.forEach(dp => {
      const date = new Date(dp.date)
      const value = dp[compProps.aggregation][compProps.variable]

      if (date.getFullYear() === compProps.year) {
        xData.push(date)
        yData.push(value)
        color.push(date.getMonth())
      }

      minY = Math.min(minY, value)
      maxY = Math.max(maxY, value)
    })

    if (isVertical.value) {
      [xData, yData] = [yData, xData]
    }

    const traces = [{
      x: xData,
      y: yData,
      name: '',
      type: 'scatter' as const,
      mode: 'markers' as const,
      marker: {
        cmin: 0,
        cmax: 11,
        color: color,
        colorscale: CHART_COLORS.map((c, i) => [i / (CHART_COLORS.length - 1), c]),
      },
    }]

    const startOfYear = new Date(Date.UTC(compProps.year, 0, 1, 0, 0, 0))
    const endOfYear = new Date(Date.UTC(compProps.year, 11, 31, 23, 59, 59))

    let xAxis = {
      title: { text: t('widgetChartScatterAxisTitleDate'), font: { color: store.storeIsDarkMode ? 'white' : 'black' } },
      gridcolor: store.storeIsDarkMode ? '#111111' : '#eeeeee',
      tickfont: { color: store.storeIsDarkMode ? 'white' : 'black' },
      range: isVertical.value ? [endOfYear, startOfYear] : [startOfYear, endOfYear],
    }
    let yAxis = {
      title: { text: t('widgetChartScatterAxisTitleValue'), font: { color: store.storeIsDarkMode ? 'white' : 'black' } },
      gridcolor: store.storeIsDarkMode ? '#111111' : '#eeeeee',
      tickfont: { color: store.storeIsDarkMode ? 'white' : 'black' },
      range: [minY - 3, maxY + 3],
    }

    if (isVertical.value) {
      // @ts-ignore
      [xAxis, yAxis] = [yAxis, xAxis]
    }

    const layout = {
      height: isVertical.value ? 800 : 500,
      margin: {
        t: 0,
        b: 50,
        l: 50,
        r: 0,
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: store.storeIsDarkMode ? 'rgba(255, 255, 255, .1)' : 'rgba(0, 0, 0, .1)',
      xaxis: xAxis,
      yaxis: yAxis,
    }

    if (isVertical.value) {
      // @ts-ignore
      layout.margin.l = 75
    }

    const config = {
      responsive: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['toImage' as const],
    }

    Plotly.newPlot(chart.value, traces, layout, config)
      .then(() => {
        isRedrawing.value = false
      })
  }

  watch(() => compProps.data, async () => redraw())
  watch(() => compProps.aggregation, async () => redraw())
  watch(() => compProps.variable, async () => redraw())
  watch(() => compProps.year, async () => redraw())
  watch(() => store.storeIsDarkMode, async () => redraw())
  watch(locale, async () => nextTick(() => redraw()))

  onMounted(() => redraw())
</script>
