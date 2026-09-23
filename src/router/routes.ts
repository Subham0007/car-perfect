import type { RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BrowseView from '../views/BrowseView.vue'
import ModelDetailView from '../views/ModelDetailView.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/browse', name: 'browse', component: BrowseView },
  { path: '/cars/:id', name: 'model-detail', component: ModelDetailView },
]

export default routes
