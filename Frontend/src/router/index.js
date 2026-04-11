import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import EquipmentList from '../views/EquipmentList.vue'
import QRScanner from '../views/QRScanner.vue'

const routes = [
    { path: '/login', name: 'Login', component: Login },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
    },
    {
        path: '/equipment',
        name: 'EquipmentList',
        component: EquipmentList,
        meta: { requiresAuth: true }
    },
    {
        path: '/equipment/:id',
        name: 'EquipmentDetail',
        component: () => import('../views/EquipmentDetail.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/equipment/qr/:qrCode',
        name: 'EquipmentByQr',
        component: () => import('../views/EquipmentDetail.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/scanner',
        name: 'QRScanner',
        component: QRScanner,
        meta: { requiresAuth: true }
    },
    { path: '/', redirect: '/dashboard' }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    if (to.meta.requiresAuth && !token) {
        next('/login')
    } else {
        next()
    }
})

export default router