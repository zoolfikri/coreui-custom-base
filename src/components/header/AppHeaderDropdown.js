import React from 'react'
import { useSelector } from 'react-redux'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { cilLockLocked, cilSettings, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import UserLogo from 'src/assets/images/icon/user.svg'
import NotificationLogo from 'src/assets/images/icon/notification.svg'

import axios from 'axios'
import sweetalert2 from 'src/components/custom/Sweetalert2'

const notification_map = {
  new_hotleads_non_ro: {
    label: 'Leads Baru',
    link: '/#/new_hot_leads',
  },
  prospect: { label: 'Hot Prospects', link: '/#/order_management' },
  customer_non_ro: {
    label: 'Leads Manual',
    link: '/#/customer_non_ro',
  },
  new_hotleads: {
    label: 'Leads to be convert',
    link: '/#/customer_non_ro_convert',
  },
}

const AppHeaderDropdown = () => {
  const user_data = useSelector((state) => state.user_data)

  const variables = useSelector((state) => state.variables)
  const access_token = useSelector((state) => state.access_token)

  const [notifications, setNotifications] = React.useState([])

  const getNotification = React.useCallback(() => {
    axios({
      method: 'get',
      baseURL: variables.api_base_url,
      url: 'api/cms/notification-number',
      headers: {
        Authorization: access_token,
      },
      params: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
      },
    }).then(
      (result) => {
        const { data } = result

        setNotifications(data.data)
      },
      (e) => {
        sweetalert2.fire({
          text: e.message || e.status,
          icon: 'error',
        })
      },
    )
  }, [access_token, variables])

  React.useEffect(() => {
    getNotification()
    console.log('NOTIFICATION MAP', notification_map)
  }, [getNotification])

  return (
    <>
      <CDropdown variant="nav-item">
        <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
          <CAvatar src={NotificationLogo} size="md" />
        </CDropdownToggle>
        <CDropdownMenu className="pt-0" placement="bottom-end">
          <CDropdownHeader className="bg-light fw-semibold py-2">Notification</CDropdownHeader>
          {notifications.map((notification, idx) => (
            <CDropdownItem key={idx} href={notification_map[notification.module]?.link}>
              <span>{notification_map[notification.module]?.label}</span>
              {notification.count_data > 0 ? (
                <CBadge color="info" className="ms-2 text-right">
                  {notification.count_data}
                </CBadge>
              ) : (
                ''
              )}
            </CDropdownItem>
          ))}
        </CDropdownMenu>
      </CDropdown>

      <CDropdown variant="nav-item">
        <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
          <div className="d-flex align-items-center">
            <CAvatar src={UserLogo} size="md" />
            <div className="ps-3">
              <div className="text-title fw-bold text-primary mb-1">{user_data.username}</div>
              <div className="text-body text-primary">{user_data.role}</div>
            </div>
          </div>
        </CDropdownToggle>
        <CDropdownMenu className="pt-0" placement="bottom-end">
          <CDropdownHeader className="bg-light fw-semibold py-2">Settings</CDropdownHeader>
          <CDropdownItem href="#">
            <CIcon icon={cilUser} className="me-2" />
            Profile
          </CDropdownItem>
          <CDropdownItem href="#">
            <CIcon icon={cilSettings} className="me-2" />
            Settings
          </CDropdownItem>
          <CDropdownDivider />
          <CDropdownItem href="/#/logout">
            <CIcon icon={cilLockLocked} className="me-2" />
            Logout
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>
    </>
  )
}

export default AppHeaderDropdown
