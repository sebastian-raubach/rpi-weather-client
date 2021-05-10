<template>
  <div class="mt-4">
    <b-form-datepicker v-model="startDate" />
    <b-form-datepicker v-model="endDate" />
    <b-button variant="primary" @click="getData">Update</b-button>

    <div v-if="dataFile && dataFile.length > 0">
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
                  <h3>{{ aggregatedValues[index][tIndex].toFixed(2) }}</h3>
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

const SunCalc = require('suncalc')

export default {
  name: 'Dashboard',
  components: {
    LineChart
  },
  data: function () {
    return {
      chartData: null,
      endDate: null,
      startDate: null,
      dataFile: null,
      variables: [{
        traces: [{ x: 'created', y: 'ambientTemp', icon: 'bi-thermometer-half', color: '#A3CB38', mode: 'smooth' }, { x: 'created', y: 'groundTemp', icon: 'bi-thermometer-low', color: '#009432', mode: 'smooth' }],
        yTitle: 'Temperature [°C]'
      }, {
        traces: [{ x: 'created', y: 'windSpeed', icon: 'bi-wind', color: '#B53471', mode: 'smooth' }, { x: 'created', y: 'windGust', icon: 'bi-tornado', color: '#833471', mode: 'smooth' }],
        yTitle: 'Wind [kph]'
      }, {
        traces: [{ x: 'created', y: 'rainfall', icon: 'bi-cloud-rain', color: '#1289A7', mode: 'cumulative' }],
        yTitle: 'Rainfall [mm]'
      }, {
        traces: [{ x: 'created', y: 'humidity', icon: 'bi-water', color: '#0652DD', mode: 'smooth' }],
        yTitle: 'Humidity [%]',
        yRange: [0, 100]
      }, {
        traces: [{ x: 'created', y: 'pressure', icon: 'bi-speedometer', color: '#12CBC4', mode: 'smooth' }],
        yTitle: 'Pressure [hpa]'
      }, {
        traces: [{ x: 'created', y: 'piTemp', icon: 'bi-cpu', color: '#EA2027', mode: 'smooth' }],
        yTitle: 'Pi Temperature [°C]'
      }]
    }
  },
  computed: {
    aggregatedValues: function () {
      if (!this.dataFile) {
        return null
      }

      return this.variables.map(v => {
        return v.traces.map(t => {
          if (t.mode === 'cumulative') {
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
    }
  },
  mounted: function () {
    this.endDate = new Date()
    this.startDate = new Date(this.endDate.getTime() - (24 * 60 * 60 * 1000))
    this.getData()
  }
}
</script>
