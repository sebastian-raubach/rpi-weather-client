<template>
  <div ref="chart" />
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default: () => null
    },
    trace: {
      type: Object,
      default: () => null
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
  data: function () {
    return {
      colors: ['#910080', '#ff7c00', '#5ec418', '#00a0f1', '#c5e000', '#ff007a', '#222183', '#c83831', '#fff600']
    }
  },
  watch: {
    data: function () {
      this.update()
    },
    trace: function () {
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
    hexToRgbA: function (hex) {
      let c
      if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('')
        if (c.length === 3) {
          c = [c[0], c[0], c[1], c[1], c[2], c[2]]
        }
        c = '0x' + c.join('')
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',0.1)'
      } else {
        return 'rgba(255,255,255,0.1)'
      }
    },
    unpack: function (rows, x, y, std) {
      const xs = []
      const ys = []
      const stds = []

      rows.forEach(row => {
        let xValue = row[x]
        let yValue = row[y]
        let stdValue = row[std]

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

        let value = parseFloat(yValue)
        if (!isNaN(value)) {
          yValue = value
        }
        value = parseFloat(stdValue)
        if (!isNaN(value)) {
          stdValue = value
        }

        xs.push(xValue)
        ys.push(yValue)
        stds.push(stdValue)
      })

      return [xs, ys, stds]
    },
    update: function () {
      this.$plotly.purge(this.$refs.chart)

      if (!this.data || !this.trace) {
        return
      }

      let minDate = null
      let maxDate = null

      let minY = Number.MAX_SAFE_INTEGER
      let maxY = -Number.MAX_SAFE_INTEGER

      const data = []

      Object.keys(this.data).forEach((year, i) => {
        const yearData = this.data[year]

        let [x, y, yStds] = this.unpack(yearData, this.trace.x, this.trace.y, this.trace.yStd)

        x = x.map(xs => '2023' + xs.substring(4))

        const xDates = x.map(t => new Date(t))
        const minX = xDates.length > 0 ? new Date(Math.min.apply(null, xDates)) : null
        const maxX = xDates.length > 0 ? new Date(Math.max.apply(null, xDates)) : null

        if (this.trace.y === 'avgLux') {
          console.log(xDates)
        }

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

        minY = Math.min(minY, Math.min.apply(null, y))
        maxY = Math.max(maxY, Math.max.apply(null, y))

        data.push({
          x: x,
          y: y,
          type: this.trace.type || 'line',
          name: year,
          marker: {
            color: this.colors[i]
          },
          line: {
            dash: 'solid'
          },
          legenditem: {
            textfont: {
              color: 'white'
            }
          }
        })

        if (this.trace.yStd) {
          const yRange = y.map((ys, i) => ys + yStds[i]).concat(y.map((ys, i) => ys - yStds[i]).reverse())
          data.push({
            x: x.concat(x.concat().reverse()),
            y: yRange,
            type: 'line',
            mode: 'lines',
            showlegend: false,
            hoverinfo: 'skip',
            fill: 'tozerox',
            fillcolor: this.hexToRgbA(this.colors[i]),
            line: {
              color: 'transparent'
            }
          })
        }
      })

      console.log(this.trace.y, [minDate, maxDate])

      const layout = {
        margin: { l: 50, r: 10, t: 10, b: 50, autoexpand: true },
        dragmode: false,
        autosize: true,
        hovermode: 'x',
        paper_bgcolor: '#4e5d6c',
        plot_bgcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
        xaxis: {
          gridcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
          tickfont: { color: 'white' },
          title: { text: this.xTitle, font: { color: 'white' } },
          tickformat: '%B %d',
          range: this.trace.type === 'bar' ? null : [minDate, maxDate]
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
        }
      }

      const config = {
        displayModeBar: false,
        responsive: true,
        displaylogo: false
      }

      this.$plotly.newPlot(this.$refs.chart, data, layout, config)
    }
  },
  mounted: function () {
    this.update()
  }
}
</script>

<style scoped>
</style>
