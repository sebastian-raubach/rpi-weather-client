<template>
  <div class="mt-4">
    <b-row>
      <b-col cols=12 sm=6 md=4 xl=3 class="mb-4" v-if="sunriseSunsetArray && sunriseSunsetArray[sunriseSunsetArray.length - 1]">
        <b-card no-body class="text-center h-100 position-relative">
          <b-card-header class="d-flex align-items-center justify-content-center">
            <h1 class="sunrise mr-2"><BIconSunrise /></h1><h1 class="sunset"><BIconSunset /></h1>
          </b-card-header>
          <b-card-body class="h-100">
            <h3>{{ sunriseSunsetArray[sunriseSunsetArray.length - 1].sunrise.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' }) }} - {{ sunriseSunsetArray[sunriseSunsetArray.length - 1].sunset.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' }) }}</h3>

            <b-progress height="2px" style="margin-bottom: 1px;" :max="1440" v-for="(sr, index) in srProgress" :key="`sr-ss-${index}`" v-b-tooltip.hover="sr.tooltip" >
              <b-progress-bar :value="sr.values[0]" class="bg-sunset"></b-progress-bar>
              <b-progress-bar :value="sr.values[1]" class="bg-sunrise"></b-progress-bar>
              <b-progress-bar :value="sr.values[2]" class="bg-sunset"></b-progress-bar>
            </b-progress>
          </b-card-body>
        </b-card>
      </b-col>
      <b-col cols=12 sm=6 md=4 xl=3 class="mb-4" v-if="moonPhase">
        <b-card no-body class="text-center h-100">
          <b-card-header>
            <h1 class="moon"><i :class="moonPhase.icon" /></h1>
          </b-card-header>
          <b-card-body class="h-100">
            <h3>{{ moonPhase.name }}</h3>
          </b-card-body>
        </b-card>
      </b-col>
      <b-col cols=12 sm=6 md=4 xl=3 class="mb-4">
        <b-form @submit.prevent="getData">
          <b-form-datepicker v-model="startDate" />
          <b-form-datepicker v-model="endDate" />
          <b-button type="submit" variant="primary">Update</b-button>
        </b-form>
      </b-col>
    </b-row>

    <div v-if="(dataFile && dataFile.length > 0) || (forecast && forecast.length > 0)">
      <b-row>
        <b-col cols=12 sm=6 md=4 xl=3 v-for="(variable, index) in variables" :key="`variable-${index}`" class="mb-4">
          <b-card :class="`variable-card ${variable.visible ? 'active' : null}`" no-body>
            <div class="bg" :style="{ backgroundImage: `url(${variable.bgImage})` }" />
            <b-card-body class="position-relative d-flex flex-column align-items-center justify-content-center">
              <div>
                <div class="icon">
                  <h1 :style="{ color: variable.traces[0].color }"><component :is="variable.traces[0].icon" /></h1>
                </div>
                <div class="value" v-if="aggregatedValues && aggregatedValues.length >= index && aggregatedValues[index] && aggregatedValues[index][0] !== undefined">
                  <h2>{{ aggregatedValues[index][0].toFixed(2) }}</h2>
                </div>
                <div class="minmax" v-if="minMax && minMax.length >= index && minMax[index] && minMax[index][0] !== undefined">
                  <h6 class="text-light"><BIconArrowDown /> {{ minMax[index][0].min }} <BIconArrowUp /> {{ minMax[index][0].max }}</h6>
                </div>
                <trend
                  :data="trendData[index]"
                  :gradient="['white', variable.traces[0].color]"
                  gradientDirection="bottom"
                  :stroke-width="3"
                  stroke-linecap="round"
                  auto-draw
                  smooth
                  v-if="trendData" />
                <a href="#" class="stretched-link" @click.prevent="onVariableClicked(index)" />
              </div>
            </b-card-body>
            <h4 class="heading">{{ variable.yTitle }}</h4>
          </b-card>
        </b-col>
      </b-row>

      <template v-for="(variable, index) in variables">
        <b-row :key="`variable-${index}`" class="mb-4" v-if="variable.visible">
          <b-col cols=12 lg=10>
            <b-card>
              <LineChart :id="variable.id" :data="dataFile" :xRange="dataDateRange" :forecast="forecast" :traces="variable.traces" :yRange="variable.yRange" :yToZero="variable.yToZero" :shapes="variable.shapes" :sunriseSunset="sunriseSunsetArray" xTitle="Time" :yTitle="variable.yTitle" @rainfall-range-selected="setRainfallRange" />
            </b-card>
          </b-col>
          <b-col cols=12 lg=2 class="h-100 order-first order-lg-last">
            <b-row>
              <template v-for="(trace, tIndex) in variable.traces">
                <b-col cols=6 lg=12  :key="`card-${index}-${tIndex}`" class="mb-4" v-if="!trace.isForecast && !trace.hiddenFromLegend">
                  <b-card no-body class="text-center h-100">
                    <b-card-header>
                      <h1 :style="{ color: trace.color }"><component :is="trace.icon" /></h1>
                    </b-card-header>
                    <b-card-body class="h-100">
                      <h3 v-if="aggregatedValues && aggregatedValues.length >= index && aggregatedValues[index][tIndex] !== undefined">{{ aggregatedValues[index][tIndex].toFixed(2) }}</h3>
                    </b-card-body>
                  </b-card>
                </b-col>
              </template>
            </b-row>

            <b-button v-if="variable.id === 'rainfall'" :disabled="!rainfallRange" @click="$refs.adminUuidModal.show()"><BIconTrash /> Delete rainfall for selected time</b-button>
          </b-col>
        </b-row>
      </template>

      <b-row class="mb-4" v-if="variables[6].visible">
        <b-col cols=12 lg=10>
          <b-row>
            <b-col cols=12 lg=6>
              <WindRose :data="dataFile" windType="windSpeed" @current-wind-direction="setWindDirection" />
            </b-col>
            <b-col cols=12 lg=6>
              <WindRose :data="dataFile" windType="windGust" @current-wind-direction="setWindDirection" />
            </b-col>
          </b-row>
        </b-col>
        <b-col cols=12 lg=2 class="h-100 order-first order-lg-last">
          <b-card no-body class="text-center h-100 mb-4">
            <b-card-header>
              <h1 :style="{ color: '#006266' }"><BIconCompass /></h1>
            </b-card-header>
            <b-card-body class="h-100">
              <h3>{{ currentWindDirection }}</h3>
            </b-card-body>
          </b-card>
        </b-col>
      </b-row>
    </div>

    <b-button class="btn-circle" id="refresh" variant="primary" @click.stop.prevent="getData"><BIconArrowRepeat :animation="isRefreshing ? 'spin' : null" /></b-button>

    <b-modal
      ref="adminUuidModal"
      title="Admin UUID"
      ok-title="Delete"
      cancel-title="Cancel"
      :ok-disabled="!adminUuid || adminUuid.length < 1"
      @ok.prevent="deleteRain">
      <b-form-group label="Admin uuid" description="The uuid provided to admins to make changes to the database." label-for="uuid">
        <b-form-input id="uuid" v-model="adminUuid" />
      </b-form-group>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import LineChart from '@/components/chart/LineChart'
import WindRose from '@/components/chart/WindRose'

import { BIconCloudRain, BIconCpu, BIconTrash, BIconArrowDown, BIconArrowUp, BIconCompass, BIconSun, BIconArrowRepeat, BIconPersonLinesFill, BIconMoisture, BIconSpeedometer, BIconSunrise, BIconSunset, BIconThermometer, BIconThermometerSun, BIconTornado, BIconWind } from 'bootstrap-vue'

import Trend from 'vuetrend'

const SunCalc = require('suncalc')

export default {
  name: 'Dashboard',
  components: {
    LineChart,
    WindRose,
    Trend,
    BIconTrash,
    BIconSunrise,
    BIconPersonLinesFill,
    BIconSunset,
    BIconArrowDown,
    BIconArrowUp,
    BIconCompass,
    BIconArrowRepeat
  },
  data: function () {
    const windCategories = [
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
    ]
    return {
      rainfallRange: null,
      adminUuid: null,
      moonPhase: null,
      chartData: null,
      endDate: null,
      startDate: null,
      dataDateRange: null,
      dataFile: null,
      forecast: null,
      currentWindDirection: null,
      isRefreshing: false,
      windCategories: windCategories,
      variables: [{
        id: 'temp',
        traces: [
          { x: 'created', y: 'ambientTemp', legendTitle: 'Ambient', icon: BIconThermometerSun, color: '#A3CB38', aggregation: 'none' },
          { x: 'created', y: 'groundTemp', legendTitle: 'Ground', icon: BIconThermometer, color: '#006266', aggregation: 'none' },
          { x: 'created', y: 'heatIndex', legendTitle: 'Heat index', icon: BIconPersonLinesFill, color: '#009432', aggregation: 'none' },
          { x: 'created', y: 'ambientTemp', legendTitle: 'Forecast', icon: BIconThermometerSun, color: '#A3CB38', aggregation: 'none', isForecast: true }
        ],
        bgImage: require('@/assets/banner-temperature.jpg'),
        yTitle: 'Temperature [°C]',
        visible: false
      }, {
        id: 'rainfall',
        traces: [
          { x: 'created', y: 'rainfall', legendTitle: 'Rainfall', icon: BIconCloudRain, color: '#1289A7', aggregation: 'cumulative' },
          {
            x: 'created',
            y: 'rainfall',
            type: 'bar',
            legendTitle: 'Rainfall/h',
            hiddenFromLegend: true,
            icon: BIconCloudRain,
            color: '#1289A7',
            aggregation: 'none',
            transformation: (x, y) => {
              if (x.length > 2 && y.length > 2) {
                const minDate = new Date(x[0])
                const maxDate = new Date(x[x.length - 1])
                const hours = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60))

                const xr = Array.from(Array(hours).keys()).map(i => new Date(minDate.getTime() + (i * 1000 * 60 * 60)))
                const yr = xr.map(_ => 0)

                let yi = 0
                y.forEach((yy, i) => {
                  yr[yi] += yy

                  if (new Date(x[i]) >= xr[yi + 1]) {
                    yi++
                  }
                })

                return [xr, yr]
              } else {
                return [x, y]
              }
            }
          },
          { x: 'created', y: 'rainfall', legendTitle: 'Forecast', icon: BIconCloudRain, color: '#1289A7', aggregation: 'cumulative', isForecast: true }
        ],
        bgImage: require('@/assets/banner-rain.jpg'),
        yTitle: 'Rainfall [mm]',
        visible: false
      }, {
        id: 'humidity',
        traces: [
          { x: 'created', y: 'humidity', legendTitle: 'Humidity', icon: BIconMoisture, color: '#0652DD', aggregation: 'smooth' },
          { x: 'created', y: 'humidity', legendTitle: 'Forecast', icon: BIconMoisture, color: '#0652DD', aggregation: 'none', isForecast: true }
        ],
        bgImage: require('@/assets/banner-humidity.jpg'),
        yTitle: 'Humidity [%]',
        visible: false,
        yRange: [0, 100]
      }, {
        id: 'pressure',
        traces: [
          { x: 'created', y: 'pressure', legendTitle: 'Pressure', icon: BIconSpeedometer, color: '#12CBC4', aggregation: 'smooth' },
          { x: 'created', y: 'pressure', legendTitle: 'Forecast', icon: BIconSpeedometer, color: '#12CBC4', aggregation: 'none', isForecast: true }
        ],
        bgImage: require('@/assets/banner-pressure.jpg'),
        yTitle: 'Pressure [hpa]',
        visible: false
      }, {
        id: 'lux',
        traces: [{ x: 'created', y: 'lux', legendTitle: 'Lux', icon: BIconSun, color: '#F79F1F', aggregation: 'smooth' }],
        bgImage: require('@/assets/banner-lux.jpg'),
        yTitle: 'Lux',
        visible: false
      }, {
        id: 'pi',
        traces: [{ x: 'created', y: 'piTemp', legendTitle: 'Temperature', icon: BIconCpu, color: '#EA2027', aggregation: 'smooth' }],
        bgImage: require('@/assets/banner-pi.jpg'),
        yTitle: 'Pi Temperature [°C]',
        visible: false
      }, {
        id: 'wind',
        traces: [
          { x: 'created', y: 'windSpeed', legendTitle: 'Speed', icon: BIconWind, color: '#B53471', aggregation: 'none' },
          { x: 'created', y: 'windSpeed', legendTitle: 'Speed Forecast', icon: BIconWind, color: '#B53471', aggregation: 'none', isForecast: true },
          { x: 'created', y: 'windGust', legendTitle: 'Gust', icon: BIconTornado, color: '#833471', mode: 'markers', aggregation: 'none' },
          { x: 'created', y: 'windGust', legendTitle: 'Gust Forecast', icon: BIconTornado, color: '#833471', mode: 'markers', aggregation: 'none', isForecast: true }
        ],
        bgImage: require('@/assets/banner-wind.jpg'),
        yTitle: 'Wind [kph]',
        visible: false,
        yToZero: true,
        shapes: windCategories.map(wc => {
          return {
            type: 'rect',
            xref: 'paper',
            yref: 'y',
            x0: 0,
            x1: 1,
            y0: wc.min,
            y1: wc.max,
            fillcolor: wc.value.color,
            layer: 'below',
            opacity: 0.5,
            line: {
              width: 0
            }
          }
        })
      }],
      moonPhases: [
        { name: 'New Moon', icon: 'wi wi-moon-new' },
        { name: 'Waxing Crescent', icon: 'wi wi-moon-waxing-crescent-3' },
        { name: 'First Quarter', icon: 'wi wi-moon-first-quarter' },
        { name: 'Waxing Gibbous', icon: 'wi wi-moon-waxing-gibbous-3' },
        { name: 'Full Moon', icon: 'wi wi-moon-full' },
        { name: 'Waning Gibbous', icon: 'wi wi-moon-waning-gibbous-3' },
        { name: 'Last Quarter', icon: 'wi wi-moon-third-quarter' },
        { name: 'Waning Crescent', icon: 'wi wi-moon-waning-crescent-3' }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'storeAdminUuid'
    ]),
    trendData: function () {
      if (!this.dataFile || this.dataFile.length < 1) {
        return null
      } else {
        return this.variables.map(variable => {
          return this.dataFile.slice(Math.max(this.dataFile.length - 288, 0)).reduce((arr, df) => {
            if (df && variable.traces[0] && variable.traces[0].y && df[variable.traces[0].y]) {
              if (variable.traces[0].aggregation === 'cumulative') {
                arr.push((arr.length > 0 ? arr[arr.length - 1] : 0) + df[variable.traces[0].y])
              } else {
                arr.push(df[variable.traces[0].y])
              }
            } else {
              if (variable.traces[0].aggregation === 'cumulative') {
                arr.push(arr.length > 0 ? arr[arr.length - 1] : 0)
              } else {
                arr.push(0)
              }
            }

            return arr
          }, [])
        })
      }
    },
    minMax: function () {
      if (!this.dataFile || this.dataFile.length < 1) {
        return null
      }

      return this.variables.map(v => {
        return v.traces.map(t => {
          const values = this.dataFile.map(df => df[t.y]).filter(dp => dp !== undefined && dp !== null)
          return {
            min: Math.min(...values),
            max: Math.max(...values)
          }
        })
      })
    },
    aggregatedValues: function () {
      if (!this.dataFile || this.dataFile.length < 1) {
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
    srProgress: function () {
      if (this.sunrisesSunsets) {
        return this.sunrisesSunsets.map(sr => {
          const result = []
          let d = sr.sunrise
          result.push(d.getHours() * 60 + d.getMinutes())
          d = sr.sunset
          result.push((d.getHours() * 60 + d.getMinutes()) - result[0])
          result.push(1440 - (result[1] + result[0]))

          return {
            tooltip: `${sr.sunrise.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })} - ${sr.sunset.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })}`,
            values: result
          }
        })
      } else {
        return []
      }
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
  methods: {
    setRainfallRange: function (range) {
      this.rainfallRange = range
    },
    onVariableClicked: function (index) {
      this.variables[index].visible = !this.variables[index].visible

      const query = Object.assign({}, this.$route.query)

      const variables = new Set()
      if (query.vars) {
        if (Array.isArray(query.vars)) {
          query.vars.forEach(v => variables.add(v))
        } else {
          variables.add(query.vars)
        }
      }

      if (this.variables[index].visible) {
        variables.add(this.variables[index].id)
      } else {
        variables.delete(this.variables[index].id)
      }

      query.vars = [...variables]

      this.$router.replace({ query })
    },
    setWindDirection: function (direction) {
      this.currentWindDirection = direction
    },
    deleteRain: function () {
      this.$store.dispatch('setAdminUuid', this.adminUuid)

      const start = new Date(this.rainfallRange[0]).toISOString()
      const end = new Date(this.rainfallRange[1]).toISOString()

      this.apiDeleteRainfall(start, end, this.adminUuid)
        .then(() => {
          this.$refs.adminUuidModal.hide()
          this.getData()
        })
    },
    getData: function () {
      this.isRefreshing = true
      this.rainfallRange = null

      this.$nextTick(() => {
        const data = this.apiGetData(this.start, this.end)
        const forecast = this.apiGetForecast(this.start, this.end)

        Promise.all([data, forecast])
          .then(data => {
            this.dataFile = data[0]
            this.forecast = data[1]

            if (this.dataFile) {
              const dateRange = ['9999-12-31T23:59:59.999+0000', '-0000-01-01T00:00:00.000+0000']
              this.dataFile.forEach(d => {
                if (d.created) {
                  dateRange[0] = d.created < dateRange[0] ? d.created : dateRange[0]
                  dateRange[1] = d.created > dateRange[1] ? d.created : dateRange[1]
                }
              })

              if (this.forecast) {
                this.forecast.forEach(d => {
                  if (d.created) {
                    dateRange[0] = d.created < dateRange[0] ? d.created : dateRange[0]
                    dateRange[1] = d.created > dateRange[1] ? d.created : dateRange[1]
                  }
                })
              }

              this.dataDateRange = dateRange
            } else {
              this.dataDateRange = null
            }

            this.isRefreshing = false
            this.$emitter.emit('refresh-latest')
          })
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
    }
  },
  mounted: function () {
    this.adminUuid = this.storeAdminUuid

    const query = Object.assign({}, this.$route.query)

    if (query.vars) {
      try {
        if (Array.isArray(query.vars)) {
          query.vars.forEach(v => {
            this.variables.find(ov => ov.id === v).visible = true
          })
        } else {
          this.variables.find(ov => ov.id === query.vars).visible = true
        }
      } catch (err) {
        // Do nothing here
      }
    }

    this.endDate = new Date()
    // this.startDate = new Date(this.endDate.getTime() - (24 * 60 * 60 * 1000))
    this.startDate = new Date()
    this.getData()
    this.getMoonPhase()

    this.$emitter.on('refresh', this.getData)
  },
  beforeDestroy: function () {
    this.$emitter.off('refresh', this.getData)
  }
}
</script>

<style scoped>
.moon {
  color: #FFC312;
}
.sunrise {
  color: #F79F1F;
}
.sunset {
  color: #9980FA;
}
.bg-sunrise {
  background-color: #F79F1F;
}
.bg-sunset {
  background-color: #9980FA;
}

.variable-card {
  height: 300px;
  text-align: center;
}

.variable-card:hover .bg {
  filter: grayscale(0%) brightness(75%);
}
.variable-card.active .bg {
  filter: grayscale(0%) brightness(60%);
}

.variable-card .bg {
  position: absolute;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  filter: grayscale(100%) brightness(60%);
  -webkit-transition: 0.3s -webkit-filter ease-in-out;
  -moz-transition: 0.3s -moz-filter ease-in-out;
  -moz-transition: 0.3s filter ease-in-out;
  -ms-transition: 0.3s -ms-filter ease-in-out;
  -o-transition: 0.3s -o-filter ease-in-out;
  transition: 0.3s filter ease-in-out, 0.3s -webkit-filter ease-in-out;
}

.variable-card .heading {
  width: 100%;
  position: absolute;
  bottom: 0;
  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: ellipsis;
  transition: 0.3s opacity ease-in-out;
  opacity: 0;
}
.variable-card:hover .heading {
  opacity: 1;
}
.btn-circle {
  width: 50px;
  height: 50px;
  padding: 7px 10px;
  border-radius: 25px;
  text-align: center;
}
#refresh {
  position: fixed;
  transition: opacity linear 0.1s;
  opacity: 0.66;
  right: 1em;
  bottom: 1em;
  z-index: 2;
}
#refresh:active,
#refresh:hover {
  opacity: 1;
}
</style>
