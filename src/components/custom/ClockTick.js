import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

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
  return <span className={className}>{date.toLocaleTimeString()}</span>
}

Clock.propTypes = { className: PropTypes.string }

export default Clock
