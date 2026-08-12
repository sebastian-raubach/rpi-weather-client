<template>
  <v-card :title="year">
    <v-card-text ref="wrapper">
      <div ref="chart" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { CHART_COLORS } from '@/plugins/constants'
  import { ValueAggregation, type DailyStats, type Variables } from '@/plugins/types/rpi-weather'
  import { coreStore } from '@/stores/app'
  import { useResizeObserver } from '@vueuse/core'
  import Plotly from 'plotly.js/lib/core'
  import bar from 'plotly.js/lib/bar'
  import scatter from 'plotly.js/lib/scatter'
  import { useI18n } from 'vue-i18n'
import { darkenHex } from '@/plugins/color'

  // Only register the chart types we're actually using to reduce the final bundle size
  Plotly.register([
    bar,
    scatter,
  ])

  const compProps = defineProps<{
    data: DailyStats[]
    year: number
    aggregation: ValueAggregation
    variable: Variables
  }>()

  const router = useRouter()

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
    const minYData: any[] = []
    const avgYData: any[] = []
    const maxYData: any[] = []
    const xData: any[] = []
    const color: number[] = []

    compProps.data.forEach(dp => {
      const date = new Date(dp.date)

      const min = dp[ValueAggregation.min][compProps.variable]
      const avg = dp[ValueAggregation.avg][compProps.variable]
      const max = dp[ValueAggregation.max][compProps.variable]

      if (date.getFullYear() === compProps.year) {
        xData.push(date)
        minYData.push(min)
        avgYData.push(avg)
        maxYData.push(max)
        color.push(date.getMonth())
      }

      minY = Math.min(minY, min)
      maxY = Math.max(maxY, max)
    })

    const minYTraceData = maxYData.map((v, i) => v - minYData[i])

    const traces = [{
      x: isVertical.value ? minYTraceData : xData,
      y: isVertical.value ? xData : minYTraceData,
      base: minYData,
      name: '',
      orientation: isVertical.value ? 'h' as const : 'v' as const,
      type: 'bar' as const,
      mode: 'lines' as const,
      marker: {
        cmin: 0,
        cmax: 11,
        color: color,
        colorscale: CHART_COLORS.map((c, i) => [i / (CHART_COLORS.length - 1), c]),
      },
      hovertemplate: 'Min: %{base:.1f}<br>Max: %{customdata:.1f}<extra></extra>',
      customdata: maxYData,
    }, {
      x: isVertical.value ? avgYData : xData,
      y: isVertical.value ? xData : avgYData,
      type: 'scatter' as const,
      mode: 'markers' as const,
      name: '',
      marker: {
        cmin: 0,
        cmax: 11,
        size: 4,
        symbol: isVertical.value ? 'line-ns' : 'line-ew',
        line: {
          cmin: 0,
          cmax: 11,
          width: 2,
          color: color,
          colorscale: CHART_COLORS.map((c, i) => [i / (CHART_COLORS.length - 1), darkenHex(c, 20)]),
        },
        color: color,
        colorscale: CHART_COLORS.map((c, i) => [i / (CHART_COLORS.length - 1), c]),
      },
      hovertemplate: 'Avg: %{y:.1f}<extra></extra>',
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
      hovermode: isVertical.value ? 'y' as const : 'x' as const,
      showlegend: false,
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
      .then(element => {
        isRedrawing.value = false

        element.on('plotly_click', data => {
          if (data.points.length > 0) {
            const date = data.points[0]?.x as string

            if (date) {
              router.push({ path: '/', query: { date } })
            }
          }
        })
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
