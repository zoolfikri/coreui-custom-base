import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import ReactTable from 'src/components/custom/ReactTable'
import DatePicker from 'react-datepicker'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

import axios from 'axios'
import moment from 'moment'

function LeadsToConvert() {
  const variables = useSelector((state) => state.variables)
  const access_token = useSelector((state) => state.access_token)

  const columns = React.useMemo(
    () => [
      {
        Header: 'Tanggal Chat',
        accessor: 'created_at',
        filterable: true,
        Cell: ({ row: { original } }) =>
          original?.created_at ? moment(original?.created_at).format('DD-MMM') : '-',
        Filter: ({ setFilterPerColumn, filterPerColumn, column }) => {
          return (
            <>
              <DatePicker
                className="form-control mb-3"
                placeholderText={column.render('Header')}
                selected={
                  filterPerColumn?.[column.id]
                    ? moment(filterPerColumn[column.id], 'YYYY-MM-DD').toDate()
                    : ''
                }
                onChange={(date) =>
                  setFilterPerColumn((prev) => {
                    return { ...prev, [column.id]: moment(date).format('YYYY-MM-DD') }
                  })
                }
                maxDate={new Date()}
                shouldCloseOnSelect={false}
              />
            </>
          )
        },
      },
      {
        Header: 'Nama Customer',
        accessor: 'name',
        filterable: true,
        Cell: ({ row: { original } }) => (
          <Link
            to={'/hotleads/leads-to-convert/' + original.id}
            className="text-decoration-none text-info"
          >
            {original.is_handled_by_bot ? '' : <FontAwesomeIcon icon={faCheck} />} {original.name}
          </Link>
        ),
      },
      {
        Header: 'No Hp',
        accessor: 'mobile_phone_number',
        filterable: true,
      },
      {
        Header: 'Alamat',
        accessor: 'address',
        filterable: true,
      },
      {
        Header: 'Sumber Leads',
        accessor: 'source',
        filterable: true,
      },
      {
        Header: 'Dealer Pilihan',
        accessor: 'retail_name',
        filterable: true,
      },
      {
        Header: 'Status Terakhir',
        accessor: 'stage',
        headerClassName: 'text-left',
        filterable: true,
      },
      {
        Header: 'Durasi*',
        accessor: 'updated_at',
        Cell: ({ row: { original } }) =>
          moment(original?.updated_at, 'YYYY-MM-DD hh:mm:ss').fromNow(true),
      },
    ],
    [],
  )

  // We'll start our table without any data
  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [pageCount, setPageCount] = React.useState(0)
  const fetchIdRef = React.useRef(0)

  const fetchData = React.useCallback(
    ({ pageSize, pageIndex, formatedFilters }) => {
      const fetchId = ++fetchIdRef.current

      if (fetchId === fetchIdRef.current) {
        // Set the loading state
        setLoading(true)

        axios({
          method: 'post',
          baseURL: variables.api_base_url,
          url: 'api/cms/get-customer-data-non-ro',
          headers: {
            Authorization: access_token,
          },
          params: {
            limit: pageSize,
            page: pageIndex + 1,
            ...formatedFilters,
          },
          data: {
            main_dealer_id: variables.main_dealer_id,
          },
        }).then(
          (result) => {
            const { data } = result.data
            // const startRow = pageSize * pageIndex
            // const endRow = startRow + pageSize
            setData(data?.data ? data.data : [])

            // Your server could send back total page count.
            // For now we'll just fake it, too
            setPageCount(data?.last_page)

            setLoading(false)
          },
          (e) => {
            setLoading(false)
          },
        )
      }
    },
    [access_token, variables.api_base_url, variables.main_dealer_id],
  )

  return (
    <div>
      <ReactTable
        columns={columns}
        data={data}
        fetchData={fetchData}
        loading={loading}
        pageCount={pageCount}
        showDateFilter
      />
    </div>
  )
}

LeadsToConvert.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  // ReactTable Cell props
  row: PropTypes.object,
  // ReactTable Filter props
  column: PropTypes.object,
  setFilterPerColumn: PropTypes.func,
  filterPerColumn: PropTypes.object,
}

export default LeadsToConvert
