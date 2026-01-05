import { createMemoryHistory, createRouter } from 'vue-router'

export default createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../pages/HomePage.vue'),
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../pages/SettingsPage.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})
