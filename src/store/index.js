import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    serverUrl: null,
    adminUuid: null
  },
  getters: {
    storeServerUrl: (state) => state.serverUrl,
    storeAdminUuid: (state) => state.adminUuid
  },
  mutations: {
    ON_SERVER_URL_CHANGED: function (state, newServerUrl) {
      state.serverUrl = newServerUrl
    },
    ON_ADMIN_UUID_CHANGED: function (state, newAdminUuid) {
      state.adminUuid = newAdminUuid
    }
  },
  actions: {
    setServerUrl: function ({ commit }, serverUrl) {
      commit('ON_SERVER_URL_CHANGED', serverUrl)
    },
    setAdminUuid: function ({ commit }, adminUuid) {
      commit('ON_ADMIN_UUID_CHANGED', adminUuid)
    }
  },
  plugins: [createPersistedState()]
})
