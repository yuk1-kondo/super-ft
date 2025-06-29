import { createRouter, createWebHistory } from 'vue-router'
import Landing from '../views/Landing.vue'
import App from '../views/App.vue'
import Processing from '../views/Processing.vue'
import Result from '../views/Result.vue'
import History from '../views/History.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Landing',
      component: Landing
    },
    {
      path: '/app',
      name: 'App',
      component: App
    },
    {
      path: '/processing',
      name: 'Processing',
      component: Processing
    },
    {
      path: '/result/:id',
      name: 'Result',
      component: Result,
      props: true
    },
    {
      path: '/history',
      name: 'History',
      component: History
    }
  ]
})

export default router
