import React from 'react'

const Welcome = React.lazy(() => import('./views/welcome/Welcome'))
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// Hotleads
const LeadsToConvert = React.lazy(() => import('./views/hotleads/LeadsToConvert'))
const LeadsToConvertDetail = React.lazy(() => import('./views/hotleads/LeadsToConvertDetail'))

const Testable = React.lazy(() => import('./views/testable/Testable'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/welcome', name: 'Welcome Page', component: Welcome },
  { path: '/testable', name: 'Tes Table', component: Testable },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, role_access: ['DA', 'MD', 'RD'] },
  {
    path: '/hotleads',
    exact: true,
    name: 'Hotleads',
    component: LeadsToConvert,
    role_access: ['DA', 'MD', 'RD'],
  },
  {
    path: '/hotleads/leads-to-convert',
    exact: true,
    name: 'Leads to Convert',
    component: LeadsToConvert,
    role_access: ['DA', 'MD', 'RD'],
  },
  {
    path: '/hotleads/leads-to-convert/:id',
    exact: true,
    name: 'Leads to Convert Detail',
    component: LeadsToConvertDetail,
    role_access: ['DA', 'MD', 'RD'],
  },
]

export default routes
