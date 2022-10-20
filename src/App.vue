<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="dark" sticky class="d-flex justify-content-between">
      <b-navbar-brand :to="{ name: 'Dashboard' }">
        <img src="img/logo.svg" height="40px" alt="Weather">
      </b-navbar-brand>

      <b-button @click="refresh" v-if="isFrontPage"><BIconArrowRepeat /></b-button>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item :to="{ name: 'Weekly' }">Week overview</b-nav-item>
          <b-nav-item :to="{ name: 'Yearly' }">Year overview</b-nav-item>
          <b-nav-item :to="{ name: 'Total' }">Total overview</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <div class="position-fixed w-100 d-flex justify-content-center update-banner bg-dark" v-if="lastUpdateDate">
      <span class="px-2 pb-2 text-muted">Last update: {{ `${lastUpdateDate.toLocaleDateString()} ${lastUpdateDate.toLocaleTimeString()}` }}</span>
    </div>
    <b-container fluid class="pt-3 mt-3">
      <router-view/>
    </b-container>
  </div>
</template>

<script>
import { BIconArrowRepeat } from 'bootstrap-vue'

export default {
  components: {
    BIconArrowRepeat
  },
  data: function () {
    return {
      lastUpdate: null
    }
  },
  computed: {
    lastUpdateDate: function () {
      if (this.lastUpdate) {
        return new Date(this.lastUpdate)
      } else {
        return null
      }
    },
    isFrontPage: function () {
      return this.$route.name === 'Dashboard'
    }
  },
  methods: {
    refresh: function () {
      this.$emitter.emit('refresh')
    },
    getLatest: function () {
      this.apiGetLatestDate()
        .then(result => {
          this.lastUpdate = result[0]
        })
    }
  },
  mounted: function () {
    this.$emitter.on('refresh-latest', this.getLatest)
  },
  beforeDestroy: function () {
    this.$emitter.off('refresh-latest', this.getLatest)
  }
}
</script>

<style lang="scss">
@import '~weather-icons2/css/weather-icons.css';

@import '~bootswatch/dist/superhero/variables';
@import '~bootstrap/scss/bootstrap';
@import '~bootstrap-vue/src/index.scss';
@import '~bootswatch/dist/superhero/bootswatch';

.b-form-datepicker .b-calendar-nav .btn {
  color: white;
}

.update-banner {
  z-index: 100;
}
</style>
