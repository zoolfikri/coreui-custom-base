import React from 'react'
import PropTypes from 'prop-types'

import { useTable, usePagination, useFilters, useGlobalFilter, useAsyncDebounce } from 'react-table'
import { CDropdown, CDropdownMenu } from '@coreui/react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faSearch,
} from '@fortawesome/free-solid-svg-icons'

function GlobalFilter({ globalFilter, setGlobalFilter }) {
  const [value, setValue] = React.useState(globalFilter)
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined)
  }, 300)

  React.useEffect(() => {
    setValue(globalFilter)
  }, [globalFilter])

  return (
    <input
      className="form-control"
      value={value || ''}
      onChange={(e) => {
        onChange(e.target.value)
        setValue(e.target.value)
      }}
      placeholder={`Search`}
    />
  )
}

GlobalFilter.propTypes = {
  globalFilter: PropTypes.string,
  setGlobalFilter: PropTypes.func,
}

// Let's add a fetchData method to our Table component that will be used to fetch
// new data when pagination state changes
// We can also add a loading state to let our table know it's loading new data
function Table({ columns, data, fetchData, loading, pageCount: controlledPageCount }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    // pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    preGlobalFilteredRows,
    setGlobalFilter,
    setAllFilters,
    // Get the state from the instance
    state: { pageIndex, pageSize, globalFilter, filters },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0 }, // Pass our hoisted table state
      manualPagination: true, // Tell the usePagination
      manualGlobalFilter: true, // Manualy handle global filtering
      manualFilters: true, // Manualy handle filtering
      // hook that we'll handle our own data fetching
      // This means we'll also have to provide our own
      // pageCount.
      pageCount: controlledPageCount,
      autoResetFilters: false, // Control filter manualy
      autoResetGlobalFilter: false, // Control filter manualy
    },
    useFilters, // useFilters!
    useGlobalFilter, // useGlobalFilter!
    usePagination,
  )

  const [showFilterDropdown, setShowFilterDropdown] = React.useState(false)
  const [filterPerColumn, setFilterPerColumn] = React.useState({})

  // Debounce our onFetchData call for 100ms
  const onFetchDataDebounced = useAsyncDebounce(fetchData, 100)

  // Listen for changes in pagination and use the state to fetch our new data
  React.useEffect(() => {
    onFetchDataDebounced({ pageIndex, pageSize, globalFilter, filters })
  }, [onFetchDataDebounced, pageIndex, pageSize, globalFilter, filters])

  // Reset filter per column when global filter is set
  React.useEffect(() => {
    if (globalFilter) {
      setFilterPerColumn({})
      setAllFilters((filtersObjectArray) => [])
    }
  }, [globalFilter, setAllFilters])

  const pageItemCount = 3

  // Render the UI for your table
  return (
    <>
      {/* UI: Filtering */}
      <div className="row mb-3">
        <div className="col-4">
          <div className="input-group-icon input group">
            <FontAwesomeIcon icon={faSearch} className="icon" />
            <GlobalFilter
              preGlobalFilteredRows={preGlobalFilteredRows}
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
            />
            <FontAwesomeIcon
              icon={faChevronDown}
              className="icon cursor-pointer"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            />
          </div>
          <CDropdown
            variant="dropdown"
            visible={showFilterDropdown}
            onHide={() => setShowFilterDropdown(false)}
          >
            <CDropdownMenu className="container px-5 py-3">
              <div className="mb-4 text-title fw-bold text-primary">Filter</div>
              {headerGroups.map((headerGroup, headerGroup_idx) =>
                headerGroup.headers.map((column, column_idx) => (
                  <input
                    key={`${headerGroup_idx} ${column_idx}`}
                    className="form-control mb-3"
                    placeholder={column.render('Header')}
                    value={filterPerColumn?.[column.id] ? filterPerColumn[column.id] : ''}
                    onChange={(e) =>
                      setFilterPerColumn((prev) => {
                        return { ...prev, [column.id]: e.target.value }
                      })
                    }
                  />
                )),
              )}
              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-outline-primary me-2"
                  style={{ minWidth: '94px' }}
                  onClick={() => {
                    setFilterPerColumn({})
                    setGlobalFilter('')
                    setAllFilters((filtersObjectArray) => [])
                    setShowFilterDropdown(false)
                  }}
                >
                  Hapus
                </button>
                <button
                  className="btn btn-primary"
                  style={{ minWidth: '94px' }}
                  onClick={() => {
                    const allFilters = []
                    Object.keys(filterPerColumn).map((key, idx) =>
                      allFilters.push({ id: key, value: filterPerColumn[key] }),
                    )
                    setGlobalFilter('')
                    setAllFilters((filtersObjectArray) => allFilters)
                    setShowFilterDropdown(false)
                  }}
                >
                  Cari
                </button>
              </div>
            </CDropdownMenu>
          </CDropdown>
        </div>
        <div className="col"></div>
      </div>

      {/* UI: Table */}
      <div className="table-responsive">
        <table {...getTableProps()} className="table table-general">
          <thead>
            {headerGroups.map((headerGroup, headerGroup_idx) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup_idx}>
                {headerGroup.headers.map((column, column_idx) => (
                  <th {...column.getHeaderProps()} key={column_idx}>
                    {column.render('Header')}
                    <span>{column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}</span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row, i) => {
              prepareRow(row)
              return (
                <tr {...row.getRowProps()} key={i}>
                  {row.cells.map((cell, cell_idx) => {
                    return (
                      <td {...cell.getCellProps()} key={cell_idx}>
                        {cell.render('Cell')}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
            <tr>
              {loading ? (
                // Use our custom loading state to show a loading indicator
                <td colSpan="10000">Loading...</td>
              ) : (
                <td colSpan="10000">
                  Showing {page.length} of ~{controlledPageCount * pageSize} results
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </div>

      {/* UI: Pagination */}
      <div className="row g-3 justify-content-md-center align-items-center">
        <div className="col-auto">
          <div className="pagination-general">
            <button className="btn" onClick={() => previousPage()} disabled={!canPreviousPage}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button
              className={`btn ${pageIndex === 0 ? 'active' : ''}`}
              onClick={() => gotoPage(0)}
              // disabled={!canPreviousPage}
            >
              1
            </button>
            {pageIndex - pageItemCount < 2 ? '' : '...'}
            {[...Array(pageItemCount)].map((v, i) => {
              const this_pageIndex = pageIndex - pageItemCount + i
              if (this_pageIndex > 0) {
                return (
                  <button
                    key={i}
                    className={`btn ${this_pageIndex === pageIndex ? 'active' : ''}`}
                    onClick={() => gotoPage(this_pageIndex)}
                    disabled={this_pageIndex < 1}
                  >
                    {this_pageIndex + 1}
                  </button>
                )
              }

              return false
            })}

            {[...Array(pageItemCount)].map((v, i) => {
              const this_pageIndex = pageIndex + i
              if (this_pageIndex < pageCount - 1 && this_pageIndex > 0) {
                return (
                  <button
                    key={i}
                    className={`btn ${this_pageIndex === pageIndex ? 'active' : ''}`}
                    onClick={() => gotoPage(this_pageIndex)}
                    disabled={this_pageIndex > pageCount - 1}
                  >
                    {this_pageIndex + 1}
                  </button>
                )
              }

              return false
            })}
            {pageItemCount + pageIndex >= pageCount - 1 ? '' : '...'}
            {pageCount > 1 ? (
              <button
                className={`btn ${pageIndex === pageCount - 1 ? 'active' : ''}`}
                onClick={() => gotoPage(pageCount - 1)}
                // disabled={!canNextPage}
              >
                {pageCount}
              </button>
            ) : (
              ''
            )}
            <button className="btn" onClick={() => nextPage()} disabled={!canNextPage}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
        {/* <div className="col-auto">
          <span>
            Page{' '}
            <strong>
              {pageIndex + 1} of {pageOptions.length}
            </strong>{' '}
          </span>
        </div> */}
        {/* <div className="col-auto">
          <span>
            | Go to page:{' '}
            <input
              type="number"
              defaultValue={pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0
                gotoPage(page)
              }}
              style={{ width: '100px' }}
            />
          </span>
        </div> */}
        <div className="col-auto">
          <div className="row g-2 align-items-center">
            <div className="col-auto">
              <select
                id="pageSize"
                className="form-select me-2"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                }}
              >
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-auto">
              <label htmlFor="pageSize" className="col-form-label">
                Baris
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

Table.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  fetchData: PropTypes.func,
  loading: PropTypes.bool,
  pageCount: PropTypes.number,
}

export default Table
