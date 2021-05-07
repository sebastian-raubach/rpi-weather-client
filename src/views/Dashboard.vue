<template>
  <div v-if="dataFile && dataFile.length > 0">
    <b-row v-for="(variable, index) in variables" :key="`variable-${index}`" class="my-4">
      <b-col cols=12 sm=10>
        <b-card>
          <LineChart :data="dataFile" x="created" :y="variable.y" />
        </b-card>
      </b-col>
      <b-col cols=12 sm=2 class="h-100">
        <b-card no-body class="text-center h-100">
          <b-card-header>
            <h1><component :is="variable.icon" /></h1>
          </b-card-header>
          <b-card-body class="h-100">
            <h3>{{ dataFile[dataFile.length - 1][variable.y] }}</h3>
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import LineChart from '@/components/chart/LineChart'

import { BIconThermometer, BIconDropletFill, BIconGeoFill } from 'bootstrap-vue'

export default {
  name: 'Dashboard',
  components: {
    BIconDropletFill,
    BIconGeoFill,
    BIconThermometer,
    LineChart
  },
  data: function () {
    return {
      chartData: null,
      now: null,
      minusTF: null,
      dataFile: null,
      variables: [{
        y: 'ambient_temp',
        icon: BIconThermometer
      }, {
        y: 'ground_temp',
        icon: BIconGeoFill
      }, {
        y: 'rainfall',
        icon: BIconDropletFill
      }, {
        y: 'humidity',
        icon: BIconDropletFill
      }, {
        y: 'wind_speed',
        icon: BIconDropletFill
      }, {
        y: 'wind_gust',
        icon: BIconDropletFill
      }, {
        y: 'pi_temp',
        icon: BIconDropletFill
      }]
    }
  },
  watch: {
    dataFile: function () {
      this.updateChart()
    }
  },
  methods: {
    updateChart: function () {
      console.log(this.dataFile)
    },
    getData: function () {
      this.apiGetData(this.toISOTimestamp(this.minusTF), this.toISOTimestamp(this.now))
        .then(result => {
          this.dataFile = result
        })
    }
  },
  mounted: function () {
    this.now = new Date()
    this.minusTF = new Date(this.now.getTime() - (24 * 60 * 60 * 1000))
    this.getData()
  }
}
</script>
