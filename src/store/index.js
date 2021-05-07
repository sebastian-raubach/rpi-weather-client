import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    serverUrl: null
  },
  getters: {
    storeServerUrl: (state) => state.serverUrl
  },
  mutations: {
    ON_SERVER_URL_CHANGED: function (state, newServerUrl) {
      state.serverUrl = newServerUrl
    }
  },
  actions: {
    setServerUrl: function ({ commit }, serverUrl) {
      commit('ON_SERVER_URL_CHANGED', serverUrl)
    }
  },
  plugins: [createPersistedState()]
})
