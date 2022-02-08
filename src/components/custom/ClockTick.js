import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import moment from 'moment'
import 'moment/min/locales'

function Clock({ className }) {
  const [date, setDate] = useState(new Date())

  function refreshClock() {
    setDate(new Date())
  }
  useEffect(() => {
    const timerId = setInterval(refreshClock, 1000)
    return function cleanup() {
      clearInterval(timerId)
    }
  }, [])

  const moment_id = moment(date)
  moment_id.locale('id')

  return <span className={className}>{moment_id.format('D MMMM YYYY HH:mm:ss')}</span>
}

Clock.propTypes = { className: PropTypes.string }

export default Clock
