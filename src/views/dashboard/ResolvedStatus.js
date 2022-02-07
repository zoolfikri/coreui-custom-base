import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import NumberFormat from 'react-number-format'

import axios from 'axios'
import Skeleton from 'react-loading-skeleton'

const ReslovedStatus = ({ filter }) => {
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
        url: 'api/cms/resolved-status',
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
        <div className="card resolved-status">
          <div className="card-body d-flex flex-column">
            <div className="fw-semibold text-primary mb-2">
              <Skeleton />
            </div>
            <div className="table-responsive">
              <table className="table table-sm table-borderless mb-0">
                <tbody>
                  {[...Array(6)].map((key, idx) => {
                    return (
                      <tr
                        key={idx}
                        className={`${
                          idx === 0 ? 'bg-warning' : idx % 2 === 0 ? 'bg-secondary' : 'bg-white'
                        }`}
                      >
                        <td>
                          <Skeleton />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="card resolved-status">
        <div className="card-body d-flex flex-column">
          <div className="fw-semibold text-primary mb-2">Resolved Status</div>
          <div className="table-responsive">
            <table className="table table-sm table-borderless mb-0">
              <tbody>
                {Object.keys(data).map((key, idx) => {
                  if (key !== 'closed_by_system') {
                    return (
                      <tr
                        key={idx}
                        className={`${
                          idx === 0 ? 'bg-warning' : idx % 2 === 0 ? 'bg-secondary' : 'bg-white'
                        }`}
                      >
                        <td>
                          <span
                            className={`text-capitalize text-small ${
                              idx === 0 ? 'fw-semibold' : ''
                            }`}
                          >
                            {key.split('_').join(' ')}
                          </span>
                        </td>
                        <td align="right">
                          <NumberFormat
                            className={`text-small ${idx === 0 ? 'fw-semibold' : ''}`}
                            value={data[key] !== 0 ? (data[key] ? data[key] : '-') : 0}
                            displayType={'text'}
                            thousandSeparator={','}
                          />
                        </td>
                      </tr>
                    )
                  }

                  return <></>
                })}
                <tr>
                  <td colSpan={2}>
                    <span
                      className="text-capitalize text-small fst-italic"
                      style={{ color: '#A3A3A3' }}
                    >
                      Closed by system:{' '}
                      <NumberFormat
                        value={
                          data?.closed_by_system !== 0
                            ? data?.closed_by_system
                              ? data?.closed_by_system
                              : '-'
                            : 0
                        }
                        displayType={'text'}
                        thousandSeparator={','}
                      />
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

ReslovedStatus.propTypes = { filter: PropTypes.object }

export default ReslovedStatus
