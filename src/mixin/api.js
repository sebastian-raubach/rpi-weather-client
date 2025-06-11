import dayjs from 'dayjs'

const qs = require('qs')
const axios = require('axios').default

axios.interceptors.request.use(config => {
  config.paramsSerializer = (params) => qs.stringify(params, {
    serializeDate: (date) => dayjs(date).format('YYYY-MM-DDTHH:mm:ssZ')
  })
  return config
})

const englishOrdinalRules = new Intl.PluralRules('en', { type: 'ordinal' })

const suffixes = {
  one: 'st',
  two: 'nd',
  few: 'rd',
  other: 'th'
}

export default {
  methods: {
    /**
     * Sends an axios REST request to the server with the given parameter configuration
     * @param {String} url The remote URL (relative) to send the request to
     * @param {Object} params (Optional) Request payload in the form of a Javascript object
     * @param {String} method (Optional) REST method (default: `'get'`)
     * @returns Promise
     */
    axios: function ({ url = null, params = null, method = 'get', headers = null, responseType = 'json' }) {
      let requestData = null
      let requestParams = null

      // Stringify the data object for non-GET requests
      if (params !== null || params !== undefined) {
        if (method === 'get') {
          requestParams = params
        } else {
          requestData = params
        }
      }

      let hds = {
        'Content-Type': 'application/json; charset=utf-8'
      }

      if (headers) {
        hds = Object.assign(hds, headers)
      }

      return axios({
        url: url,
        params: requestParams,
        data: requestData,
        method: method,
        responseType: responseType,
        crossDomain: true,
        headers: hds
      })
    },
    apiGetData: function (start, end) {
      return new Promise((resolve, reject) => {
        this.axios({ url: 'data', params: { start: start, end: end }, headers: { Accept: 'application/json' } })
          .then(result => {
            if (result && result.data) {
              resolve(result.data)
            } else {
              resolve(null)
            }
          })
          .catch(error => reject(error))
      })
    },
    apiGetForecast: function (start, end) {
      return new Promise((resolve, reject) => {
        this.axios({ url: 'data/forecast', params: { start: start, end: end }, headers: { Accept: 'application/json' } })
          .then(result => {
            if (result && result.data) {
              resolve(result.data)
            } else {
              resolve(null)
            }
          })
          .catch(error => reject(error))
      })
    },
    apiGetYearly: function (start, end) {
      return new Promise((resolve, reject) => {
        this.axios({ url: 'stats/daily', params: { start: start, end: end }, headers: { Accept: 'application/json' } })
          .then(result => {
            if (result && result.data) {
              resolve(result.data)
            } else {
              resolve(null)
            }
          })
          .catch(error => reject(error))
      })
    },
    apiGetWeekly: function () {
      return new Promise((resolve, reject) => {
        this.axios({ url: 'stats/weekly', headers: { Accept: 'application/json' } })
          .then(result => {
            if (result && result.data) {
              resolve(result.data)
            } else {
              resolve(null)
            }
          })
          .catch(error => reject(error))
      })
    },
    apiGetWeeklyMeasurements: function () {
      return new Promise((resolve, reject) => {
        this.axios({ url: 'stats/weekly/measurements', headers: { Accept: 'application/json' } })
          .then(result => {
            if (result && result.data) {
              resolve(result.data)
            } else {
              resolve(null)
            }
          })
          .catch(error => reject(error))
      })
    },
    apiGetMonthly: function (month, year) {
      return new Promise((resolve, reject) => {
        this.axios({ url: `stats/monthly?month=${month}&year=${year}`, headers: { Accept: 'application/json' } })
          .then(result => {
            if (result && result.data) {
              resolve(result.data)
            } else {
              resolve(null)
            }
          })
          .catch(error => reject(error))
      })
    },
    apiGetMonthlyStats: function (month) {
      return new Promise((resolve, reject) => {
        this.axios({ url: `stats/monthly/${month}`, headers: { Accept: 'application/json' } })
          .then(result => {
            if (result && result.data) {
              resolve(result.data)
            } else {
              resolve(null)
            }
          })
          .catch(error => reject(error))
      })
    },
    apiGetMonthlyMeasurements: function (month) {
      return new Promise((resolve, reject) => {
        this.axios({ url: `stats/monthly/measurements?month=${month}`, headers: { Accept: 'application/json' } })
          .then(result => {
            if (result && result.data) {
              resolve(result.data)
            } else {
              resolve(null)
            }
          })
          .catch(error => reject(error))
      })
    },
    apiGetLatestDate: function () {
      return new Promise((resolve, reject) => {
        this.axios({ url: 'latest', headers: { Accept: 'application/json' } })
          .then(result => {
            if (result && result.data) {
              resolve(result.data)
            } else {
              resolve(null)
            }
          })
          .catch(error => reject(error))
      })
    },
    apiGetTotal: function () {
      return new Promise((resolve, reject) => {
        this.axios({ url: 'stats/total', headers: { Accept: 'application/json' } })
          .then(result => {
            if (result && result.data) {
              resolve(result.data)
            } else {
              resolve(null)
            }
          })
          .catch(error => reject(error))
      })
    },
    apiDeleteRainfall: function (start, end, uuid) {
      return new Promise((resolve, reject) => {
        this.axios({ url: 'data/rainfall', method: 'delete', params: { start: start, end: end, uuid: uuid }, headers: { Accept: 'application/json' } })
          .then(() => {
            resolve()
          })
          .catch(error => reject(error))
      })
    },
    getYears: function () {
      return new Promise((resolve, reject) => {
        this.axios({ url: 'stats/years', headers: { Accept: 'application/json' } })
          .then(result => {
            if (result && result.data) {
              resolve(result.data)
            } else {
              resolve([])
            }
          })
          .catch(error => reject(error))
      })
    },
    toFormattedDateTime: function (dt) {
      return `${this.toFormattedDate(dt)} ${this.toFormattedTime(dt)}`
    },
    toFormattedDate: function (dt) {
      if (typeof dt !== 'object') {
        dt = new Date(dt)
      }
      return `${dt.getFullYear().toString().padStart(4, '0')}-${(dt.getMonth() + 1).toString().padStart(2, '0')}-${dt.getDate().toString().padStart(2, '0')}`
    },
    toFormattedTime: function (dt) {
      if (typeof dt !== 'object') {
        dt = new Date(dt)
      }
      return `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}`
    },
    ordinal: function (number) {
      const category = englishOrdinalRules.select(number)
      const suffix = suffixes[category]
      return (number + suffix)
    }
  }
}
