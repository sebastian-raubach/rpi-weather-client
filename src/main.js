import Vue from 'vue'
import App from '@/App.vue'
import '@/registerServiceWorker'
import router from '@/router'
import store from '@/store'
import mixin from '@/mixin/api'

import mitt from 'mitt'

import {
  ButtonPlugin,
  CardPlugin,
  FormPlugin,
  FormSelectPlugin,
  FormDatepickerPlugin,
  LayoutPlugin,
  NavbarPlugin,
  ButtonGroupPlugin
} from 'bootstrap-vue'

const emitter = mitt()

Vue.config.productionTip = false

Vue.use(ButtonPlugin)
Vue.use(ButtonGroupPlugin)
Vue.use(CardPlugin)
Vue.use(FormPlugin)
Vue.use(FormSelectPlugin)
Vue.use(FormDatepickerPlugin)
Vue.use(LayoutPlugin)
Vue.use(NavbarPlugin)

// Set base URL based on environment
let baseUrl = './api/'

if (process.env.VUE_APP_BASE_URL) {
  baseUrl = process.env.VUE_APP_BASE_URL
}

store.commit('ON_SERVER_URL_CHANGED', baseUrl)

const axiosDefaults = require('axios/lib/defaults')
axiosDefaults.baseURL = baseUrl

Vue.mixin(mixin)

Vue.use({
  install: function (Vue) {
    // Make custom plotly available
    Vue.prototype.$plotly = require('@/plugin/custom-plotly')
    window.Plotly = Vue.prototype.$plotly

    Vue.prototype.$emitter = emitter
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
