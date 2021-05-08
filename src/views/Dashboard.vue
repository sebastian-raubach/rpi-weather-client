<template>
  <div>
    <b-form-datepicker v-model="startDate" />
    <b-form-datepicker v-model="endDate" />
    <b-button variant="primary" @click="getData">Update</b-button>

    <div v-if="dataFile && dataFile.length > 0">
      <b-row v-for="(variable, index) in variables" :key="`variable-${index}`" class="my-4">
        <b-col cols=12 md=8 lg=10>
          <b-card>
            <LineChart :data="dataFile" :traces="variable.traces" xTitle="Time" :yTitle="variable.yTitle" />
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

export default {
  name: 'Dashboard',
  components: {
    LineChart
  },
  data: function () {
    return {
      chartData: null,
      endDate: null,
      endTime: null,
      startDate: null,
      startTime: null,
      dataFile: null,
      variables: [{
        traces: [{ x: 'created', y: 'ambient_temp', icon: 'bi-thermometer-half', color: '#A3CB38', mode: 'smooth' }, { x: 'created', y: 'ground_temp', icon: 'bi-thermometer-low', color: '#009432', mode: 'smooth' }],
        yTitle: 'Temperature'
      }, {
        traces: [{ x: 'created', y: 'wind_speed', icon: 'bi-wind', color: '#B53471', mode: 'smooth' }, { x: 'created', y: 'wind_gust', icon: 'bi-tornado', color: '#833471', mode: 'smooth' }],
        yTitle: 'Wind'
      }, {
        traces: [{ x: 'created', y: 'rainfall', icon: 'bi-cloud-rain', color: '#1289A7', mode: 'cumulative' }, { x: 'created', y: 'humidity', icon: 'bi-water', color: '#0652DD', mode: 'smooth' }],
        yTitle: 'Rainfall/Humidity'
      }]
    }
  },
  methods: {
    getData: function () {
      let startDateTime = new Date(this.startDate)
      let endDateTime = new Date(this.endDate)

      const sTime = this.startTime.split(':')
      const eTime = this.endTime.split(':')

      startDateTime = new Date(startDateTime.getTime() + parseInt(sTime[2]) * 1000)
      startDateTime = new Date(startDateTime.getTime() + parseInt(sTime[1]) * 60 * 1000)
      startDateTime = new Date(startDateTime.getTime() + parseInt(sTime[0]) * 60 * 60 * 1000)

      endDateTime = new Date(endDateTime.getTime() + parseInt(eTime[2]) * 1000)
      endDateTime = new Date(endDateTime.getTime() + parseInt(eTime[1]) * 60 * 1000)
      endDateTime = new Date(endDateTime.getTime() + parseInt(eTime[0]) * 60 * 60 * 1000)

      this.apiGetData(startDateTime, endDateTime)
        .then(result => {
          this.dataFile = result
        })
    }
  },
  mounted: function () {
    this.endDate = new Date()
    this.startDate = new Date(this.endDate.getTime() - (24 * 60 * 60 * 1000))
    this.endTime = this.endDate.toTimeString().split(' ')[0]
    this.startTime = this.startDate.toTimeString().split(' ')[0]
    this.getData()
  }
}
</script>
