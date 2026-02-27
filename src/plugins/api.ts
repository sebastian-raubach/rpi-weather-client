import { coreStore } from '@/stores/app'
import axios from 'axios'
import type { AggregatedStats, DailyStats, ExtendedMeasurement, Measurements, AggregatedStatsMeasurements, AggregatedYearMonth, Location, TidalInfo } from '@/plugins/types/rpi-weather'

/**
 * Sends an axios REST request to the server with the given parameter configuration
 * @param {String} url The remote URL (relative) to send the request to
 * @param {Object} params (Optional) Request payload in the form of a Javascript object
 * @param {String} method (Optional) REST method (default: `'get'`)
 * @returns Promise
 */
function axiosCall ({ url, baseUrl, params, method = 'get', headers, responseType }: { url: string, baseUrl?: string, params?: any, method?: string, headers?: any, responseType?: string }) {
  const store = coreStore()
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
    'Content-Type': 'application/json; charset=utf-8',
  }

  if (headers) {
    hds = Object.assign(hds, headers)
  }

  const config: any = {
    baseURL: baseUrl || store.storeServerUrl,
    url,
    params: requestParams,
    data: requestData,
    method,
    crossDomain: true,
    headers: hds,
  }

  return axios(config)
}

function apiGetData (start: Date, end: Date) {
  return new Promise<ExtendedMeasurement[] | undefined>((resolve, reject) => {
    axiosCall({ url: 'data', params: { start, end }, headers: { Accept: 'application/json' } })
      .then(result => {
        if (result && result.data) {
          resolve(result.data)
        } else {
          resolve(undefined)
        }
      })
      .catch(error => reject(error))
  })
}

function apiGetVariables () {
  return new Promise<string[] | undefined>((resolve, reject) => {
    axiosCall({ url: 'variable', headers: { Accept: 'application/json' } })
      .then(result => {
        if (result && result.data) {
          resolve(result.data)
        } else {
          resolve(undefined)
        }
      })
      .catch(error => reject(error))
  })
}

function apiGetForecast (start: Date, end: Date) {
  return new Promise<Measurements[] | undefined>((resolve, reject) => {
    axiosCall({ url: 'data/forecast', params: { start, end }, headers: { Accept: 'application/json' } })
      .then(result => {
        if (result && result.data) {
          resolve(result.data)
        } else {
          resolve(undefined)
        }
      })
      .catch(error => reject(error))
  })
}

function apiGetYearly (start: Date, end: Date) {
  return new Promise<DailyStats[] | undefined>((resolve, reject) => {
    axiosCall({ url: 'stats/daily', params: { start, end }, headers: { Accept: 'application/json' } })
      .then(result => {
        if (result && result.data) {
          resolve(result.data)
        } else {
          resolve(undefined)
        }
      })
      .catch(error => reject(error))
  })
}

function apiGetWeekly () {
  return new Promise<AggregatedStats | undefined>((resolve, reject) => {
    axiosCall({ url: 'stats/weekly', headers: { Accept: 'application/json' } })
      .then(result => {
        if (result && result.data) {
          resolve(result.data)
        } else {
          resolve(undefined)
        }
      })
      .catch(error => reject(error))
  })
}

function apiGetWeeklyMeasurements () {
  return new Promise<AggregatedStatsMeasurements | undefined>((resolve, reject) => {
    axiosCall({ url: 'stats/weekly/measurements', headers: { Accept: 'application/json' } })
      .then(result => {
        if (result && result.data) {
          resolve(result.data)
        } else {
          resolve(undefined)
        }
      })
      .catch(error => reject(error))
  })
}

function apiGetMonthly (month: number, year: number) {
  return new Promise<AggregatedStats | undefined>((resolve, reject) => {
    axiosCall({ url: `stats/monthly?month=${month}&year=${year}`, headers: { Accept: 'application/json' } })
      .then(result => {
        if (result && result.data) {
          resolve(result.data)
        } else {
          resolve(undefined)
        }
      })
      .catch(error => reject(error))
  })
}

function apiGetMonthlyStats (month: number) {
  return new Promise<AggregatedYearMonth[] | undefined>((resolve, reject) => {
    axiosCall({ url: `stats/monthly/${month}`, headers: { Accept: 'application/json' } })
      .then(result => {
        if (result && result.data) {
          resolve(result.data)
        } else {
          resolve(undefined)
        }
      })
      .catch(error => reject(error))
  })
}

function apiGetMonthlyMeasurements (month: number) {
  return new Promise<AggregatedStatsMeasurements | undefined>((resolve, reject) => {
    axiosCall({ url: `stats/monthly/measurements?month=${month}`, headers: { Accept: 'application/json' } })
      .then(result => {
        if (result && result.data) {
          resolve(result.data)
        } else {
          resolve(undefined)
        }
      })
      .catch(error => reject(error))
  })
}

function apiGetLatestDate () {
  return new Promise<string[] | undefined>((resolve, reject) => {
    axiosCall({ url: 'latest', headers: { Accept: 'application/json' } })
      .then(result => {
        if (result && result.data) {
          resolve(result.data)
        } else {
          resolve(undefined)
        }
      })
      .catch(error => reject(error))
  })
}

function apiGetTidal () {
  return new Promise<TidalInfo | undefined>((resolve, reject) => {
    axiosCall({ url: 'tide', headers: { Accept: 'application/json' } })
      .then(result => {
        if (result && result.data) {
          resolve(result.data)
        } else {
          resolve(undefined)
        }
      })
      .catch(error => reject(error))
  })
}

function apiGetTotal () {
  return new Promise<AggregatedStats | undefined>((resolve, reject) => {
    axiosCall({ url: 'stats/total', headers: { Accept: 'application/json' } })
      .then(result => {
        if (result && result.data) {
          resolve(result.data)
        } else {
          resolve(undefined)
        }
      })
      .catch(error => reject(error))
  })
}

function apiDeleteRainfall (start: string, end: string, uuid: string) {
  return new Promise<void>((resolve, reject) => {
    axiosCall({ url: 'data/rainfall', method: 'delete', params: { start, end, uuid }, headers: { Accept: 'application/json' } })
      .then(() => {
        resolve()
      })
      .catch(error => reject(error))
  })
}

function apiGetYears () {
  return new Promise<number[]>((resolve, reject) => {
    axiosCall({ url: 'stats/years', headers: { Accept: 'application/json' } })
      .then(result => {
        if (result && result.data) {
          resolve(result.data)
        } else {
          resolve([])
        }
      })
      .catch(error => reject(error))
  })
}

function apiGetLocation () {
  return new Promise<Location | undefined>((resolve, reject) => {
    axiosCall({ url: 'location', headers: { Accept: 'application/json' } })
      .then(result => {
        if (result && result.data) {
          resolve(result.data)
        } else {
          resolve(undefined)
        }
      })
      .catch(error => reject(error))
  })
}

export {
  axiosCall,
  apiGetData,
  apiGetForecast,
  apiGetYearly,
  apiGetWeekly,
  apiGetWeeklyMeasurements,
  apiGetMonthly,
  apiGetVariables,
  apiGetMonthlyStats,
  apiGetMonthlyMeasurements,
  apiGetLatestDate,
  apiGetLocation,
  apiGetTotal,
  apiDeleteRainfall,
  apiGetYears,
  apiGetTidal,
}
