import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/user'
  },
  {
    path: '/user',
    name: 'UserLayout',
    component: () => import('@/layouts/UserLayout.vue'),
    children: [
      {
        path: '',
        name: 'CounselorList',
        component: () => import('@/views/user/CounselorList.vue')
      },
      {
        path: 'appointment/:counselorId',
        name: 'Appointment',
        component: () => import('@/views/user/Appointment.vue'),
        props: true
      }
    ]
  },
  {
    path: '/counselor',
    name: 'CounselorLayout',
    component: () => import('@/layouts/CounselorLayout.vue'),
    children: [
      {
        path: '',
        name: 'CounselorCalendar',
        component: () => import('@/views/counselor/CounselorCalendar.vue')
      },
      {
        path: 'records',
        name: 'ConsultationRecords',
        component: () => import('@/views/counselor/ConsultationRecords.vue')
      },
      {
        path: 'record/:appointmentId',
        name: 'RecordForm',
        component: () => import('@/views/counselor/RecordForm.vue'),
        props: true
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
