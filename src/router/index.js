import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RutasView from '../views/RutasView.vue'
import VehiclesView from '../views/VehiclesView.vue'
import RutasListView from '@/views/RutasListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/rutas',
      name: 'rutas',
      component: RutasView,
    },
    {
      path: '/rutas-list',
      name: 'rutasList',
      component: RutasListView,
    },
    {
      path: '/vehicles',
      name: 'vehicles',
      component: VehiclesView,
    },
  ],
})

export default router
