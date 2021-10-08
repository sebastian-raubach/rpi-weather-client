<template>
  <div ref="chart" />
</template>

<script>
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
    },
    sunriseSunset: {
      type: Array,
      default: () => []
    },
    yRange: {
      type: Array,
      default: null
    },
    shapes: {
      type: Array,
      default: null
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
    },
    sunriseSunset: function () {
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
          } else if (typeof dataPoint === 'string' && !isNaN(Date.parse(dataPoint))) {
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

      let shapes = this.shapes ? this.shapes.concat() : []

      let minY = Number.MAX_SAFE_INTEGER
      let maxY = -Number.MAX_SAFE_INTEGER

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

        if (t.aggregation === 'smooth') {
          y = this.smooth(y, 2)
        } else if (t.aggregation === 'cumulative') {
          y = this.cumulative(y)
        }

        minY = Math.min(minY, Math.min.apply(null, y))
        maxY = Math.max(maxY, Math.max.apply(null, y))

        return {
          x: x,
          y: y,
          type: 'line',
          name: this.traces.length < 2 ? null : t.y,
          mode: t.mode || 'lines',
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

      if (shapes) {
        shapes = shapes.filter(s => s.y1 > minY && s.y0 < maxY)
          .map(s => {
            if (s.y0 < minY) {
              s.y0 = minY
            }
            if (s.y1 > maxY) {
              s.y1 = maxY
            }
            return s
          })
      }

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
        legend: { orientation: 'h', font: { color: 'white' } },
        type: 'line',
        shapes: shapes
      }

      if (this.yRange) {
        layout.yaxis.range = this.yRange
      }

      layout.xaxis.range = [minDate, maxDate]

      this.sunriseSunset.forEach(ss => {
        const containsSunrise = ss.sunrise.getTime() >= minDate.getTime() && ss.sunrise.getTime() <= maxDate.getTime()
        const containsSunset = ss.sunset.getTime() >= minDate.getTime() && ss.sunset.getTime() <= maxDate.getTime()

        if (containsSunrise) {
          layout.shapes.push({
            type: 'line',
            yref: 'paper',
            x0: this.toFormattedDateTime(ss.sunrise),
            y0: 0,
            x1: this.toFormattedDateTime(ss.sunrise),
            y1: 1,
            line: {
              color: '#F79F1F',
              width: 1.5,
              dash: 'dot'
            }
          })
        }
        if (containsSunset) {
          layout.shapes.push({
            type: 'line',
            yref: 'paper',
            x0: this.toFormattedDateTime(ss.sunset),
            y0: 0,
            x1: this.toFormattedDateTime(ss.sunset),
            y1: 1,
            line: {
              color: '#9980FA',
              width: 1.5,
              dash: 'dot'
            }
          })
        }
      })

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
    this.update()
  }
}
</script>

<style>

</style>
