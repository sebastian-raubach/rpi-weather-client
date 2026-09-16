<template>
  <v-card :title="year">
    <v-card-text ref="wrapper">
      <div ref="chart" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { VARIABLES } from '@/plugins/constants'
  import { Variables, type DailyStats, type ValueAggregation } from '@/plugins/types/rpi-weather'
  import { coreStore } from '@/stores/app'
  import { useResizeObserver } from '@vueuse/core'
  import Plotly, { type ColorScale } from 'plotly.js/lib/core'
  import heatmap from 'plotly.js/lib/heatmap'
  import quiver from 'plotly.js/lib/quiver'
  import { useI18n } from 'vue-i18n'

  // Only register the chart types we're actually using to reduce the final bundle size
  Plotly.register([
    heatmap,
    quiver,
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

  const dateFormat = computed(() => new Intl.DateTimeFormat(store.storeLocale || 'en', { month: 'short' }))
  const monthNames = computed(() => dateFormat.value ? [...new Array(12).keys()].map(m => dateFormat.value.format(new Date(Date.UTC(2000, m, 1, 0, 0, 0)))).reverse() : [])
  const isVertical = computed(() => chartWidth.value < 720)

  function redraw () {
    if (compProps.variable === ('windAverage' as Variables)) {
      redrawQuiver()
    } else {
      redrawHeatmap()
    }
  }

  function redrawHeatmap () {
    if (!chart.value || !compProps.data || isRedrawing.value) {
      return
    }

    isRedrawing.value = true

    try {
      Plotly.purge(chart.value)
    } catch {
      // Ignore
    }

    let z: number[][] = [
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

    let customdata = JSON.parse(JSON.stringify(z)) as string[][]

    let minZ = Number.MAX_SAFE_INTEGER
    let maxZ = -Number.MAX_SAFE_INTEGER

    compProps.data.forEach(dp => {
      const date = new Date(dp.date)
      const value = dp[compProps.aggregation][compProps.variable]

      if (date.getFullYear() === compProps.year) {
        const month = monthNames.value.length - date.getMonth() - 1
        const day = date.getDate() - 1

        // @ts-expect-error
        z[month][day] = value
        // @ts-expect-error
        customdata[month][day] = formatDate(date)
      }

      const v = dp[compProps.aggregation][compProps.variable]
      if (v !== undefined && v !== null && !isNaN(v)) {
        minZ = Math.min(minZ, v)
        maxZ = Math.max(maxZ, v)
      }
    })

    if (isVertical.value) {
      const copy = z.concat().reverse()
      // @ts-expect-error
      z = z[0].map((col, i) => copy.map(row => row[i]))
      // @ts-expect-error
      customdata = customdata[0].map((col, i) => copy.map(row => row[i]))
    }

    const x = Array.from(new Array(31).keys()).map(i => i + 1)
    const y = monthNames.value.concat()

    const traces = [{
      z,
      x: isVertical.value ? y.concat().reverse() : x,
      y: isVertical.value ? x : y,
      customdata,
      name: '',
      type: 'heatmap' as const,
      zauto: false,
      zmin: minZ,
      zmax: maxZ,
      hoverongaps: false,
      colorscale: compProps.variable === Variables.windAverage ? 'Portland' : VARIABLES[compProps.variable]?.heatmapGradient as ColorScale,
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
      // @ts-expect-error
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
      // @ts-expect-error
      layout.margin.r = 0
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
            const date = data.points[0]?.customdata as string

            if (date) {
              router.push({ path: '/', query: { date } })
            }
          }
        })
      })
  }

  interface ArrowPoint {
    x: number
    y: number
    u: number
    v: number
    speed: number
    dateLabel: string
  }

  function redrawQuiver () {
    if (!chart.value || !compProps.data || isRedrawing.value) {
      return
    }

    isRedrawing.value = true

    try {
      Plotly.purge(chart.value)
    } catch {
      // Ignore
    }

    const points: ArrowPoint[] = []

    compProps.data.forEach(dp => {
      const date = new Date(dp.date)

      if (date.getFullYear() !== compProps.year) {
        return
      }

      const stats = dp[compProps.aggregation]
      const direction = stats.windAverage // degrees, 0-360
      const speed = stats.windGust

      if (direction === undefined || direction === null || isNaN(direction)) {
        return
      }

      const monthIndex = monthNames.value.length - date.getMonth() - 1 // 0 = Dec ... 11 = Jan, matches monthNames.value order

      // In vertical mode the month axis is reversed to read Jan -> Dec, same as the heatmap.
      const monthPos = isVertical.value
        ? monthNames.value.length - 1 - monthIndex
        : monthIndex

      const day = date.getDate()

      // Normalize into 0-359.
      const bearing = ((direction % 360) + 360) % 360
      // If windAverage reports the direction wind is blowing FROM (met. convention)
      // rather than the direction it's blowing TOWARD, flip it here:
      // const bearing = (((direction + 180) % 360) + 360) % 360

      // Convert compass bearing (0 = up, clockwise) to a standard math angle
      // (0 = +x axis, counter-clockwise), which is what u/v components expect.
      const angleRad = (90 - bearing) * (Math.PI / 180)

      const u = speed * Math.cos(angleRad)
      const v = speed * Math.sin(angleRad)

      // if (isVertical.value) {
      //   // Axes are transposed below, so rotate the vector components to match.
      //   [u, v] = [v, -u]
      // }

      points.push({
        x: isVertical.value ? monthPos : day,
        y: isVertical.value ? day : monthPos,
        u,
        v,
        speed,
        dateLabel: formatDate(date),
      })
    })

    const trace = {
      type: 'quiver' as const,
      x: points.map(p => p.x),
      y: points.map(p => p.y),
      u: points.map(p => p.u),
      v: points.map(p => p.v),
      customdata: points.map(p => [p.dateLabel, p.speed]),
      anchor: 'center' as const,
      lengthmode: 'scaled' as const,
      lengthfactor: 0.8,
      arrowref: 'paper' as const, // keeps arrow angles correct despite day/month axes having different scales
      marker: {
        color: points.map(p => p.speed),
        colorscale: compProps.variable === Variables.windAverage ? 'Portland' : VARIABLES[compProps.variable]?.heatmapGradient as ColorScale,
        showscale: true,
        colorbar: {
          title: {
            side: 'right' as const,
            font: { color: store.storeIsDarkMode ? 'white' : 'black' },
          },
          tickfont: { color: store.storeIsDarkMode ? 'white' : 'black' },
          orientation: (isVertical.value ? 'h' : 'v') as 'h' | 'v',
        },
        line: { width: 1.5 },
        arrowsize: 0.9,
      },
      hovertemplate: '%{customdata[0]}: %{customdata[1]}<extra></extra>',
    }

    const monthTickvals = monthNames.value.map((_, i) => i)
    const monthTicktext = isVertical.value ? monthNames.value.slice().reverse() : monthNames.value

    const dayAxis: Record<string, unknown> = {
      showgrid: false,
      zeroline: false,
      tickmode: 'linear' as const,
      dtick: 2,
      range: [0, 32],
      title: { text: t('widgetChartHeatmapAxisTitleDay'), font: { color: store.storeIsDarkMode ? 'white' : 'black' } },
      tickfont: { color: store.storeIsDarkMode ? 'white' : 'black' },
    }
    const monthAxis: Record<string, unknown> = {
      showgrid: false,
      zeroline: false,
      tickmode: 'array' as const,
      tickvals: monthTickvals,
      ticktext: monthTicktext,
      range: [-0.5, monthNames.value.length - 0.5],
      title: { text: t('widgetChartHeatmapAxisTitleMonth'), font: { color: store.storeIsDarkMode ? 'white' : 'black' } },
      tickfont: { color: store.storeIsDarkMode ? 'white' : 'black' },
    }

    const xAxis = isVertical.value ? monthAxis : dayAxis
    const yAxis = isVertical.value ? dayAxis : monthAxis

    const layout = {
      height: isVertical.value ? 800 : 500,
      margin: {
        t: 0,
        b: 50,
        l: 50,
        r: isVertical.value ? 0 : 50,
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: store.storeIsDarkMode ? 'rgba(255, 255, 255, .1)' : 'rgba(0, 0, 0, .1)',
      xaxis: xAxis,
      yaxis: yAxis,
    }

    const config = {
      responsive: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['toImage' as const],
    }

    Plotly.newPlot(chart.value, [trace], layout, config)
      .then(element => {
        isRedrawing.value = false

        element.on('plotly_click', data => {
          if (data.points.length > 0) {
            const date = (data.points[0]?.customdata as [string, number] | undefined)?.[0]

            if (date) {
              router.push({ path: '/', query: { date } })
            }
          }
        })
      })
  }

  function formatDate (date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  watch(() => compProps.data, async () => redraw())
  watch(() => compProps.aggregation, async () => redraw())
  watch(() => compProps.variable, async () => redraw())
  watch(() => compProps.year, async () => redraw())
  watch(() => store.storeIsDarkMode, async () => redraw())
  watch(locale, async () => nextTick(() => redraw()))

  onMounted(() => redraw())
</script>
