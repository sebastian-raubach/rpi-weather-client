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
    x: {
      type: String,
      default: null
    },
    y: {
      type: String,
      default: null
    }
  },
  watch: {
    data: function () {
      this.update()
    },
    x: function () {
      this.update()
    },
    y: function () {
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

      if (!this.data) {
        return
      }

      const data = [{
        x: this.unpack(this.data, this.x),
        y: this.unpack(this.data, this.y),
        type: 'line',
        mode: 'lines',
        marker: {
          color: '#A3CB38'
        }
      }]

      const layout = {
        margin: { l: 50, r: 10, t: 10, b: 50, autoexpand: true },
        dragmode: false,
        autosize: true,
        paper_bgcolor: '#4e5d6c',
        plot_bgcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
        xaxis: {
          gridcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
          tickfont: { color: 'white' },
          title: { text: this.x, font: { color: 'white' } }
        },
        yaxis: {
          gridcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
          tickfont: { color: 'white' },
          title: { text: this.y, font: { color: 'white' } }
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

<style>

</style>
