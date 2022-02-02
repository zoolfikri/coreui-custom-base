import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import ReactTable from 'src/components/custom/ReactTable'

import axios from 'axios'

function Testable() {
  const variables = useSelector((state) => state.variables)
  const access_token = useSelector((state) => state.access_token)

  const columns = React.useMemo(
    () => [
      {
        Header: 'AHM SKU',
        accessor: 'ahm_sku',
      },
      {
        Header: 'MD Type',
        accessor: 'main_dealer_type',
      },
      {
        Header: 'Status',
        accessor: 'status',
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
    ({ pageSize, pageIndex, filters, globalFilter }) => {
      // This will get called when the table needs new data
      // You could fetch your data from literally anywhere,
      // even a server. But for this example, we'll just fake it.

      // Give this fetch an ID
      const fetchId = ++fetchIdRef.current

      // Set the loading state
      setLoading(true)

      // We'll even set a delay to simulate a server here
      // setTimeout(() => {
      //   // Only update the data if this is the latest fetch
      //   if (fetchId === fetchIdRef.current) {
      //     const startRow = pageSize * pageIndex
      //     const endRow = startRow + pageSize
      //     setData(serverData.slice(startRow, endRow))

      //     // Your server could send back total page count.
      //     // For now we'll just fake it, too
      //     setPageCount(Math.ceil(serverData.length / pageSize))

      //     setLoading(false)
      //   }
      // }, 1000)

      let columnFilter = {}
      filters.map((o) => (columnFilter[`filter[${o.id}]`] = o.value))

      axios({
        method: 'get',
        baseURL: variables.api_base_url,
        url: 'api/cms/list-product-variant-tabular',
        headers: {
          Authorization: access_token,
        },
        params: {
          limit: pageSize,
          page: pageIndex + 1,
          mdid: 4,
          filterAll: globalFilter,
          ...columnFilter,
        },
      }).then(
        (result) => {
          if (fetchId === fetchIdRef.current) {
            const { data } = result.data
            // const startRow = pageSize * pageIndex
            // const endRow = startRow + pageSize
            setData(data.data)

            // Your server could send back total page count.
            // For now we'll just fake it, too
            setPageCount(data.last_page)

            setLoading(false)
          }
        },
        (e) => {
          setLoading(false)
        },
      )
    },
    [access_token, variables.api_base_url],
  )

  return (
    <div>
      <ReactTable
        columns={columns}
        data={data}
        fetchData={fetchData}
        loading={loading}
        pageCount={pageCount}
      />
    </div>
  )
}

Testable.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
}

export default Testable
