import Vue from 'vue'
import App from '@/App.vue'
import '@/registerServiceWorker'
import router from '@/router'
import store from '@/store'
import mixin from '@/mixin/api'

import {
  CardPlugin,
  LayoutPlugin
} from 'bootstrap-vue'

Vue.config.productionTip = false

Vue.use(CardPlugin)
Vue.use(LayoutPlugin)

// Set base URL based on environment
let baseUrl = './api/'

if (process.env.VUE_APP_BASE_URL) {
  baseUrl = process.env.VUE_APP_BASE_URL
}

store.commit('ON_SERVER_URL_CHANGED', baseUrl)

Vue.mixin(mixin)

Vue.use({
  install: function (Vue) {
    // Make custom plotly available
    Vue.prototype.$plotly = require('@/plugin/custom-plotly')
    window.Plotly = Vue.prototype.$plotly
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')