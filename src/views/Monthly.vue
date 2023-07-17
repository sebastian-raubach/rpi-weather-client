<template>
  <div id="monthly" class="mt-4" v-if="data">
    <b-row>
      <b-col cols=12 sm=6 md=4 class="mb-4" v-if="data.totalRain !== undefined && data.totalRain !== null">
        <b-card class="bg-total-rain">
          <b-row class="h-100">
            <b-col cols=10 class="d-flex flex-column justify-content-between">
              <b-card-title>Total rainfall</b-card-title>
              <b-card-text>
                <h4>{{ data.totalRain.toFixed(2) }} mm</h4>
              </b-card-text>
            </b-col>
            <b-col cols=2 class="d-flex justify-content-center align-items-center">
              <h1><BIconCloudRain /></h1>
            </b-col>
          </b-row>
        </b-card>
      </b-col>
      <b-col cols=12 sm=6 md=4 class="mb-4" v-if="data.mostRain && data.mostRain.value !== undefined && data.mostRain.value !== null">
        <b-card class="bg-rainiest-day">
          <b-row class="h-100">
            <b-col cols=10 class="d-flex flex-column justify-content-between">
              <b-card-title>Rainiest day</b-card-title>
              <div>
                <b-card-sub-title>{{ new Date(data.mostRain.date).toLocaleDateString('en-GB', { weekday: 'long' }) }}</b-card-sub-title>
                <b-card-sub-title>{{ new Date(data.mostRain.date).toLocaleDateString() }}</b-card-sub-title>
              </div>
              <b-card-text>
                <h4>{{ data.mostRain.value.toFixed(2) }} mm</h4>
              </b-card-text>
            </b-col>
            <b-col cols=2 class="d-flex justify-content-center align-items-center">
              <h1><BIconCloudRainHeavy /></h1>
            </b-col>
          </b-row>
        </b-card>
      </b-col>
      <b-col cols=12 sm=6 md=4 class="mb-4" v-if="data.mostWind && data.mostWind.value !== undefined && data.mostWind.value !== null">
        <b-card class="bg-windiest-day">
          <b-row class="h-100">
            <b-col cols=10 class="d-flex flex-column justify-content-between">
              <b-card-title>Windiest day</b-card-title>
              <div>
                <b-card-sub-title>{{ new Date(data.mostWind.date).toLocaleDateString('en-GB', { weekday: 'long' }) }}</b-card-sub-title>
                <b-card-sub-title>{{ new Date(data.mostWind.date).toLocaleDateString() }}</b-card-sub-title>
              </div>
              <b-card-text>
                <h4>{{ data.mostWind.value.toFixed(2) }} kph</h4>
              </b-card-text>
            </b-col>
            <b-col cols=2 class="d-flex justify-content-center align-items-center">
              <h1><BIconWind /></h1>
            </b-col>
          </b-row>
        </b-card>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols=12 sm=6 md=4 class="mb-4" v-if="data.lowestTemp && data.lowestTemp.value !== undefined && data.lowestTemp.value !== null">
        <b-card class="bg-temp-low">
          <b-row class="h-100">
            <b-col cols=10 class="d-flex flex-column justify-content-between">
              <b-card-title>Minimum temperature</b-card-title>
              <div>
                <b-card-sub-title>{{ new Date(data.lowestTemp.date).toLocaleDateString('en-GB', { weekday: 'long' }) }}</b-card-sub-title>
                <b-card-sub-title>{{ new Date(data.lowestTemp.date).toLocaleDateString() }}</b-card-sub-title>
              </div>
              <b-card-text><h4>{{ data.lowestTemp.value.toFixed(2) }} °C</h4></b-card-text>
            </b-col>
            <b-col cols=2 class="d-flex justify-content-center align-items-center">
              <h1><BIconThermometerLow /></h1>
            </b-col>
          </b-row>
        </b-card>
      </b-col>
      <b-col cols=12 sm=6 md=4 class="mb-4" v-if="data.avgTemp !== undefined && data.avgTemp !== null">
        <b-card class="bg-temp-avg">
          <b-row class="h-100">
            <b-col cols=10 class="d-flex flex-column justify-content-between">
              <b-card-title>Average temperature</b-card-title>
              <b-card-text>
                <h4>{{ data.avgTemp.toFixed(2) }} °C</h4>
              </b-card-text>
            </b-col>
            <b-col cols=2 class="d-flex justify-content-center align-items-center">
              <h1><BIconThermometerHalf /></h1>
            </b-col>
          </b-row>
        </b-card>
      </b-col>
      <b-col cols=12 sm=6 md=4 class="mb-4" v-if="data.highestTemp && data.highestTemp.value !== undefined && data.highestTemp.value !== null">
        <b-card class="bg-temp-high">
          <b-row class="h-100">
            <b-col cols=10 class="d-flex flex-column justify-content-between">
              <b-card-title>Maximum temperature</b-card-title>
              <div>
                <b-card-sub-title>{{ new Date(data.highestTemp.date).toLocaleDateString('en-GB', { weekday: 'long' }) }}</b-card-sub-title>
                <b-card-sub-title>{{ new Date(data.highestTemp.date).toLocaleDateString() }}</b-card-sub-title>
              </div>
              <b-card-text><h4>{{ data.highestTemp.value.toFixed(2) }} °C</h4></b-card-text>
            </b-col>
            <b-col cols=2 class="d-flex justify-content-center align-items-center">
              <h1><BIconThermometerHigh /></h1>
            </b-col>
          </b-row>
        </b-card>
      </b-col>
    </b-row>

    <b-row>
      <b-col cols=12 class="mb-4">
        <b-card class="h-100" title="Ambient temperature">
          <MultiYearLineChart :data="measurements" :trace="{ x: 'date', y: 'avgAmbientTemp', yStd: 'stdAmbientTemp' }" />
        </b-card>
      </b-col>
      <b-col cols=12 class="mb-4">
        <b-card class="h-100" title="Ground temperature">
          <MultiYearLineChart :data="measurements" :trace="{ x: 'date', y: 'avgGroundTemp', yStd: 'stdGroundTemp' }" />
        </b-card>
      </b-col>
      <b-col cols=12 class="mb-4">
        <b-card class="h-100" title="Pi temperature">
          <MultiYearLineChart :data="measurements" :trace="{ x: 'date', y: 'avgPiTemp', yStd: 'stdPiTemp' }" />
        </b-card>
      </b-col>
      <b-col cols=12 class="mb-4">
        <b-card class="h-100" title="Humidity">
          <MultiYearLineChart :data="measurements" :trace="{ x: 'date', y: 'avgHumidity', yStd: 'stdHumidity' }" />
        </b-card>
      </b-col>
      <b-col cols=12 class="mb-4">
        <b-card class="h-100" title="Wind speed">
          <MultiYearLineChart :data="measurements" :trace="{ x: 'date', y: 'avgWindSpeed', yStd: 'stdWindSpeed' }" />
        </b-card>
      </b-col>
      <b-col cols=12 class="mb-4">
        <b-card class="h-100" title="Pressure">
          <MultiYearLineChart :data="measurements" :trace="{ x: 'date', y: 'avgPressure', yStd: 'stdPressure' }" />
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import MultiYearLineChart from '@/components/chart/MultiYearLineChart'
import { BIconThermometerHigh, BIconThermometerLow, BIconThermometerHalf, BIconCloudRainHeavy, BIconCloudRain, BIconWind } from 'bootstrap-vue'

export default {
  components: {
    BIconThermometerHigh,
    BIconThermometerLow,
    BIconThermometerHalf,
    BIconCloudRainHeavy,
    BIconCloudRain,
    BIconWind,
    MultiYearLineChart
  },
  data: function () {
    return {
      data: null,
      measurements: null
    }
  },
  mounted: function () {
    this.apiGetMonthly()
      .then(result => {
        this.data = result
      })
    this.apiGetMonthlyMeasurements()
      .then(result => {
        this.measurements = result
      })
  }
}
</script>

<style>
#monthly .card {
  height: 175px;
}
#monthly .card h1,
#monthly .card h4 {
  margin-bottom: 0;
}
#monthly .card h6:first-child {
  margin: 0.5em 0;
}
#monthly .card h6:last-child {
  margin-bottom: 1em;
}
#monthly .card .card-title,
#monthly .card .card-subtitle {
  color: white !important;
}
#monthly .card h1 {
  color: #999;
  mix-blend-mode: color-dodge;
  font-size: 3rem;
}
</style>
<style scoped>
.bg-temp-high {
  background: rgb(238,90,36);
  background: linear-gradient(135deg, rgba(238,90,36,1) 0%, rgba(234,32,39,1) 60%);
}
.bg-temp-avg {
  background: rgb(247,159,31);
  background: linear-gradient(135deg, rgba(247,159,31,1) 0%, rgba(238,90,36,1) 60%);
}
.bg-temp-low {
  background: rgb(255,195,18);
  background: linear-gradient(135deg, rgba(255,195,18,1) 0%, rgba(247,159,31,1) 60%);
}
.bg-total-rain {
  background: rgb(18,203,196);
  background: linear-gradient(135deg, rgba(18,203,196,1) 0%, rgba(18,137,167,1) 60%);
}
.bg-rainiest-day {
  background: rgb(18,137,167);
  background: linear-gradient(135deg, rgba(18,137,167,1) 0%, rgba(6,82,221,1) 60%);
}
.bg-windiest-day {
  background: rgb(181,52,113);
  background: linear-gradient(135deg, rgba(181,52,113,1) 0%, rgba(131,52,113,1) 60%);
}
</style>
