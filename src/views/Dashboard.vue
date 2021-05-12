<template>
  <div class="mt-4">
    <h1 v-if="moonPhase" class="mb-3">{{ new Date().toLocaleDateString() }} - {{ moonPhase.name }} <i :class="moonPhase.icon" /></h1>
    <b-form @submit.prevent="getData">
      <b-form-datepicker v-model="startDate" />
      <b-form-datepicker v-model="endDate" />
      <b-button type="submit" variant="primary">Update</b-button>
    </b-form>

    <div v-if="dataFile && dataFile.length > 0">
      <h2 class="my-3">Last measurement: {{ lastMeasurementDateTime }}</h2>

      <div ref="windChart" />

      <b-row v-for="(variable, index) in variables" :key="`variable-${index}`" class="my-4">
        <b-col cols=12 lg=10>
          <b-card>
            <LineChart :data="dataFile" :traces="variable.traces" :yRange="variable.yRange" :sunriseSunset="sunriseSunsetArray" xTitle="Time" :yTitle="variable.yTitle" />
          </b-card>
        </b-col>
        <b-col cols=12 lg=2 class="h-100 order-first order-lg-last">
          <b-row>
            <b-col cols=6 lg=12 v-for="(trace, tIndex) in variable.traces" :key="`card-${index}-${tIndex}`" class="mb-4">
              <b-card no-body class="text-center h-100">
                <b-card-header>
                  <h1 :style="{ color: trace.color }"><i :class="trace.icon" /></h1>
                </b-card-header>
                <b-card-body class="h-100">
                  <h3 v-if="aggregatedValues[index][tIndex] !== undefined">{{ aggregatedValues[index][tIndex].toFixed(2) }}</h3>
                </b-card-body>
              </b-card>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import LineChart from '@/components/chart/LineChart'

import RangeMap from '@/plugin/rangemap'

const SunCalc = require('suncalc')

export default {
  name: 'Dashboard',
  components: {
    LineChart
  },
  data: function () {
    return {
      moonPhase: null,
      chartData: null,
      endDate: null,
      startDate: null,
      dataFile: null,
      variables: [{
        traces: [{ x: 'created', y: 'ambientTemp', icon: 'bi-thermometer-half', color: '#A3CB38', aggregation: 'smooth' }, { x: 'created', y: 'groundTemp', icon: 'bi-thermometer-low', color: '#009432', aggregation: 'smooth' }],
        yTitle: 'Temperature [°C]'
      }, {
        traces: [{ x: 'created', y: 'windSpeed', icon: 'bi-wind', color: '#B53471', aggregation: 'smooth' }, { x: 'created', y: 'windGust', icon: 'bi-tornado', color: '#833471', mode: 'markers', aggregation: 'smooth' }],
        yTitle: 'Wind [kph]'
      }, {
        traces: [{ x: 'created', y: 'rainfall', icon: 'bi-cloud-rain', color: '#1289A7', aggregation: 'cumulative' }],
        yTitle: 'Rainfall [mm]'
      }, {
        traces: [{ x: 'created', y: 'humidity', icon: 'bi-water', color: '#0652DD', aggregation: 'smooth' }],
        yTitle: 'Humidity [%]',
        yRange: [0, 100]
      }, {
        traces: [{ x: 'created', y: 'pressure', icon: 'bi-speedometer', color: '#12CBC4', aggregation: 'smooth' }],
        yTitle: 'Pressure [hpa]'
      }, {
        traces: [{ x: 'created', y: 'piTemp', icon: 'bi-cpu', color: '#EA2027', aggregation: 'smooth' }],
        yTitle: 'Pi Temperature [°C]'
      }],
      moonPhases: new RangeMap([
        { min: 0, max: 0.125, value: { name: 'New Moon', icon: 'bi-circle' } },
        { min: 0.125, max: 0.250, value: { name: 'Waxing Crescent', icon: 'bi-circle' } },
        { min: 0.250, max: 0.375, value: { name: 'First Quarter', icon: 'bi-circle-half' } },
        { min: 0.375, max: 0.500, value: { name: 'Waxing Gibbous', icon: 'bi-circle-half' } },
        { min: 0.500, max: 0.625, value: { name: 'Full Moon', icon: 'bi-circle-fill' } },
        { min: 0.625, max: 0.750, value: { name: 'Waning Gibbous', icon: 'bi-circle-fill' } },
        { min: 0.750, max: 0.875, value: { name: 'Last Quarter', icon: 'bi-circle-half icon-flipped' } },
        { min: 0.875, max: 1.000, value: { name: 'Waning Crescent', icon: 'bi-circle-half icon-flipped' } }
      ]),
      wd: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
      windDirections: new RangeMap([
        { min: 337.5, max: 22.5, value: 'N', mode: 'invert' },
        { min: 22.5, max: 67.5, value: 'NE' },
        { min: 67.5, max: 112.5, value: 'E' },
        { min: 112.5, max: 157.5, value: 'SE' },
        { min: 157.5, max: 202.5, value: 'S' },
        { min: 202.5, max: 247.5, value: 'SW' },
        { min: 247.5, max: 292.5, value: 'W' },
        { min: 292.5, max: 337.5, value: 'NW' }
      ]),
      windCategories: new RangeMap([
        { min: 0, max: 1, value: { name: 'Calm', color: '#E3F2FD' } },
        { min: 1, max: 6, value: { name: 'Light Air', color: '#BBDEFB' } },
        { min: 6, max: 12, value: { name: 'Light Breeze', color: '#90CAF9' } },
        { min: 12, max: 20, value: { name: 'Gentle Breeze', color: '#64B5F6' } },
        { min: 20, max: 30, value: { name: 'Moderate Breeze', color: '#42A5F5' } },
        { min: 30, max: 40, value: { name: 'Fresh Breeze', color: '#2196F3' } },
        { min: 40, max: 50, value: { name: 'Strong Breeze', color: '#1E88E5' } },
        { min: 50, max: 62, value: { name: 'Near Gale', color: '#1976D2' } },
        { min: 62, max: 75, value: { name: 'Gale', color: '#1565C0' } },
        { min: 75, max: 89, value: { name: 'Strong Gale', color: '#0D47A1' } },
        { min: 89, max: 103, value: { name: 'Storm', color: '#D32F2F' } },
        { min: 103, max: 118, value: { name: 'Violent Storm', color: '#C62828' } },
        { min: 118, max: Number.MAX_SAFE_INTEGER, value: { name: 'Hurricane', color: '#B71C1C' } }
      ])
    }
  },
  watch: {
    dataFile: function () {
      this.$nextTick(() => {
        this.updateWind()
      })
    }
  },
  computed: {
    lastMeasurementDateTime: function () {
      if (!this.dataFile || this.dataFile.length < 1) {
        return null
      }

      const date = new Date(this.dataFile[this.dataFile.length - 1].created)

      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
    },
    aggregatedValues: function () {
      if (!this.dataFile) {
        return null
      }

      return this.variables.map(v => {
        return v.traces.map(t => {
          if (t.aggregation === 'cumulative') {
            return this.dataFile.map(df => df[t.y]).filter(dp => dp !== undefined && dp !== null).reduce((a, b) => a + b, 0)
          } else {
            return this.dataFile[this.dataFile.length - 1][t.y]
          }
        })
      })
    },
    sunriseSunsetArray: function () {
      const result = []

      if (this.start && this.end) {
        const current = new Date(this.start)

        while (current < this.end) {
          const sunDates = SunCalc.getTimes(new Date(current.getFullYear(), current.getMonth(), current.getDate(), 12, 0, 0, 0, 0), 56.498942, -3.018231)
          result.push(sunDates)
          current.setDate(current.getDate() + 1)
        }
      }

      return result
    },
    start: function () {
      if (this.startDate) {
        return new Date(`${this.toFormattedDate(this.startDate)} 00:00:01`)
      } else {
        return null
      }
    },
    end: function () {
      if (this.endDate) {
        return new Date(`${this.toFormattedDate(this.endDate)} 23:59:59`)
      } else {
        return null
      }
    }
  },
  methods: {
    getData: function () {
      this.apiGetData(this.start, this.end)
        .then(result => {
          this.dataFile = result
        })
    },
    getMoonPhase: function () {
      const moon = SunCalc.getMoonIllumination(new Date())

      this.moonPhase = this.moonPhases.getValue(moon.phase)
    },
    updateWind: function () {
      const div = this.$refs.windChart

      if (div) {
        this.$plotly.purge(div)
      }

      if (this.dataFile && this.dataFile.length > 0) {
        const counts = this.windCategories.ranges.map(r => { return { name: r.value.name, color: r.value.color, counts: this.wd.map(_ => 0) } })

        this.dataFile.filter(d => d.windAverage !== undefined && d.windAverage !== null && d.windSpeed !== undefined && d.windSpeed !== null)
          .forEach(d => {
            const speed = d.windSpeed
            const direction = d.windAverage

            const speedCategory = this.windCategories.getValue(speed).name
            const directionCategory = this.windDirections.getValue(direction)

            const counter = counts.find(c => c.name === speedCategory)

            if (counter) {
              counter.counts[this.wd.indexOf(directionCategory)]++
            }
          })

        const data = counts.map(c => {
          return {
            r: c.counts,
            theta: this.wd,
            name: c.name,
            marker: {
              color: c.color
            },
            type: 'barpolar'
          }
        })

        const layout = {
          margin: { autoexpand: true },
          dragmode: false,
          autosize: true,
          paper_bgcolor: '#4e5d6c',
          plot_bgcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
          legend: { font: { color: 'white' } },
          polar: {
            bgcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
            radialaxis: {
              gridcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
              tickfont: { color: 'white' }
            },
            angularaxis: {
              direction: 'clockwise',
              tickfont: { color: 'white' }
            }
          },
          font: { size: 16 },
          orientation: 270
        }

        const config = {
          displayModeBar: false,
          responsive: true,
          displaylogo: false
        }

        this.$plotly.newPlot(div, data, layout, config)

        div.on('plotly_hover', data => {
          const label = data.points['0'].fullData.marker
          label.color = '#000000'
        })
      }
    }
  },
  mounted: function () {
    this.endDate = new Date()
    this.startDate = new Date(this.endDate.getTime() - (24 * 60 * 60 * 1000))
    this.getData()
    this.getMoonPhase()
  }
}
</script>

<style scoped>
.icon-flipped {
  transform: scaleX(-1);
  -moz-transform: scaleX(-1);
  -webkit-transform: scaleX(-1);
  -ms-transform: scaleX(-1);
}
</style>
