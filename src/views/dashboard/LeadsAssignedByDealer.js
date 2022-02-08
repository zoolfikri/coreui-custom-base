import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { useAsyncDebounce } from 'react-table'

import NumberFormat from 'react-number-format'
import Skeleton from 'react-loading-skeleton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronLeft,
  faChevronRight,
  faCircleNotch,
  faDownload,
  faSearch,
} from '@fortawesome/free-solid-svg-icons'

import axios from 'axios'
import moment from 'moment'
import sweetalert2 from 'src/components/custom/Sweetalert2'
import FileDownload from 'js-file-download'

const LoadingComponent = () => {
  return (
    <>
      {[...Array(5)].map((o, idx_1) => (
        <tr key={idx_1} className={`text-small ${idx_1 % 2 === 0 ? 'bg-secondary' : 'bg-white'}`}>
          {[...Array(10)].map((o, idx_2) => (
            <td key={idx_2} className="text-center">
              <Skeleton />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

const LeadsAssignedByDealer = ({ filter }) => {
  const variables = useSelector((state) => state.variables)
  const access_token = useSelector((state) => state.access_token)

  const [data, setData] = React.useState([])
  const [loadingData, setLoadingData] = React.useState(false)
  const [loadingDownload, setLoadingDownload] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [searchParam, setSearchParam] = React.useState('')
  const [rd_codes, setRd_codes] = React.useState([])

  const fetchData = React.useCallback(
    ({ dataFilter, page }) => {
      setLoadingData(true)

      axios({
        method: 'post',
        baseURL: variables.api_base_url,
        url: 'api/cms/leads-assign-by',
        headers: {
          Authorization: access_token,
        },
        data: {
          limit: 5,
          offset: page,
          ...dataFilter,
        },
      }).then(
        (result) => {
          const { data } = result.data

          setData(data ? data : [])
          setLoadingData(false)

          // Create RD Code array for download parameter
          const rd_codes = []
          data?.map((o) => rd_codes.push(o.rd_code))
          setRd_codes(rd_codes)
        },
        (e) => {
          setData([])
          setLoadingData(false)
        },
      )
    },
    [access_token, variables.api_base_url],
  )

  const downloadData = (params = {}) => {
    setLoadingDownload(true)

    axios({
      method: 'put',
      baseURL: variables.api_base_url,
      url: 'api/cms/download-leads-assign-by',
      headers: {
        Authorization: access_token,
      },
      data: params,
      responseType: 'blob',
    }).then(
      (result) => {
        const file = result.data

        FileDownload(file, `Leads Assigned by Dealer - ${moment().format('YYYY-MM-DD')}.xlsx`)
        setLoadingDownload(false)
      },
      (e) => {
        setLoadingDownload(false)

        sweetalert2.fire({
          text: 'Maaf, gagal mengunduh berkas',
          icon: 'error',
        })
      },
    )
  }

  const debouncedFetchData = useAsyncDebounce(fetchData, 300)

  React.useEffect(() => {
    debouncedFetchData({ dataFilter: { ...filter, table_filter: searchParam }, page: currentPage })
  }, [debouncedFetchData, filter, currentPage, searchParam])

  return (
    <>
      <div className="card leads-assigned-dealer">
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between">
            <div className="fw-semibold text-primary mb-2">
              Leads Assigned by Dealer{' '}
              <FontAwesomeIcon
                icon={loadingDownload ? faCircleNotch : faDownload}
                className={`ms-2 text-info cursor-pointer`}
                onClick={() => {
                  if (!loadingDownload) {
                    downloadData({ ...filter, rd_code: rd_codes })
                  }
                }}
                spin={loadingDownload}
              />
            </div>
            <div className="d-flex align-items-center">
              <div className="input-group-icon">
                <FontAwesomeIcon icon={faSearch} className="icon fa-xs" />
                <input
                  className="form-control form-control-sm"
                  placeholder="Cari nama dealer"
                  value={searchParam}
                  onChange={(e) => {
                    setCurrentPage(1)
                    setSearchParam(e.target.value)
                  }}
                />
              </div>
              <div className="pagination-general">
                <button
                  className="btn"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <NumberFormat value={currentPage} displayType={'text'} thousandSeparator={','} />
                <button className="btn" onClick={() => setCurrentPage(currentPage + 1)}>
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr className="bg-warning text-small">
                  <th className="align-middle" style={{ width: '150px' }}>
                    Dealer Name
                  </th>
                  <th className="text-center align-middle">Total Leads</th>
                  <th className="text-center align-middle">Assigned</th>
                  <th className="text-center align-middle">Delivered</th>
                  <th className="text-center align-middle">First Response</th>
                  <th className="text-center align-middle">Hot Prospects</th>
                  <th className="text-center align-middle">Resolved</th>
                  <th className="text-center align-middle">Deals</th>
                  <th className="text-center align-middle">Deals by SSU</th>
                  <th className="text-center align-middle">Sisa Leads</th>
                </tr>
              </thead>
              <tbody>
                {loadingData ? (
                  <LoadingComponent />
                ) : data?.length ? (
                  data?.map((o, idx) => (
                    <tr
                      key={idx}
                      className={`text-small ${idx % 2 === 0 ? 'bg-secondary' : 'bg-white'}`}
                    >
                      <td>{o.name}</td>
                      <td className="text-center">
                        <NumberFormat
                          value={o.total_leads !== 0 ? (o.total_leads ? o.total_leads : '-') : 0}
                          displayType={'text'}
                          thousandSeparator={','}
                        />
                      </td>
                      <td className="text-center">
                        <NumberFormat
                          value={o.assigned !== 0 ? (o.assigned ? o.assigned : '-') : 0}
                          displayType={'text'}
                          thousandSeparator={','}
                        />
                      </td>
                      <td className="text-center">
                        <NumberFormat
                          value={o.delivered !== 0 ? (o.delivered ? o.delivered : '-') : 0}
                          displayType={'text'}
                          thousandSeparator={','}
                        />
                      </td>
                      <td className="text-center">
                        <NumberFormat
                          value={
                            o.first_respond !== 0 ? (o.first_respond ? o.first_respond : '-') : 0
                          }
                          displayType={'text'}
                          thousandSeparator={','}
                        />
                      </td>
                      <td className="text-center">
                        <NumberFormat
                          value={o.prospect !== 0 ? (o.prospect ? o.prospect : '-') : 0}
                          displayType={'text'}
                          thousandSeparator={','}
                        />
                      </td>
                      <td className="text-center">
                        <NumberFormat
                          value={o.resolved !== 0 ? (o.resolved ? o.resolved : '-') : 0}
                          displayType={'text'}
                          thousandSeparator={','}
                        />
                      </td>
                      <td className="text-center">
                        <NumberFormat
                          value={o.deals !== 0 ? (o.deals ? o.deals : '-') : 0}
                          displayType={'text'}
                          thousandSeparator={','}
                        />
                      </td>
                      <td className="text-center">
                        <NumberFormat
                          value={o.deal_by_ssu !== 0 ? (o.deal_by_ssu ? o.deal_by_ssu : '-') : 0}
                          displayType={'text'}
                          thousandSeparator={','}
                        />
                      </td>
                      <td className="text-center">
                        <NumberFormat
                          value={o.sisa_leads !== 0 ? (o.sisa_leads ? o.sisa_leads : '-') : 0}
                          displayType={'text'}
                          thousandSeparator={','}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="text-small">
                    <td colSpan={99} className="fst-italic">
                      Tidak ada data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

LeadsAssignedByDealer.propTypes = { filter: PropTypes.object }

export default LeadsAssignedByDealer
