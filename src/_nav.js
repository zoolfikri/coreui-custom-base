import React from 'react'
import { CNavGroup, CNavItem } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faUsers } from '@fortawesome/free-solid-svg-icons'

const _nav = [
  {
    component: CNavItem,
    name: <b>DASHBOARD</b>,
    to: '/dashboard',
    icon: <FontAwesomeIcon icon={faHome} className="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  {
    component: CNavGroup,
    name: <b>HOTLEADS</b>,
    to: '/base',
    icon: <FontAwesomeIcon icon={faUsers} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Leads to Convert',
        to: '/testable',
      },
      {
        component: CNavItem,
        name: 'Leads Baru',
        to: '/base/breadcrumbs',
      },
      {
        component: CNavItem,
        name: 'Leads Assigned',
        to: '/base/cards',
      },
      {
        component: CNavItem,
        name: 'Hot Prospects',
        to: '/base/carousels',
      },
      {
        component: CNavItem,
        name: 'Data Customer',
        to: '/base/collapses',
      },
      {
        component: CNavItem,
        name: 'Leads Manual',
        to: '/base/list-groups',
      },
    ],
  },
]

export default _nav
