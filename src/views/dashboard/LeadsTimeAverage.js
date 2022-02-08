import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import NumberFormat from 'react-number-format'

import axios from 'axios'
import Skeleton from 'react-loading-skeleton'

const LeadsTimeAverage = ({ filter }) => {
  const variables = useSelector((state) => state.variables)
  const access_token = useSelector((state) => state.access_token)

  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState({})

  const fetchData = React.useCallback(
    (data) => {
      setLoading(true)

      axios({
        method: 'post',
        baseURL: variables.api_base_url,
        url: 'api/cms/lead-time-average',
        headers: {
          Authorization: access_token,
        },
        data,
      }).then(
        (result) => {
          const { data } = result.data

          setData(data ? data : {})
          setLoading(false)
        },
        (e) => {
          setData({})
          setLoading(false)
        },
      )
    },
    [access_token, variables.api_base_url],
  )

  React.useEffect(() => {
    fetchData(filter)
  }, [fetchData, filter])

  if (loading) {
    return (
      <>
        <div className="card leads-time-average">
          <div className="card-body d-flex flex-column">
            <div className="fw-semibold text-primary mb-2">
              <Skeleton />
            </div>
            <div className="d-flex flex-column align-content-between">
              {/* Average Blast Lead Time */}
              <div className="py-3" style={{ borderBottom: '1px solid #EFF2F6' }}>
                <div className="name mb-2">
                  <Skeleton />
                </div>
                <div className="d-flex justify-content-between">
                  <Skeleton className="total" width={50} />
                </div>
              </div>

              {/* Average Resolve Lead Time */}
              <div className="pt-3">
                <div className="name mb-2">
                  <Skeleton />
                </div>
                <div className="d-flex justify-content-between">
                  <Skeleton className="total" width={50} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="card leads-time-average">
        <div className="card-body d-flex flex-column">
          <div className="fw-semibold text-primary mb-2">Lead Time Average</div>
          <div className="d-flex flex-column align-content-between">
            {/* Average Blast Lead Time */}
            <div className="py-3" style={{ borderBottom: '1px solid #EFF2F6' }}>
              <div className="name mb-2">Average Blast Lead Time</div>
              <div className="d-flex justify-content-between">
                <NumberFormat
                  className="total"
                  value={
                    data?.average_blast !== 0 ? (data?.average_blast ? data.average_blast : '-') : 0
                  }
                  displayType={'text'}
                  thousandSeparator={','}
                  suffix={' Hari'}
                />
              </div>
            </div>

            {/* Average Resolve Lead Time */}
            <div className="pt-3">
              <div className="name mb-2">Average Resolve Lead Time</div>
              <div className="d-flex justify-content-between">
                <NumberFormat
                  className="total"
                  value={
                    data?.average_resolve !== 0
                      ? data?.average_resolve
                        ? data.average_resolve
                        : '-'
                      : 0
                  }
                  displayType={'text'}
                  thousandSeparator={','}
                  suffix={' Hari'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

LeadsTimeAverage.propTypes = { filter: PropTypes.object }

export default LeadsTimeAverage
