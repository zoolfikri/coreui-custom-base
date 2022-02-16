import React from 'react'
import PropTypes from 'prop-types'

import {
  useTable,
  usePagination,
  useFilters,
  useGlobalFilter,
  useRowSelect,
  useAsyncDebounce,
} from 'react-table'
import { CDropdown, CDropdownMenu } from '@coreui/react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faSearch,
  faMinus,
} from '@fortawesome/free-solid-svg-icons'

const month_options = [
  { id: 1, name: 'Januari' },
  { id: 2, name: 'Februari' },
  { id: 3, name: 'Maret' },
  { id: 4, name: 'April' },
  { id: 5, name: 'Mei' },
  { id: 6, name: 'Juni' },
  { id: 7, name: 'Juli' },
  { id: 8, name: 'Agustus' },
  { id: 9, name: 'September' },
  { id: 10, name: 'Oktober' },
  { id: 11, name: 'November' },
  { id: 12, name: 'Desember' },
]

function deepCompare() {
  var i, l, leftChain, rightChain

  function compare2Objects(x, y) {
    var p

    // remember that NaN === NaN returns false
    // and isNaN(undefined) returns true
    if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
      return true
    }

    // Compare primitives and functions.
    // Check if both arguments link to the same object.
    // Especially useful on the step where we compare prototypes
    if (x === y) {
      return true
    }

    // Works in case when functions are created in constructor.
    // Comparing dates is a common scenario. Another built-ins?
    // We can even handle functions passed across iframes
    if (
      (typeof x === 'function' && typeof y === 'function') ||
      (x instanceof Date && y instanceof Date) ||
      (x instanceof RegExp && y instanceof RegExp) ||
      (x instanceof String && y instanceof String) ||
      (x instanceof Number && y instanceof Number)
    ) {
      return x.toString() === y.toString()
    }

    // At last checking prototypes as good as we can
    if (!(x instanceof Object && y instanceof Object)) {
      return false
    }

    if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
      return false
    }

    if (x.constructor !== y.constructor) {
      return false
    }

    if (x.prototype !== y.prototype) {
      return false
    }

    // Check for infinitive linking loops
    if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
      return false
    }

    // Quick checking of one object being a subset of another.
    // todo: cache the structure of arguments[0] for performance
    for (p in y) {
      if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
        return false
      } else if (typeof y[p] !== typeof x[p]) {
        return false
      }
    }

    for (p in x) {
      if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
        return false
      } else if (typeof y[p] !== typeof x[p]) {
        return false
      }

      switch (typeof x[p]) {
        case 'object':
        case 'function':
          leftChain.push(x)
          rightChain.push(y)

          if (!compare2Objects(x[p], y[p])) {
            return false
          }

          leftChain.pop()
          rightChain.pop()
          break

        default:
          if (x[p] !== y[p]) {
            return false
          }
          break
      }
    }

    return true
  }

  if (arguments.length < 1) {
    return true //Die silently? Don't know how to handle such case, please help...
    // throw "Need two or more arguments to compare";
  }

  for (i = 1, l = arguments.length; i < l; i++) {
    leftChain = [] //Todo: this can be cached
    rightChain = []

    if (!compare2Objects(arguments[0], arguments[i])) {
      return false
    }
  }

  return true
}

function DefaultColumnFilter({ setFilterPerColumn, filterPerColumn, column }) {
  return (
    <input
      className="form-control mb-3"
      placeholder={column.render('Header')}
      value={filterPerColumn?.[column.id] ? filterPerColumn[column.id] : ''}
      onChange={(e) =>
        setFilterPerColumn((prev) => {
          return { ...prev, [column.id]: e.target.value }
        })
      }
    />
  )
}
DefaultColumnFilter.propTypes = {
  setFilterPerColumn: PropTypes.func,
  filterPerColumn: PropTypes.object,
  column: PropTypes.object,
}

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

const IndeterminateCheckbox = React.forwardRef(({ indeterminate, ...rest }, ref) => {
  const defaultRef = React.useRef()
  const resolvedRef = ref || defaultRef

  React.useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate
  }, [resolvedRef, indeterminate])

  return (
    <>
      <input type="checkbox" ref={resolvedRef} {...rest} />
    </>
  )
})
IndeterminateCheckbox.displayName = 'IndeterminateCheckbox'
IndeterminateCheckbox.propTypes = {
  indeterminate: PropTypes.any,
  getToggleAllPageRowsSelectedProps: PropTypes.any,
  row: PropTypes.shape({
    getToggleRowSelectedProps: PropTypes.func,
  }),
}

// Let's add a fetchData method to our Table component that will be used to fetch
// new data when pagination state changes
// We can also add a loading state to let our table know it's loading new data
function Table({
  columns,
  data,
  fetchData,
  loading,
  pageCount: controlledPageCount,
  selectableRow = false,
  getSelectedRows,
  rowId,
  tableClassName,
  showDateFilter,
  pageLimit,
}) {
  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
    }),
    [],
  )

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
    selectedFlatRows,
    // Get the state from the instance
    state: { pageIndex, pageSize, globalFilter, filters, selectedRowIds },
  } = useTable(
    {
      columns,
      data,
      defaultColumn, // Be sure to pass the defaultColumn option
      initialState: { pageIndex: 0, pageSize: pageLimit ? pageLimit : 10 }, // Pass our hoisted table state
      manualPagination: true, // Tell the usePagination
      manualGlobalFilter: true, // Manualy handle global filtering
      manualFilters: true, // Manualy handle filtering
      // hook that we'll handle our own data fetching
      // This means we'll also have to provide our own
      // pageCount.
      pageCount: controlledPageCount,
      autoResetFilters: false, // Control filter manualy
      autoResetGlobalFilter: false, // Control filter manualy
      autoResetSelectedRows: false, // Control selected rows manualy
      getRowId: (row) => row[rowId ? rowId : 'id'],
    },
    useFilters, // useFilters!
    useGlobalFilter, // useGlobalFilter!
    usePagination,
    useRowSelect,
    (hooks) => {
      if (!selectableRow) {
        return false
      }
      hooks.visibleColumns.push((columns) => [
        // Let's make a column for selection
        {
          id: 'selection',
          // The header can use the table's getToggleAllRowsSelectedProps method
          // to render a checkbox
          Header: ({ getToggleAllPageRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox {...getToggleAllPageRowsSelectedProps()} />
            </div>
          ),
          // The cell can use the individual row's getToggleRowSelectedProps method
          // to the render a checkbox
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ])
    },
  )

  const [showFilterDropdown, setShowFilterDropdown] = React.useState(false)
  const [filterPerColumn, setFilterPerColumn] = React.useState({})
  const [tempSelectedRows, setTempSelectedRows] = React.useState({})
  const [filterDate, setFilterDate] = React.useState({
    start_month: new Date().getMonth() + 1,
    end_month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  })

  // Debounce our onFetchData call for 100ms
  const onFetchDataDebounced = useAsyncDebounce(fetchData, 100)

  // Listen for changes in pagination and use the state to fetch our new data debounced
  React.useEffect(() => {
    let formatedFilters = { ...(showDateFilter ? filterDate : {}), filterAll: globalFilter }
    filters.map((o) => (formatedFilters[`filter[${o.id}]`] = o.value))
    // console.log('formatedFilters', formatedFilters)
    onFetchDataDebounced({
      pageIndex,
      pageSize,
      globalFilter,
      filters,
      filterDate,
      formatedFilters,
    })
  }, [onFetchDataDebounced, pageIndex, pageSize, globalFilter, filters, filterDate, showDateFilter])

  // Reset filter per column when global filter is set
  React.useEffect(() => {
    if (globalFilter) {
      setFilterPerColumn({})
      setAllFilters((filtersObjectArray) => [])
    }
  }, [globalFilter, setAllFilters])

  // Listen for selected rows
  React.useEffect(() => {
    // console.log('selectedRowIds', selectedRowIds)
    // console.log('selectedFlatRows', selectedFlatRows)
    // console.log('tempSelectedRows', tempSelectedRows)
    if (deepCompare(Object.keys(tempSelectedRows), Object.keys(selectedRowIds))) {
      // console.log('DEEP COMPARE TRUE')
    } else {
      // console.log('DEEP COMPARE FALSE')
      let temp = {}
      Object.keys(selectedRowIds).map((key) => {
        if (tempSelectedRows[key]) {
          temp[key] = tempSelectedRows[key]
        } else {
          const sfr_idx = selectedFlatRows.findIndex((o) => String(o.id) === String(key))
          if (sfr_idx > -1) {
            temp[key] = selectedFlatRows[sfr_idx].original
          }
        }
        return true
      })
      setTempSelectedRows(temp)
    }
  }, [selectedRowIds, tempSelectedRows, selectedFlatRows])

  React.useEffect(() => {
    // console.log('!!! HOOK getSelectedRows')
    if (getSelectedRows) {
      const returnedRows = []
      Object.keys(tempSelectedRows).map((key) => returnedRows.push(tempSelectedRows[key]))
      getSelectedRows(returnedRows)
    }
  }, [getSelectedRows, tempSelectedRows])

  const pageItemCount = 3

  // Render the UI for your table
  return (
    <>
      {/* UI: Filtering */}
      <div className="row mb-3">
        <div className="col-6 col-md-4">
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
                headerGroup.headers.map((column, column_idx) => {
                  if (column?.filterable) {
                    if (column.Filter) {
                      return column.render('Filter', { setFilterPerColumn, filterPerColumn })
                    }
                    // else {
                    //   return (
                    //     <input
                    //       key={`${headerGroup_idx} ${column_idx}`}
                    //       className="form-control mb-3"
                    //       placeholder={column.render('Header')}
                    //       value={filterPerColumn?.[column.id] ? filterPerColumn[column.id] : ''}
                    //       onChange={(e) =>
                    //         setFilterPerColumn((prev) => {
                    //           return { ...prev, [column.id]: e.target.value }
                    //         })
                    //       }
                    //     />
                    //   )
                    // }
                  }

                  return <></>
                }),
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
        <div className="col-6 col-md"></div>
        <div className="col-auto">
          {showDateFilter ? (
            <form className="row row-cols-auto g-2 align-items-center">
              <div className="col">
                <label className="visually-hidden" htmlFor="start_month">
                  Start Month
                </label>
                <select
                  id="start_month"
                  className="form-select"
                  onChange={(e) => {
                    let currentFilterDate = { ...filterDate }
                    currentFilterDate[e.target.id] = e.target.value
                    setFilterDate(currentFilterDate)
                  }}
                  value={filterDate['start_month']}
                >
                  {month_options.map((month, month_idx) => (
                    <option value={String(month.id)} key={month_idx}>
                      {month.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col">
                <FontAwesomeIcon icon={faMinus} />
              </div>
              <div className="col">
                <label className="visually-hidden" htmlFor="end_month">
                  End Month
                </label>
                <select
                  id="end_month"
                  className="form-select"
                  onChange={(e) => {
                    let currentFilterDate = { ...filterDate }
                    currentFilterDate[e.target.id] = e.target.value
                    setFilterDate(currentFilterDate)
                  }}
                  value={filterDate['end_month']}
                >
                  {month_options.map((month, month_idx) => (
                    <option value={String(month.id)} key={month_idx}>
                      {month.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col">
                <label className="visually-hidden" htmlFor="end_yearmonth">
                  Year
                </label>
                <select
                  id="year"
                  className="form-select"
                  onChange={(e) => {
                    let currentFilterDate = { ...filterDate }
                    currentFilterDate[e.target.id] = e.target.value
                    setFilterDate(currentFilterDate)
                  }}
                  value={filterDate['year']}
                >
                  {Array.from(Array(4), (e, year_idx) => (
                    <option
                      value={String(parseInt(year_idx + new Date().getFullYear() - 3))}
                      key={year_idx}
                    >
                      {year_idx + new Date().getFullYear() - 3}
                    </option>
                  ))}
                </select>
              </div>
            </form>
          ) : (
            ''
          )}
        </div>
      </div>

      {/* UI: Table */}
      <div className="table-responsive">
        <table
          {...getTableProps()}
          className={`${tableClassName ? tableClassName : 'table table-general'}`}
        >
          <thead>
            {headerGroups.map((headerGroup, headerGroup_idx) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup_idx}>
                {headerGroup.headers.map((column, column_idx) => (
                  <th {...column.getHeaderProps()} className={column.THClassName} key={column_idx}>
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
                      <td
                        className={cell.column.TDClassName}
                        {...cell.getCellProps()}
                        key={cell_idx}
                      >
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
            <button
              className="btn"
              onClick={() => previousPage()}
              disabled={!canPreviousPage || loading}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button
              className={`btn ${pageIndex === 0 ? 'active' : ''}`}
              onClick={() => gotoPage(0)}
              // disabled={!canPreviousPage}
              disabled={loading}
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
                    disabled={this_pageIndex < 1 || loading}
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
                    disabled={this_pageIndex > pageCount - 1 || loading}
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
                disabled={loading}
              >
                {pageCount}
              </button>
            ) : (
              ''
            )}
            <button className="btn" onClick={() => nextPage()} disabled={!canNextPage || loading}>
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
                disabled={loading}
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
  pageLimit: PropTypes.number,
  selectableRow: PropTypes.bool,
  getSelectedRows: PropTypes.func,
  getToggleAllPageRowsSelectedProps: PropTypes.any,
  row: PropTypes.any,
  rowId: PropTypes.string,
  tableClassName: PropTypes.string,
  showDateFilter: PropTypes.bool,
}

export default Table
