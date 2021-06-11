<template>
  <div class="mt-4">
    <h1 v-if="moonPhase" class="mb-3">{{ new Date().toLocaleDateString() }}</h1>

    <b-row>
      <b-col cols=12 sm=4 class="mb-4">
        <b-card no-body class="text-center h-100">
          <b-card-header>
            <h1 class="moon"><i :class="moonPhase.icon" /></h1>
          </b-card-header>
          <b-card-body class="h-100">
            <h3>{{ moonPhase.name }}</h3>
          </b-card-body>
        </b-card>
      </b-col>
      <b-col cols=12 sm=4 class="mb-4">
        <b-card no-body class="text-center h-100 position-relative">
          <b-card-header>
            <h1 class="sunrise"><i class="bi-sunrise" /></h1>
          </b-card-header>
          <b-card-body class="h-100">
            <h3>{{ sunriseSunsetArray[sunriseSunsetArray.length - 1].sunrise.toLocaleTimeString() }}</h3>
          </b-card-body>
          <div class="pt-3 px-3 chart-container position-absolute">
            <canvas ref="sunriseCanvas" height="100"/>
          </div>
        </b-card>
      </b-col>
      <b-col cols=12 sm=4 class="mb-4">
        <b-card no-body class="text-center h-100">
          <b-card-header>
            <h1 class="sunset"><i class="bi-sunset" /></h1>
          </b-card-header>
          <b-card-body class="h-100">
            <h3>{{ sunriseSunsetArray[sunriseSunsetArray.length - 1].sunset.toLocaleTimeString() }}</h3>
          </b-card-body>
          <div class="pt-3 px-3 chart-container position-absolute">
            <canvas ref="sunsetCanvas" height="100"/>
          </div>
        </b-card>
      </b-col>
    </b-row>

    <b-form @submit.prevent="getData">
      <b-form-datepicker v-model="startDate" />
      <b-form-datepicker v-model="endDate" />
      <b-button type="submit" variant="primary">Update</b-button>
    </b-form>

    <div v-if="dataFile && dataFile.length > 0">
      <h2 class="my-3">Last measurement: {{ lastMeasurementDateTime }}</h2>

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

      <WindRose :data="dataFile" windType="windSpeed" />

      <WindRose :data="dataFile" windType="windGust" />
    </div>
  </div>
</template>

<script>
import LineChart from '@/components/chart/LineChart'
import WindRose from '@/components/chart/WindRose'

import Chart from 'chart.js'

const SunCalc = require('suncalc')

export default {
  name: 'Dashboard',
  components: {
    LineChart,
    WindRose
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
      moonPhases: [
        { name: 'New Moon', icon: 'bi-circle' },
        { name: 'Waxing Crescent', icon: 'bi-circle' },
        { name: 'First Quarter', icon: 'bi-circle-half icon-flipped' },
        { name: 'Waxing Gibbous', icon: 'bi-circle-half icon-flipped' },
        { name: 'Full Moon', icon: 'bi-circle-fill' },
        { name: 'Waning Gibbous', icon: 'bi-circle-fill' },
        { name: 'Last Quarter', icon: 'bi-circle-half' },
        { name: 'Waning Crescent', icon: 'bi-circle-half' }
      ]
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
    sunrisesSunsets: function () {
      const result = []

      const today = new Date()
      for (let i = 7; i >= 1; i--) {
        const d = new Date()
        d.setDate(today.getDate() - i)
        result.push(d)
      }
      result.push(today)
      for (let i = 1; i <= 7; i++) {
        const d = new Date()
        d.setDate(today.getDate() + i)
        result.push(d)
      }

      return result.map(d => {
        const sunDates = SunCalc.getTimes(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0, 0), 56.498942, -3.018231)

        return {
          sunrise: sunDates.sunrise,
          sunset: sunDates.sunset
        }
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
  watch: {
    dataFile: function () {
      this.updateSunriseSunset()
    }
  },
  methods: {
    updateSunriseSunset: function () {
      let minSunrise = Number.MAX_VALUE
      let minSunset = Number.MAX_VALUE

      const today = new Date()
      let mapped = this.sunrisesSunsets.map(d => {
        const fixedDaySunrise = new Date(today.getFullYear(), today.getMonth(), today.getDate(), d.sunrise.getHours(), d.sunrise.getMinutes(), d.sunrise.getSeconds(), 0)
        const timeSunrise = fixedDaySunrise.getTime()
        if (timeSunrise < minSunrise) {
          minSunrise = timeSunrise
        }

        const fixedDaySunset = new Date(today.getFullYear(), today.getMonth(), today.getDate(), d.sunset.getHours(), d.sunset.getMinutes(), d.sunset.getSeconds(), 0)
        const timeSunset = fixedDaySunset.getTime()
        if (timeSunset < minSunset) {
          minSunset = timeSunset
        }

        return {
          sunrise: timeSunrise,
          sunriseText: fixedDaySunrise.toLocaleTimeString(),
          sunset: timeSunset,
          sunsetText: fixedDaySunset.toLocaleTimeString()
        }
      })

      mapped = mapped.map(d => {
        return {
          sunrise: Math.round((d.sunrise - minSunrise) / 1000.0 / 60.0) + 5,
          sunriseText: d.sunriseText,
          sunset: Math.round((d.sunset - minSunset) / 1000.0 / 60.0) + 5,
          sunsetText: d.sunsetText
        }
      })

      /* eslint-disable no-new */
      new Chart(this.$refs.sunriseCanvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: this.sunrisesSunsets.map(s => s.sunrise.toLocaleDateString()),
          datasets: [{
            backgroundColor: mapped.map((d, i) => i === 7 ? 'rgba(247,159,31,.5)' : 'rgba(255,255,255,.3)'),
            borderColor: 'rgba(255,255,255,0.3)',
            hoverBackgroundColor: 'rgba(255,255,255,0.3)',
            hoverBorderColor: 'rgba(255,255,255,0.3)',
            data: mapped.map(d => d.sunrise)
          }]
        },
        options: {
          tooltips: {
            callbacks: {
              label: tooltipItem => mapped[tooltipItem.index].sunriseText
            }
          },
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: false
          },
          scales: {
            yAxes: [{
              display: false,
              ticks: {
                suggestedMin: 0,
                beginAtZero: true,
                suggestedMax: this.maxValue
              }
            }],
            xAxes: [{
              display: false
            }]
          }
        }
      })
      /* eslint-disable no-new */
      new Chart(this.$refs.sunsetCanvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: this.sunrisesSunsets.map(s => s.sunset.toLocaleDateString()),
          datasets: [{
            backgroundColor: mapped.map((d, i) => i === 7 ? 'rgba(153,128,250,.5)' : 'rgba(255,255,255,.3)'),
            borderColor: 'rgba(255,255,255,0.3)',
            hoverBackgroundColor: 'rgba(255,255,255,0.3)',
            hoverBorderColor: 'rgba(255,255,255,0.3)',
            data: mapped.map(d => d.sunset)
          }]
        },
        options: {
          tooltips: {
            callbacks: {
              label: tooltipItem => mapped[tooltipItem.index].sunsetText
            }
          },
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: false
          },
          scales: {
            yAxes: [{
              display: false,
              ticks: {
                suggestedMin: 0,
                beginAtZero: true,
                suggestedMax: this.maxValue
              }
            }],
            xAxes: [{
              display: false
            }]
          }
        }
      })
    },
    getData: function () {
      this.apiGetData(this.start, this.end)
        .then(result => {
          this.dataFile = result
        })
    },
    getMoonPhase: function () {
      const today = new Date()
      const day = today.getDate()
      let month = today.getMonth() + 1
      let year = today.getFullYear()

      if (month < 3) {
        year--
        month += 12
      }

      ++month

      const c = 365.25 * year
      const e = 30.6 * month
      // jd is total days elapsed
      let jd = c + e + day - 694039.09
      // divide by the moon cycle
      jd /= 29.5305882
      // jd is total days elapsed
      let b = parseInt(jd)
      // subtract integer part to leave fractional part of original jd
      jd -= b
      // scale fraction from 0-8 and round
      b = Math.round(jd * 8)

      // 0 and 8 are the same so turn 8 into 0
      if (b >= 8) {
        b = 0
      }

      this.moonPhase = this.moonPhases[b]
      // const moon = SunCalc.getMoonIllumination(new Date())
      // this.moonPhase = this.moonPhases.getValue(moon.phase)
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

.moon i {
  color: #FFC312;
}
.sunrise i {
  color: #F79F1F;
}
.sunset i {
  color: #9980FA;
}

.chart-container {
  bottom: 0;
  width: 100%;
  height: 100px;
}
</style>
