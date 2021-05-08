<template>
  <div ref="chart" />
</template>

<script>
const SunCalc = require('suncalc')
const sunDates = SunCalc.getTimes(new Date(), 56.498942, -3.018231)

export default {
  props: {
    data: {
      type: Array,
      default: () => []
    },
    traces: {
      type: Array,
      default: () => []
    },
    xTitle: {
      type: String,
      default: 'x'
    },
    yTitle: {
      type: String,
      default: 'y'
    }
  },
  watch: {
    data: function () {
      this.update()
    },
    traces: function () {
      this.update()
    },
    xTitle: function () {
      this.update()
    },
    yTitle: function () {
      this.update()
    }
  },
  methods: {
    unpack: function (rows, key) {
      return rows.map(row => {
        const dataPoint = row[key]
        if (dataPoint === undefined || dataPoint === null || dataPoint === '') {
          return null
        } else {
          let isDate = false

          if (key === 'Date') {
            isDate = true
          } else if (dataPoint.split('-').length === 3 && !isNaN(Date.parse(dataPoint))) {
            isDate = true
          }

          if (isDate) {
            return dataPoint
          } else {
            var value = parseFloat(dataPoint)

            if (isNaN(value)) {
              return dataPoint
            } else {
              return value
            }
          }
        }
      })
    },
    update: function () {
      this.$plotly.purge(this.$refs.chart)

      if (!this.data || !this.traces) {
        return
      }

      let minDate = null
      let maxDate = null

      const data = this.traces.map(t => {
        const x = this.unpack(this.data, t.x)
        const xDates = x.map(t => new Date(t))
        const minX = new Date(Math.min.apply(null, xDates))
        const maxX = new Date(Math.max.apply(null, xDates))

        if (minDate) {
          minDate = new Date(Math.min.apply(null, [minDate, minX]))
        } else {
          minDate = minX
        }
        if (maxDate) {
          maxDate = new Date(Math.max.apply(null, [maxDate, maxX]))
        } else {
          maxDate = maxX
        }

        let y = this.unpack(this.data, t.y)

        if (t.mode === 'smooth') {
          y = this.smooth(y, 2)
        } else if (t.mode === 'cumulative') {
          y = this.cumulative(y)
        }

        return {
          x: x,
          y: y,
          type: 'line',
          name: this.traces.length < 2 ? null : t.y,
          mode: 'lines',
          marker: {
            color: t.color
          },
          legenditem: {
            textfont: {
              color: 'white'
            }
          }
        }
      })

      const layout = {
        margin: { l: 50, r: 10, t: 10, b: 50, autoexpand: true },
        dragmode: false,
        autosize: true,
        paper_bgcolor: '#4e5d6c',
        plot_bgcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
        xaxis: {
          gridcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
          tickfont: { color: 'white' },
          title: { text: this.xTitle, font: { color: 'white' } }
        },
        yaxis: {
          gridcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
          tickfont: { color: 'white' },
          title: { text: this.yTitle, font: { color: 'white' } }
        },
        legend: { orientation: 'h', x: 1, y: 1, xanchor: 'right', font: { color: 'white' } },
        type: 'line'
      }

      const containsSunrise = this.sunrise.getTime() >= minDate.getTime() && this.sunrise.getTime() <= maxDate.getTime()
      const containsSunset = this.sunset.getTime() >= minDate.getTime() && this.sunset.getTime() <= maxDate.getTime()

      if (containsSunrise || containsSunset) {
        const shapes = []

        if (containsSunrise) {
          shapes.push({
            type: 'line',
            yref: 'paper',
            x0: this.toFormattedDate(this.sunrise),
            y0: 0,
            x1: this.toFormattedDate(this.sunrise),
            y1: 1,
            line: {
              color: 'grey',
              width: 1.5,
              dash: 'dot'
            }
          })
        }
        if (containsSunset) {
          shapes.push({
            type: 'line',
            yref: 'paper',
            x0: this.toFormattedDate(this.sunset),
            y0: 0,
            x1: this.toFormattedDate(this.sunset),
            y1: 1,
            line: {
              color: 'grey',
              width: 1.5,
              dash: 'dot'
            }
          })
        }

        layout.shapes = shapes
      }

      const config = {
        displayModeBar: false,
        responsive: true,
        displaylogo: false
      }

      this.$plotly.newPlot(this.$refs.chart, data, layout, config)
    },
    smooth: function (data, range) {
      const result = []

      for (let i = 0; i < data.length; i++) {
        const values = data.slice(Math.max(0, i - range), Math.min(data.length - 1, i + range + 1))

        result.push(values.reduce((a, b) => a + b, 0) / values.length)
      }

      return result
    },
    cumulative: function (data) {
      const result = []

      let total = 0
      data.forEach(d => {
        if (d !== undefined && d !== null) {
          total += d
        }

        result.push(total)
      })

      return result
    }
  },
  mounted: function () {
    this.sunrise = sunDates.sunrise
    this.sunset = sunDates.sunset
    this.update()
  }
}
</script>

<style>

</style>
