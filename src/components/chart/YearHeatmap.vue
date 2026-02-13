<template>
  <v-card :title="year">
    <v-card-text ref="wrapper">
      <div ref="chart" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { VARIABLES } from '@/plugins/constants'
  import { type DailyStats, ValueAggregation, type Variables } from '@/plugins/types/rpi-weather'
  import { coreStore } from '@/stores/app'
  import { useResizeObserver } from '@vueuse/core'
  import Plotly, { type ColorScale } from 'plotly.js/lib/core'
  import heatmap from 'plotly.js/lib/heatmap'
  import { useI18n } from 'vue-i18n'

  // Only register the chart types we're actually using to reduce the final bundle size
  Plotly.register([
    heatmap,
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
  const monthNames = computed(() => dateFormat.value ? [...new Array(12).keys()].map(m => dateFormat.value.format(new Date(Date.UTC(2000, m, 1, 0, 0, 0)))).reverse() : [])
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

    let z = [
      new Array(31).fill(NaN),
      new Array(30).fill(NaN),
      new Array(31).fill(NaN),
      new Array(30).fill(NaN),
      new Array(31).fill(NaN),
      new Array(31).fill(NaN),
      new Array(30).fill(NaN),
      new Array(31).fill(NaN),
      new Array(30).fill(NaN),
      new Array(31).fill(NaN),
      new Array(29).fill(NaN),
      new Array(31).fill(NaN),
    ]

    let minZ = Number.MAX_SAFE_INTEGER
    let maxZ = -Number.MAX_SAFE_INTEGER

    const aggs = [ValueAggregation.min, ValueAggregation.avg, ValueAggregation.max]

    compProps.data.forEach(dp => {
      const date = new Date(dp.date)
      const value = dp[compProps.aggregation][compProps.variable]

      if (date.getFullYear() === compProps.year) {
        const month = monthNames.value.length - date.getMonth() - 1
        const day = date.getDate() - 1

        // @ts-ignore
        z[month][day] = value
      }

      aggs.forEach(a => {
        const v = dp[a][compProps.variable]
        if (v !== undefined && v !== null && !isNaN(v)) {
          minZ = Math.min(minZ, v)
          maxZ = Math.max(maxZ, v)
        }
      })
    })

    if (isVertical.value) {
      const copy = z.concat().reverse()
      // @ts-ignore
      z = z[0].map((col, i) => copy.map(row => row[i]))
    }

    const x = Array.from(new Array(31).keys()).map(i => i + 1)
    const y = monthNames.value.concat()

    const traces = [{
      z,
      x: isVertical.value ? y.concat().reverse() : x,
      y: isVertical.value ? x : y,
      name: '',
      type: 'heatmap' as const,
      zauto: false,
      zmin: minZ,
      zmax: maxZ,
      hoverongaps: false,
      colorscale: VARIABLES[compProps.variable]?.heatmapGradient as ColorScale,
      colorbar: {
        title: {
          side: 'right' as const,
          font: { color: store.storeIsDarkMode ? 'white' : 'black' },
        },
        tickfont: { color: store.storeIsDarkMode ? 'white' : 'black' },
        orientation: (isVertical.value ? 'h' : 'v') as 'h' | 'v',
      },
      hovertemplate: '%{x}. %{y}: %{z}',
    }]

    let xAxis = {
      showgrid: false,
      tickmode: 'array' as const,
      tickvals: Array.from(new Array(31).keys()).map(i => i + 1),
      title: { text: t('widgetChartHeatmapAxisTitleDay'), font: { color: store.storeIsDarkMode ? 'white' : 'black' } },
      tickfont: { color: store.storeIsDarkMode ? 'white' : 'black' },
    }
    let yAxis = {
      showgrid: false,
      title: { text: t('widgetChartHeatmapAxisTitleMonth'), font: { color: store.storeIsDarkMode ? 'white' : 'black' } },
      tickfont: { color: store.storeIsDarkMode ? 'white' : 'black' },
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
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: store.storeIsDarkMode ? 'rgba(255, 255, 255, .1)' : 'rgba(0, 0, 0, .1)',
      xaxis: xAxis,
      yaxis: yAxis,
    }

    if (isVertical.value) {
      // @ts-ignore
      layout.margin.r = 0
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
