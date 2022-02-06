import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

const Visible = ({ when, children }) => {
  if (Boolean(when(useSelector((state) => state.user_data)))) {
    return <>{children}</>
  }

  return <></>
}

Visible.propTypes = { when: PropTypes.func, children: PropTypes.element }

export default Visible
