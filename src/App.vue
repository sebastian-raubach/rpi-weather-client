<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="dark" sticky class="d-flex justify-content-between">
      <b-navbar-brand :to="{ name: 'Dashboard' }">
        <img src="img/logo.svg" height="40px" alt="Weather">
      </b-navbar-brand>

      <b-button @click="refresh"><BIconArrowRepeat /></b-button>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item :to="{ name: 'Weekly' }">Week overview</b-nav-item>
          <b-nav-item :to="{ name: 'Yearly' }">Year overview</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <b-container fluid>
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
  methods: {
    refresh: function () {
      this.$emitter.emit('refresh')
    }
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
</style>
