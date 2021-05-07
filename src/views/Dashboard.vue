<template>
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
      now: null,
      minusTF: null,
      dataFile: null,
      variables: [{
        traces: [{ x: 'created', y: 'ambient_temp', icon: 'bi-thermometer-half', color: '#A3CB38' }, { x: 'created', y: 'ground_temp', icon: 'bi-thermometer-low', color: '#009432' }],
        yTitle: 'Temperature'
      }, {
        traces: [{ x: 'created', y: 'wind_speed', icon: 'bi-wind', color: '#B53471' }, { x: 'created', y: 'wind_gust', icon: 'bi-tornado', color: '#833471' }],
        yTitle: 'Wind'
      }, {
        traces: [{ x: 'created', y: 'rainfall', icon: 'bi-cloud-rain', color: '#1289A7' }, { x: 'created', y: 'humidity', icon: 'bi-water', color: '#0652DD' }],
        yTitle: 'Rainfall/Humidity'
      }]
    }
  },
  methods: {
    getData: function () {
      this.apiGetData(this.minusTF, this.now)
        .then(result => {
          this.dataFile = result
        })
    }
  },
  mounted: function () {
    this.now = new Date()
    this.minusTF = new Date(this.now.getTime() - 2 * (24 * 60 * 60 * 1000))
    this.getData()
  }
}
</script>
