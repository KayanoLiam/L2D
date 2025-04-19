


import { createRouter, createWebHistory } from 'vue-router'


const routes = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'index',
            component: () => import('../views/indexView.vue')
        },
    ]
})



export default routes