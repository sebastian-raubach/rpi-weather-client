<template>
  <div class="mt-4">
    <b-row>
      <b-col cols=12 md=4>
        <b-form-select :options="years" v-model="year" />
      </b-col>
      <b-col cols=12 md=4>
        <b-form-select :options="climateOptions" v-model="climate" />
      </b-col>
      <b-col cols=12 md=4>
        <b-form-select :options="aggregationOptions" v-model="aggregation" />
      </b-col>
    </b-row>
    <div class="my-3" ref="heatmap" />
    <div class="my-3" ref="boxplot" />
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      year: new Date().getFullYear(),
      years: [],
      data: null,
      climateOptions: ['ambientTemp', 'groundTemp', 'pressure', 'humidity', 'windAverage', 'windSpeed', 'windGust', 'rainfall'],
      aggregationOptions: ['min', 'max', 'avg', 'stdv'],
      climate: 'ambientTemp',
      aggregation: 'max',
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      colors: ['#EA2027', '#EE5A24', '#F79F1F', '#FFC312', '#C4E538', '#A3CB38', '#009432', '#006266', '#1B1464', '#0652DD', '#1289A7', '#12CBC4'],
      gradients: {
        rainfall: [[0, 'rgba(255, 255, 255, .2)'], [0.0001, 'white'], [1, '#0652DD']],
        ambientTemp: [[0, '#0652DD'], [0.5, 'white'], [1, '#EA2027']],
        groundTemp: [[0, '#0652DD'], [0.5, 'white'], [1, '#EA2027']],
        pressure: [[0, 'rgba(255, 255, 255, .2)'], [0.0001, 'white'], [1, '#12CBC4']],
        humidity: [[0, 'rgba(255, 255, 255, .2)'], [0.0001, 'white'], [1, '#0652DD']],
        windSpeed: [[0, 'rgba(255, 255, 255, .2)'], [0.0001, 'white'], [1, '#B53471']],
        windGust: [[0, 'rgba(255, 255, 255, .2)'], [0.0001, 'white'], [1, '#833471']],
        windAverage: [[0, '#ED4C67'], [1, '#6F1E51']]
      }
    }
  },
  computed: {
    start: function () {
      return this.year ? new Date(this.year, 0, 1) : new Date()
    },
    end: function () {
      return this.year ? new Date(this.year, 11, 31) : new Date()
    }
  },
  watch: {
    data: function () {
      this.update()
    },
    climate: function () {
      this.update()
    },
    aggregation: function () {
      this.update()
    },
    year: function () {
      this.getData()
    }
  },
  methods: {
    update: function () {
      this.updateHeatmap()
      this.updateBoxplot()
    },
    updateBoxplot: function () {
      this.$plotly.purge(this.$refs.boxplot)

      const data = this.months.map((m, i) => {
        const y = this.data.filter(d => {
          const date = new Date(d.date)
          return date.getMonth() === i
        }).map(d => (d && d[this.aggregation]) ? d[this.aggregation][this.climate] : null)

        return {
          y: y,
          type: 'box',
          name: m,
          visible: true,
          boxpoints: 'all',
          jitter: 0.3,
          pointpos: -1.8,
          marker: {
            color: this.colors[i]
          }
        }
      })

      const layout = {
        margin: { l: 75, r: 35, t: 25, b: 75, autoexpand: true },
        dragmode: false,
        autosize: true,
        paper_bgcolor: '#4e5d6c',
        plot_bgcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
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
        xaxis: {
          gridcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
          tickfont: { color: 'white' },
          title: { text: 'Month', font: { color: 'white' } }
        },
        yaxis: {
          gridcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
          tickfont: { color: 'white' },
          title: { text: 'Value', font: { color: 'white' } }
        }
      }

      const config = {
        displayModeBar: false,
        responsive: true,
        displaylogo: false
      }

      this.$plotly.newPlot(this.$refs.boxplot, data, layout, config)
    },
    updateHeatmap: function () {
      this.$plotly.purge(this.$refs.heatmap)

      const dates = []
      const current = new Date(this.start)

      while (current.getTime() <= this.end.getTime()) {
        dates.push(new Date(current))
        current.setDate(current.getDate() + 1)
      }

      const y = Array.from(Array(31).keys()).map(i => i + 1)
      const x = Array.from(Array(12).keys()).map(i => i + 1)
      const z = y.map(xi => x.map(yi => {
        const date = new Date(this.year, yi - 1, xi)
        // We've moved into next month
        if (date.getMonth() !== yi - 1) {
          return null
        }
        const dateString = date.toDateString()
        const datum = this.data.find(d => new Date(d.date).toDateString() === dateString)
        return (datum && datum[this.aggregation]) ? datum[this.aggregation][this.climate] : null
      }))
      const data = [{
        x: x,
        y: y,
        z: z,
        type: 'heatmap',
        colorbar: {
          tickfont: {
            color: 'white'
          }
        },
        colorscale: this.gradients[this.climate]
      }]

      const layout = {
        margin: { l: 75, r: 35, t: 25, b: 75, autoexpand: true },
        height: 700,
        dragmode: false,
        autosize: true,
        paper_bgcolor: '#4e5d6c',
        plot_bgcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
        yaxis: {
          tickmode: 'array',
          tickvals: y,
          ticktext: y,
          gridcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
          tickfont: { color: 'white' },
          title: { text: 'Day', font: { color: 'white' } }
        },
        xaxis: {
          tickmode: 'array',
          tickvals: x,
          ticktext: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          gridcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
          tickfont: { color: 'white' },
          title: { text: 'Month', font: { color: 'white' } }
        },
        legend: { orientation: 'h', x: 1, y: 1, xanchor: 'right', font: { color: 'white' } },
        annotations: []
      }

      // Show the number values
      // for (let i = 0; i < y.length; i++) {
      //   for (let j = 0; j < x.length; j++) {
      //     layout.annotations.push({
      //       xref: 'x1',
      //       yref: 'y1',
      //       x: x[j],
      //       y: y[i],
      //       text: z[i][j] !== null ? z[i][j].toFixed(1) : '',
      //       showarrow: false,
      //       font: {
      //         color: 'white'
      //       }
      //     })
      //   }
      // }

      const config = {
        displayModeBar: false,
        responsive: true,
        displaylogo: false
      }

      this.$plotly.newPlot(this.$refs.heatmap, data, layout, config)
    },
    getData: function () {
      this.apiGetYearly(this.start, this.end)
        .then(result => {
          this.data = result

          this.update()
        })
    }
  },
  mounted: function () {
    this.getYears()
      .then(result => {
        this.years = result

        this.getData()
      })
  }
}
</script>

<style>

</style>
