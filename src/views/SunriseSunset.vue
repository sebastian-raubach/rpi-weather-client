<template>
  <div class="mt-4">
    {{ sun }}

    <div ref="chart" />
  </div>
</template>

<script>
const SunCalc = require('suncalc')

export default {
  data: function () {
    return {
      sun: null
    }
  },
  mounted: function () {
    let d = new Date()
    d = new Date(d.getFullYear(), 0, 1, 12, 0, 0, 0, 0)

    const dates = []
    const result = []
    for (let i = 0; i < 365; i++) {
      dates.push(new Date(d.getTime()))
      const s = SunCalc.getTimes(d, 56.498942, -3.018231)

      result.push({
        sunrise: s.sunrise,
        sunset: s.sunset
      })

      d.setDate(d.getDate() + 1)
    }

    const trace1 = {
      type: 'scatter',
      mode: 'lines',
      x: dates,
      y: result.map(r => {
        const time = r.sunrise.toISOString().split('T')[1]
        return `2024-01-01 ${time}`
      })
    }
    const trace2 = {
      type: 'scatter',
      mode: 'lines',
      fill: 'tonexty',
      x: dates,
      y: result.map(r => {
        const time = r.sunset.toISOString().split('T')[1]
        return `2024-01-01 ${time}`
      })
    }

    const data = [trace1, trace2]

    console.log(trace1)

    const layout = {
      hovermode: 'x',
      yaxis: {
        tickformat: '%H:%M:%S',
        range: ['2024-01-01 00:00:00', '2024-01-01 23:59:59']
      }
    }

    this.$plotly.newPlot(this.$refs.chart, data, layout)
  }
}
</script>
