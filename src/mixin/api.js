import { mapGetters } from 'vuex'
const axios = require('axios').default

export default {
  computed: {
    /** Mapgetters exposing the store configuration */
    ...mapGetters([
      'storeServerUrl'
    ])
  },
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
        baseURL: this.storeServerUrl,
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
        this.axios({ url: 'data', params: { start: start, end: end }, headers: { Accept: 'text/plain' }, responseType: 'blob' })
          .then(result => {
            if (result && result.data) {
              const reader = new FileReader()
              reader.onload = () => resolve(this.$plotly.d3.tsv.parse(reader.result))
              reader.readAsText(result.data)
            } else {
              resolve(null)
            }
          })
          .catch(error => reject(error))
      })
    },
    toFormattedDate: function (dt) {
      return `${dt.getFullYear().toString().padStart(4, '0')}-${(dt.getMonth() + 1).toString().padStart(2, '0')}-${dt.getDate().toString().padStart(2, '0')} ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}`
    }
  }
}
