import React from 'react'

const Welcome = React.lazy(() => import('./views/welcome/Welcome'))
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

const Testable = React.lazy(() => import('./views/testable/Testable'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/welcome', name: 'Welcome Page', component: Welcome },
  { path: '/testable', name: 'Tes Table', component: Testable },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
]

export default routes
