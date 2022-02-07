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
  const [dataTotal, setDataTotal] = React.useState(null)

  const fetchData = React.useCallback(
    (data) => {
      setLoading(true)

      axios({
        method: 'post',
        baseURL: variables.api_base_url,
        url: 'api/cms/faq-category',
        headers: {
          Authorization: access_token,
        },
        data,
      }).then(
        (result) => {
          const { data } = result.data

          let total = 0
          Object.keys(data)?.map((key) => (total += data[key]))

          setData(data ? data : {})
          setDataTotal(total)
          setLoading(false)
        },
        (e) => {
          setData({})
          setDataTotal(null)
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
        <div className="card faq-category">
          <div className="card-body d-flex flex-column">
            <div className="fw-semibold text-primary mb-2">
              <Skeleton width={80} />
            </div>
            <div className="table-responsive">
              <table className="table table-sm table-borderless mb-0">
                <tbody>
                  {[...Array(6)].map((key, idx) => {
                    return (
                      <tr
                        key={idx}
                        className={`${
                          idx === 0 ? 'bg-primary' : idx % 2 === 0 ? 'bg-white' : 'bg-secondary'
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
      <div className="card faq-category">
        <div className="card-body d-flex flex-column">
          <div className="fw-semibold text-primary mb-2">FAQ Category</div>
          <div className="table-responsive">
            <table className="table table-sm table-borderless mb-0">
              <tbody>
                <tr className="bg-primary">
                  <td className="text-white">Total</td>
                  <td className="text-white" align="right">
                    <NumberFormat
                      className={`text-medium`}
                      value={dataTotal !== 0 ? (dataTotal ? dataTotal : '-') : 0}
                      displayType={'text'}
                      thousandSeparator={','}
                    />
                  </td>
                </tr>
                {Object.keys(data).map((key, idx) => {
                  return (
                    <tr key={idx} className={`${idx % 2 === 0 ? 'bg-secondary' : 'bg-white'}`}>
                      <td>
                        <span className={`text-capitalize text-medium`}>
                          {key.split('_').join(' ')}
                        </span>
                      </td>
                      <td align="right">
                        <NumberFormat
                          className={`text-medium`}
                          value={data[key] !== 0 ? (data[key] ? data[key] : '-') : 0}
                          displayType={'text'}
                          thousandSeparator={','}
                        />
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

ReslovedStatus.propTypes = { filter: PropTypes.object }

export default ReslovedStatus
