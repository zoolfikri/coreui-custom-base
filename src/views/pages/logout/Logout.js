import React from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'

import sweetalert2 from 'src/components/custom/Sweetalert2'

const Logout = ({ history }) => {
  const dispatch = useDispatch()

  React.useEffect(() => {
    if (localStorage.getItem('user_data') && localStorage.getItem('access_token')) {
      sweetalert2
        .fire({
          title: 'Keluar dari Web Console?',
          showDenyButton: true,
          confirmButtonText: 'Ya, Keluar',
          denyButtonText: `Tidak, Kembali`,
        })
        .then((result) => {
          if (result.isConfirmed) {
            Promise.all([
              localStorage.removeItem('user_data'),
              localStorage.removeItem('access_token'),
              dispatch({ type: 'set', user_data: null }),
              dispatch({ type: 'set', access_token: null }),
            ]).then(() => {
              console.log('LOGOUT')
              history.push('/login')
            })
          } else if (result.isDenied) {
            history.goBack()
          } else {
            history.goBack()
          }
        })
    } else {
      console.log('LOGOUT')
      history.push('/login')
    }
  })

  return <div className="bg-light min-vh-100 d-flex flex-row align-items-center"></div>
}

Logout.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
}

export default Logout
