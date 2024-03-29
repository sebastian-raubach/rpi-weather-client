<template>
  <div class="mt-4">
    <b-row>
      <b-col cols=12 md=4>
        <b-button-group>
          <b-button v-for="(year, index) in years" :key="`button-year-${year}`" :pressed="yearsDisplay[index]" @click="toggleYear(index)">{{ year }}</b-button>
        </b-button-group>
      </b-col>
      <b-col cols=12 md=4>
        <b-form-select :options="climateOptions" v-model="climate" />
      </b-col>
      <b-col cols=12 md=4>
        <b-form-select :options="aggregationOptions" v-model="aggregation" />
      </b-col>
    </b-row>
    <b-row>
      <b-col cols=12 :md="12 / yearIndices.length" v-for="year in yearIndices" :key="`heatmap-${year}`">
        <div class="my-3" :ref="`heatmap-${year}`" />
      </b-col>
      <b-col cols=12 :md="12 / yearIndices.length" v-for="year in yearIndices" :key="`line-${year}`">
        <div class="my-3" :ref="`line-${year}`" />
      </b-col>
      <b-col cols=12 :md="12 / yearIndices.length" v-for="year in yearIndices" :key="`boxplot-${year}`">
        <div class="my-3" :ref="`boxplot-${year}`" />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Vue from 'vue'

export default {
  data: function () {
    return {
      year: new Date().getFullYear(),
      years: [],
      yearsDisplay: [],
      data: {},
      climateOptions: ['ambientTemp', 'groundTemp', 'piTemp', 'pressure', 'humidity', 'windAverage', 'windSpeed', 'windGust', 'rainfall', 'lux'],
      aggregationOptions: ['min', 'max', 'avg', 'stdv'],
      climate: 'ambientTemp',
      aggregation: 'max',
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      colors: ['#EA2027', '#EE5A24', '#F79F1F', '#FFC312', '#C4E538', '#A3CB38', '#009432', '#006266', '#1B1464', '#0652DD', '#1289A7', '#12CBC4'],
      gradients: {
        rainfall: [[0, 'rgba(255, 255, 255, .2)'], [0.0001, 'white'], [1, '#0652DD']],
        ambientTemp: [[0, '#0652DD'], [0.5, 'white'], [1, '#EA2027']],
        groundTemp: [[0, '#0652DD'], [0.5, 'white'], [1, '#EA2027']],
        piTemp: [[0, '#0652DD'], [0.5, 'white'], [1, '#EA2027']],
        pressure: [[0, 'rgba(255, 255, 255, .2)'], [0.0001, 'white'], [1, '#12CBC4']],
        humidity: [[0, 'rgba(255, 255, 255, .2)'], [0.0001, 'white'], [1, '#0652DD']],
        windSpeed: [[0, 'rgba(255, 255, 255, .2)'], [0.0001, 'white'], [1, '#B53471']],
        windGust: [[0, 'rgba(255, 255, 255, .2)'], [0.0001, 'white'], [1, '#833471']],
        windAverage: [[0, '#ED4C67'], [1, '#6F1E51']],
        lux: [[0, 'rgba(255, 255, 255, .2)'], [0.0001, 'white'], [1, '#F79F1F']]
      },
      windowWidth: 1920
    }
  },
  computed: {
    isHorizontal: function () {
      return this.windowWidth < 720
    },
    yearIndices: function () {
      const result = []

      this.yearsDisplay.forEach((y, i) => {
        if (y) {
          result.push(this.years[i])
        }
      })

      return result
    }
  },
  watch: {
    isHorizontal: function () {
      this.update()
    },
    data: function () {
      this.update()
    },
    climate: function () {
      this.update()
    },
    aggregation: function () {
      this.update()
    },
    year: function (newValue) {
      this.getData(newValue)
    }
  },
  methods: {
    toggleYear: function (index) {
      const result = !this.yearsDisplay[index]
      Vue.set(this.yearsDisplay, index, result)

      if (result) {
        this.$nextTick(() => this.getData(this.years[index]))
      } else {
        this.$nextTick(() => this.update())
      }
    },
    update: function () {
      this.years.forEach(year => {
        if (this.$refs[`boxplot-${year}`]) {
          this.$plotly.purge(this.$refs[`boxplot-${year}`][0])
        }
        if (this.$refs[`line-${year}`]) {
          this.$plotly.purge(this.$refs[`line-${year}`][0])
        }
        if (this.$refs[`heatmap-${year}`]) {
          this.$plotly.purge(this.$refs[`heatmap-${year}`][0])
        }
      })

      this.updateHeatmap(window.innerWidth < 720)
      this.updateLine(window.innerWidth < 720)
      this.updateBoxplot(window.innerWidth < 720)
    },
    updateLine: function (horizontal) {
      let minY = Number.MAX_SAFE_INTEGER
      let maxY = -Number.MAX_SAFE_INTEGER

      this.yearsDisplay.forEach((y, i) => {
        const year = this.years[i]

        if (y) {
          this.data[year].forEach(d => {
            const value = (d && d[this.aggregation]) ? d[this.aggregation][this.climate] : null

            if (value !== null) {
              minY = Math.min(minY, value)
              maxY = Math.max(maxY, value)
            }
          })
        }
      })

      this.yearsDisplay.forEach((y, i) => {
        const year = this.years[i]

        if (y) {
          const start = new Date(this.data[year][0].date)
          const startOfYear = new Date(start.getFullYear(), 0, 1)
          const end = new Date(this.data[year][this.data[year].length - 1].date)
          const endOfYear = new Date(end.getFullYear(), 11, 31)

          let xData = this.data[year].map(d => new Date(d.date))
          let yData = this.data[year].map(d => (d && d[this.aggregation]) ? d[this.aggregation][this.climate] : null)
          const color = xData.map(d => d.getMonth())

          if (horizontal) {
            [xData, yData] = [yData, xData]
          }

          const data = [{
            x: xData,
            y: yData,
            type: 'scatter',
            mode: 'markers',
            marker: {
              cmin: 0,
              cmax: 11,
              color: color,
              colorscale: this.colors.map((c, i) => [i / (this.colors.length - 1), c])
            }
          }]

          let xAxis = {
            gridcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
            tickfont: { color: 'white' },
            title: { text: 'Date', font: { color: 'white' } },
            range: horizontal ? [endOfYear, startOfYear] : [startOfYear, endOfYear]
          }

          let yAxis = {
            gridcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
            tickfont: { color: 'white' },
            title: { text: 'Value', font: { color: 'white' } },
            range: [minY - 3, maxY + 3]
          }

          if (horizontal) {
            [xAxis, yAxis] = [yAxis, xAxis]
          }

          const layout = {
            title: {
              text: `Year ${year}`,
              font: { color: 'white' }
            },
            margin: { l: 75, r: 35, t: 65, b: 75, autoexpand: true },
            height: horizontal ? 840 : 600,
            dragmode: false,
            autosize: true,
            paper_bgcolor: '#4e5d6c',
            plot_bgcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
            xaxis: xAxis,
            yaxis: yAxis,
            type: 'line',
            hovermode: 'x'
          }

          const config = {
            displayModeBar: false,
            responsive: true,
            displaylogo: false
          }

          this.$plotly.newPlot(this.$refs[`line-${year}`][0], data, layout, config)
        }
      })
    },
    updateBoxplot: function (horizontal) {
      let minY = Number.MAX_SAFE_INTEGER
      let maxY = -Number.MAX_SAFE_INTEGER

      this.yearsDisplay.forEach((y, i) => {
        const year = this.years[i]

        if (y) {
          this.data[year].forEach(d => {
            const value = (d && d[this.aggregation]) ? d[this.aggregation][this.climate] : null

            if (value !== null) {
              minY = Math.min(minY, value)
              maxY = Math.max(maxY, value)
            }
          })
        }
      })

      this.yearsDisplay.forEach((y, i) => {
        const year = this.years[i]

        if (y) {
          const data = this.months.map((m, i) => {
            if (horizontal) {
              i = 11 - i
            }

            const y = this.data[year].filter(d => new Date(d.date).getMonth() === i)
              .map(d => (d && d[this.aggregation]) ? d[this.aggregation][this.climate] : null)

            let isEmpty = false
            if (y.length < 1) {
              y.push(0)
              isEmpty = true
            }

            return {
              y: horizontal ? null : y,
              x: horizontal ? y : null,
              opacity: isEmpty ? 0 : 1,
              hoverinfo: isEmpty ? 'none' : 'all',
              type: 'box',
              name: this.months[i],
              visible: true,
              boxpoints: 'all',
              jitter: 0.3,
              pointpos: -1.8,
              marker: {
                color: this.colors[i]
              }
            }
          })

          let xAxis = {
            gridcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
            tickfont: { color: 'white' },
            title: { text: 'Month', font: { color: 'white' } }
          }
          let yAxis = {
            gridcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
            tickfont: { color: 'white' },
            title: { text: 'Value', font: { color: 'white' } },
            range: [minY - 3, maxY + 3]
          }

          if (horizontal) {
            [xAxis, yAxis] = [yAxis, xAxis]
          }

          const layout = {
            title: {
              text: `Year ${year}`,
              font: { color: 'white' }
            },
            margin: { l: 75, r: 35, t: 65, b: 75, autoexpand: true },
            height: horizontal ? 840 : 600,
            dragmode: false,
            autosize: true,
            paper_bgcolor: '#4e5d6c',
            plot_bgcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
            legend: {
              orientation: 'h',
              font: {
                color: 'white'
              }
            },
            xaxis: xAxis,
            yaxis: yAxis
          }

          const config = {
            displayModeBar: false,
            responsive: true,
            displaylogo: false
          }

          this.$plotly.newPlot(this.$refs[`boxplot-${year}`][0], data, layout, config)
        }
      })
    },
    updateHeatmap: function () {
      let minZ = Number.MAX_SAFE_INTEGER
      let maxZ = -Number.MAX_SAFE_INTEGER

      this.yearsDisplay.forEach((y, i) => {
        const year = this.years[i]

        if (y) {
          const y = Array.from(Array(31).keys()).map(i => i + 1)
          const x = Array.from(Array(12).keys()).map(i => i + 1)
          y.forEach(xi => x.forEach(yi => {
            const date = new Date(year, yi - 1, xi)
            // We've moved into next month
            if (date.getMonth() !== yi - 1) {
              return null
            }
            const dateString = date.toDateString()
            const datum = this.data[year].find(d => new Date(d.date).toDateString() === dateString)
            const value = (datum && datum[this.aggregation]) ? datum[this.aggregation][this.climate] : null

            if (value !== null) {
              maxZ = Math.max(maxZ, value)
              minZ = Math.min(minZ, value)
            }
          }))
        }
      })

      this.yearsDisplay.forEach((y, i) => {
        const year = this.years[i]

        if (y) {
          const y = Array.from(Array(31).keys()).map(i => i + 1)
          const x = Array.from(Array(12).keys()).map(i => i + 1)
          const z = y.map(xi => x.map(yi => {
            const date = new Date(year, yi - 1, xi)
            // We've moved into next month
            if (date.getMonth() !== yi - 1) {
              return null
            }
            const dateString = date.toDateString()
            const datum = this.data[year].find(d => new Date(d.date).toDateString() === dateString)
            return (datum && datum[this.aggregation]) ? datum[this.aggregation][this.climate] : null
          }))

          const data = [{
            x: x,
            y: y,
            z: z,
            type: 'heatmap',
            zauto: false,
            zmin: minZ,
            zmax: maxZ,
            colorbar: {
              tickfont: {
                color: 'white'
              }
            },
            colorscale: this.gradients[this.climate]
          }]

          const layout = {
            title: {
              text: `Year ${year}`,
              font: { color: 'white' }
            },
            margin: { l: 75, r: 35, t: 65, b: 75, autoexpand: true },
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
            legend: { orientation: 'h', font: { color: 'white' } },
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

          this.$plotly.newPlot(this.$refs[`heatmap-${year}`][0], data, layout, config)
        }
      })
    },
    getData: function (year) {
      if (this.data[year]) {
        this.update()
      } else {
        const start = year ? new Date(year, 0, 1) : new Date()
        const end = year ? new Date(year, 11, 31) : new Date()
        this.apiGetYearly(start, end)
          .then(result => {
            Vue.set(this.data, year, result)

            this.update()
          })
      }
    },
    onResize: function () {
      this.windowWidth = window.innerWidth
    }
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.onResize)
  },
  mounted: function () {
    window.addEventListener('resize', this.onResize)

    this.getYears()
      .then(result => {
        this.years = result
        this.yearsDisplay = (result && result.length > 0) ? result.map((y, i) => i === result.length - 1) : []

        if (result && result.length > 0) {
          this.getData(result[result.length - 1])
        }
      })
  }
}
</script>

<style>

</style>
