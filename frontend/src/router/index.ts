import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
        },
        {
            path: '/about',
            name: 'about',
            component: () => import('../views/AboutView.vue'),
        },
        {
            path: '/events',
            name: 'events',
            component: () => import('../views/EventsView.vue'),
        },
        {
            path: '/profile',
            name: 'profile',
            component: () => import('../views/ProfileView.vue'),
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView.vue'),
        },
        {
            path: '/signup',
            name: 'signup',
            component: () => import('../views/SignUpView.vue'),
        },
    ],
})

export default router
