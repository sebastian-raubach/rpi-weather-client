<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="dark">
      <b-navbar-brand :to="{ name: 'Dashboard' }">
        <img src="img/logo.svg" height="40px" alt="Weather">
      </b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
      </b-collapse>
    </b-navbar>
    <b-container fluid>
      <router-view/>
    </b-container>
  </div>
</template>

<style lang="scss">
@import '~bootswatch/dist/superhero/variables';
@import '~bootstrap/scss/bootstrap';
@import '~bootstrap-vue/src/index.scss';
@import '~bootswatch/dist/superhero/bootswatch';

@import "~bootstrap-icons/font/bootstrap-icons.css";
</style>
