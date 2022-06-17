<template>
  <div id="total" class="mt-4" v-if="data">
    <b-row>
      <b-col cols=12 md=4 class="mb-4">
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
      <b-col cols=12 md=4 class="mb-4" v-if="data.mostRain">
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
      <b-col cols=12 md=4 class="mb-4" v-if="data.mostWind">
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
      <b-col cols=12 md=4 class="mb-4" v-if="data.lowestTemp">
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
      <b-col cols=12 md=4 class="mb-4">
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
      <b-col cols=12 md=4 class="mb-4" v-if="data.highestTemp">
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
  </div>
</template>

<script>
import { BIconThermometerHigh, BIconThermometerLow, BIconThermometerHalf, BIconCloudRainHeavy, BIconCloudRain, BIconWind } from 'bootstrap-vue'

export default {
  components: {
    BIconThermometerHigh,
    BIconThermometerLow,
    BIconThermometerHalf,
    BIconCloudRainHeavy,
    BIconCloudRain,
    BIconWind
  },
  data: function () {
    return {
      data: 'en-GB'
    }
  },
  mounted: function () {
    this.apiGetTotal()
      .then(result => {
        this.data = result
      })
  }
}
</script>

<style>
#total .card {
  height: 175px;
}
#total .card h1,
#total .card h4 {
  margin-bottom: 0;
}
#total .card h6:first-child {
  margin: 0.5em 0;
}
#total .card h6:last-child {
  margin-bottom: 1em;
}
#total .card .card-title,
#total .card .card-subtitle {
  color: white !important;
}
#total .card h1 {
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
