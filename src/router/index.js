import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard.vue')
  },
  {
    path: '/yearly',
    name: 'Yearly',
    component: () => import(/* webpackChunkName: "yearly" */ '@/views/Yearly.vue')
  },
  {
    path: '/weekly',
    name: 'Weekly',
    component: () => import(/* webpackChunkName: "weekly" */ '@/views/Weekly.vue')
  },
  {
    path: '/total',
    name: 'Total',
    component: () => import(/* webpackChunkName: "total" */ '@/views/Total.vue')
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '@/views/About.vue')
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router
