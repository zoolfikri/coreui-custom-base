import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import NumberFormat from 'react-number-format'

import axios from 'axios'
import Skeleton from 'react-loading-skeleton'

const LeadsAssignedStatus = ({ filter }) => {
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
        url: 'api/cms/leads-assign-status',
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
        <div className="card">
          <div className="card-body d-flex flex-column">
            <div className="fw-semibold text-primary mb-2">
              <Skeleton />
            </div>
            <div className="d-flex justify-content-between align-items-end mt-auto">
              <span className="h2 fw-semibold mb-0">
                <Skeleton width={100} />
              </span>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="card leads-assigned-status">
        <div className="card-body d-flex flex-column">
          <div className="fw-semibold text-primary mb-2">Leads Assigned Status</div>
          <div className="d-flex flex-column align-content-between">
            {/* Leads Assigned */}
            <div className="py-1" style={{ borderBottom: '1px solid #EFF2F6' }}>
              <div className="name">Leads Assigned</div>
              <div className="d-flex justify-content-between">
                <NumberFormat
                  className="percentage"
                  value={
                    data?.leads_assigned_percentage !== 0
                      ? data?.leads_assigned_percentage
                        ? data.leads_assigned_percentage
                        : '-'
                      : 0
                  }
                  displayType={'text'}
                  thousandSeparator={','}
                  suffix="%"
                />
                <NumberFormat
                  className="total"
                  value={
                    data?.leads_assigned_total !== 0
                      ? data?.leads_assigned_total
                        ? data.leads_assigned_total
                        : '-'
                      : 0
                  }
                  displayType={'text'}
                  thousandSeparator={','}
                />
              </div>
            </div>

            {/* Hot Prospect */}
            <div className="py-1" style={{ borderBottom: '1px solid #EFF2F6' }}>
              <div className="name">Hot Prospect</div>
              <div className="d-flex justify-content-between">
                <NumberFormat
                  className="percentage"
                  value={
                    data?.hot_prospect_percentage !== 0
                      ? data?.hot_prospect_percentage
                        ? data.hot_prospect_percentage
                        : '-'
                      : 0
                  }
                  displayType={'text'}
                  thousandSeparator={','}
                  suffix="%"
                />
                <NumberFormat
                  className="total"
                  value={
                    data?.hot_prospect_total !== 0
                      ? data?.hot_prospect_total
                        ? data.hot_prospect_total
                        : '-'
                      : 0
                  }
                  displayType={'text'}
                  thousandSeparator={','}
                />
              </div>
            </div>

            {/* Resolved */}
            <div className="py-1">
              <div className="name">Resolved</div>
              <div className="d-flex justify-content-between">
                <NumberFormat
                  className="percentage"
                  value={
                    data?.resolved_percentage !== 0
                      ? data?.resolved_percentage
                        ? data.resolved_percentage
                        : '-'
                      : 0
                  }
                  displayType={'text'}
                  thousandSeparator={','}
                  suffix="%"
                />
                <NumberFormat
                  className="total"
                  value={
                    data?.resolved_total !== 0
                      ? data?.resolved_total
                        ? data.resolved_total
                        : '-'
                      : 0
                  }
                  displayType={'text'}
                  thousandSeparator={','}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

LeadsAssignedStatus.propTypes = { filter: PropTypes.object }

export default LeadsAssignedStatus
