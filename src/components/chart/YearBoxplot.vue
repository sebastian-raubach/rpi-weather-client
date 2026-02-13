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
  import box from 'plotly.js/lib/box'
  import { useI18n } from 'vue-i18n'

  // Only register the chart types we're actually using to reduce the final bundle size
  Plotly.register([
    box,
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

  const dateFormat = computed(() => new Intl.DateTimeFormat(store.storeLocale || 'en', { month: 'short' }))
  const monthNames = computed(() => dateFormat.value ? [...new Array(12).keys()].map(m => dateFormat.value.format(new Date(Date.UTC(2000, m, 1, 0, 0, 0)))) : [])
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

    compProps.data.forEach(dp => {
      const value = dp[compProps.aggregation][compProps.variable]

      minY = Math.min(minY, value)
      maxY = Math.max(maxY, value)
    })

    const traces = monthNames.value.map((m, i) => {
      let index = i
      if (isVertical.value) {
        index = 11 - index
      }

      const y = compProps.data.filter(dp => {
        const date = new Date(dp.date)
        return date.getFullYear() === compProps.year && date.getMonth() === index
      }).map(dp => dp[compProps.aggregation][compProps.variable])

      let isEmpty = false
      if (y.length === 0) {
        y.push(0)
        isEmpty = true
      }

      const result = {
        opacity: isEmpty ? 0 : 1,
        hoverinfo: isEmpty ? 'none' : 'all',
        type: 'box' as const,
        name: monthNames.value[index],
        visible: true,
        boxpoints: 'all',
        jitter: 0.3,
        pointpos: -1.8,
        marker: {
          color: CHART_COLORS[index],
        },
      }

      if (isVertical.value) {
        // @ts-ignore
        result.x = y
      } else {
        // @ts-ignore
        result.y = y
      }

      return result
    })

    let xAxis = {
      title: { text: t('widgetChartScatterAxisTitleMonth'), font: { color: store.storeIsDarkMode ? 'white' : 'black' } },
      gridcolor: store.storeIsDarkMode ? '#111111' : '#eeeeee',
      tickfont: { color: store.storeIsDarkMode ? 'white' : 'black' },
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
      legend: {
        orientation: 'h',
        font: {
          color: 'white',
        },
      },
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

    // @ts-ignore
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
