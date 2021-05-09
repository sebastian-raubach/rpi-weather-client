<template>
  <div class="mt-4">
    <b-form-datepicker v-model="startDate" />
    <b-form-datepicker v-model="endDate" />
    <b-button variant="primary" @click="getData">Update</b-button>

    <div v-if="dataFile && dataFile.length > 0">
      <b-row v-for="(variable, index) in variables" :key="`variable-${index}`" class="my-4">
        <b-col cols=12 md=8 lg=10>
          <b-card>
            <LineChart :data="dataFile" :traces="variable.traces" :sunriseSunset="sunriseSunsetArray" xTitle="Time" :yTitle="variable.yTitle" />
          </b-card>
        </b-col>
        <b-col cols=12 md=4 lg=2 class="h-100 order-first order-md-last">
          <b-row>
            <b-col cols=6 md=12 v-for="(trace, tIndex) in variable.traces" :key="`card-${index}-${tIndex}`" class="mb-4">
              <b-card no-body class="text-center h-100">
                <b-card-header>
                  <h1 :style="{ color: trace.color }"><i :class="trace.icon" /></h1>
                </b-card-header>
                <b-card-body class="h-100">
                  <h3>{{ dataFile[dataFile.length - 1][trace.y] }}</h3>
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
        yTitle: 'Temperature'
      }, {
        traces: [{ x: 'created', y: 'windSpeed', icon: 'bi-wind', color: '#B53471', mode: 'smooth' }, { x: 'created', y: 'windGust', icon: 'bi-tornado', color: '#833471', mode: 'smooth' }],
        yTitle: 'Wind'
      }, {
        traces: [{ x: 'created', y: 'rainfall', icon: 'bi-cloud-rain', color: '#1289A7', mode: 'cumulative' }],
        yTitle: 'Rainfall'
      }, {
        traces: [{ x: 'created', y: 'humidity', icon: 'bi-water', color: '#0652DD', mode: 'smooth' }],
        yTitle: 'Humidity'
      }, {
        traces: [{ x: 'created', y: 'pressure', icon: 'bi-speedometer', color: '#12CBC4', mode: 'smooth' }],
        yTitle: 'Pressure'
      }, {
        traces: [{ x: 'created', y: 'piTemp', icon: 'bi-cpu', color: '#EA2027', mode: 'smooth' }],
        yTitle: 'Pi Temperature'
      }]
    }
  },
  computed: {
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
