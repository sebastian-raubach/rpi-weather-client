<template>
  <div ref="chart" />
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      default: null
    },
    data: {
      type: Array,
      default: () => []
    },
    forecast: {
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
    yToZero: {
      type: Boolean,
      default: false
    },
    xRange: {
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
    forecast: function () {
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
    unpack: function (rows, x, y) {
      const xs = []
      const ys = []

      rows.forEach(row => {
        let xValue = row[x]
        let yValue = row[y]

        if (yValue === undefined || yValue === null || yValue === '' || xValue === undefined || xValue === null || xValue === '') {
          return
        } else {
          let isDate = false

          if (x === 'Date') {
            isDate = true
          } else if (typeof xValue === 'string' && !isNaN(Date.parse(xValue))) {
            isDate = true
          }

          if (!isDate) {
            const value = parseFloat(xValue)

            if (!isNaN(value)) {
              xValue = value
            }
          }
        }

        const value = parseFloat(yValue)

        if (!isNaN(value)) {
          yValue = value
        }

        xs.push(xValue)
        ys.push(yValue)
      })

      return [xs, ys]
      // return rows.map(row => {
      //   const dataPoint = row[key]
      //   if (dataPoint === undefined || dataPoint === null || dataPoint === '') {
      //     return null
      //   } else {
      //     let isDate = false

      //     if (key === 'Date') {
      //       isDate = true
      //     } else if (typeof dataPoint === 'string' && !isNaN(Date.parse(dataPoint))) {
      //       isDate = true
      //     }

      //     if (isDate) {
      //       return dataPoint
      //     } else {
      //       const value = parseFloat(dataPoint)

      //       if (isNaN(value)) {
      //         return dataPoint
      //       } else {
      //         return value
      //       }
      //     }
      //   }
      // })
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

      const data = this.traces.map((t, ti) => {
        let [x, y] = this.unpack(t.isForecast ? this.forecast : this.data, t.x, t.y)

        // const x = this.unpack(t.isForecast ? this.forecast : this.data, t.x)
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

        if (t.transformation) {
          [x, y] = t.transformation(x, y)
        }

        if (t.aggregation === 'smooth') {
          y = this.smooth(y, 1)
        } else if (t.aggregation === 'cumulative') {
          if (t.isForecast === true) {
            const otherY = this.traces.filter((tt, tti) => tti !== ti && tt.y === t.y)
            if (otherY && otherY.length > 0) {
              // eslint-disable-next-line
              let [ox, oy] = this.unpack(this.data, otherY[0].x, otherY[0].y)

              // Find the index in the real data that is larger than the first forecast entry.
              // We're going to use this as an offset value for the forecast data.
              let index = 0
              for (let ind = 0; ind < ox.length; ind++) {
                if (ox[ind] > x[0]) {
                  index = ind
                  break
                }
              }

              if (oy.length > 0) {
                oy = this.cumulative(oy)
                y = this.cumulative(y, oy[index] - y[0])
              } else {
                y = this.cumulative(y)
              }
            } else {
              y = this.cumulative(y)
            }
          } else {
            y = this.cumulative(y)
          }
        }

        minY = Math.min(minY, Math.min.apply(null, y))
        maxY = Math.max(maxY, Math.max.apply(null, y))

        const result = {
          x: x,
          y: y,
          type: t.type || 'line',
          name: this.traces.length < 2 ? null : (t.legendTitle || t.y),
          mode: t.mode || 'lines',
          marker: {
            color: t.color
          },
          line: {
            dash: t.isForecast ? 'dashdot' : 'solid'
          },
          legenditem: {
            textfont: {
              color: 'white'
            }
          }
        }

        if (t.transformation && t.type === 'bar') {
          result.offset = 0
          result.width = 1000 * 60 * 60
          result.opacity = 0.5
          result.hoverinfo = 'skip'
        }

        return result
      })

      if (shapes) {
        shapes = shapes.filter(s => /* s.y1 > minY && */s.y0 < maxY)
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
        dragmode: this.id === 'rainfall' ? 'select' : false,
        autosize: true,
        hovermode: 'x',
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
        legend: {
          xanchor: 'left',
          yanchor: 'bottom',
          y: 1,
          x: 0,
          orientation: 'h',
          font: {
            color: 'white'
          }
        },
        type: 'line',
        shapes: shapes
      }

      if (this.xRange) {
        layout.xaxis.range = this.xRange.map(d => new Date(d))
      } else {
        layout.xaxis.range = [minDate, maxDate]
      }
      if (this.yRange) {
        layout.yaxis.range = this.yRange
      }
      if (this.yToZero) {
        layout.yaxis.rangemode = 'tozero'
        layout.yaxis.autorange = true
      }

      this.sunriseSunset.forEach(ss => {
        const containsSunrise = ss.sunrise.getTime() >= layout.xaxis.range[0].getTime() && ss.sunrise.getTime() <= layout.xaxis.range[1].getTime()
        const containsSunset = ss.sunset.getTime() >= layout.xaxis.range[0].getTime() && ss.sunset.getTime() <= layout.xaxis.range[1].getTime()

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

      this.$refs.chart.on('plotly_selected', eventData => this.$emit('rainfall-range-selected', eventData ? eventData.range.x : null))
    },
    smooth: function (data, range) {
      const result = []

      for (let i = 0; i < data.length; i++) {
        const values = data.slice(Math.max(0, i - range), Math.min(data.length - 1, i + range + 1))

        result.push(values.reduce((a, b) => a + b, 0) / values.length)
      }

      return result
    },
    cumulative: function (data, adjustBy = 0) {
      const result = []

      let total = adjustBy
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
