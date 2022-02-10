import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import NumberFormat from 'react-number-format'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'

import axios from 'axios'
import Skeleton from 'react-loading-skeleton'

const TooltipContent = ({ label, payload }) => {
  return (
    <div className="card">
      <div className="card-body d-flex flex-column">
        <div className="text-title border-bottom pb-2 mb-2">{label}</div>
        <div className="text-body">
          <NumberFormat
            className={`text-medium`}
            value={payload?.[0]?.value !== 0 ? (payload[0]?.value ? payload[0].value : '-') : 0}
            displayType={'text'}
            thousandSeparator={','}
            prefix={'Percentage: '}
            suffix={'%'}
          />
        </div>
        <div className="text-body">
          <NumberFormat
            className={`text-medium`}
            value={
              payload?.[0]?.payload?.count_data !== 0
                ? payload[0]?.payload?.count_data
                  ? payload[0].payload?.count_data
                  : '-'
                : 0
            }
            displayType={'text'}
            thousandSeparator={','}
            prefix={'Count: '}
          />
        </div>
      </div>
    </div>
  )
}
TooltipContent.propTypes = {
  active: PropTypes.bool,
  label: PropTypes.string,
  payload: PropTypes.array,
}

const CustomizedLabel = ({ x, y, height, width, value }) => {
  return (
    <text
      x={x}
      y={y - width / 2}
      width={width}
      height={height}
      offset="5"
      className="recharts-text recharts-label"
      textAnchor="middle"
    >
      <tspan x={x + width / 2} dy="0em">
        {value}%
      </tspan>
    </text>
  )
}
CustomizedLabel.propTypes = {
  x: PropTypes.string,
  y: PropTypes.string,
  height: PropTypes.string,
  width: PropTypes.string,
  value: PropTypes.string,
}

const OverviewDeal = ({ filter }) => {
  const variables = useSelector((state) => state.variables)
  const access_token = useSelector((state) => state.access_token)

  const [loading, setLoading] = React.useState(false)
  const [tableHeader, setTableHeader] = React.useState([])
  const [tableData, setTableData] = React.useState({})
  const [dataChart, setDataChart] = React.useState([])

  const fetchData = React.useCallback(
    (params) => {
      setLoading(true)

      axios({
        method: 'get',
        baseURL: variables.api_base_url,
        url: 'api/cms/overview-dashboard',
        headers: {
          Authorization: access_token,
        },
        params,
      }).then(
        (result) => {
          const { data } = result.data

          const table_header = ['Total']
          let table_data = {}

          Object.keys(data)?.map((key) => {
            if (data[key].data) {
              table_data[key] = { Total: data[key].total }
              data[key].data.map((v) => {
                // Create table header data
                if (!table_header.includes(v.source_group)) {
                  table_header.push(v.source_group)
                }

                // Create table data
                table_data[key][v.source_group] = v.count_data

                return true
              })
            }

            return true
          })

          setTableHeader(table_header)
          setTableData(table_data)
          setDataChart(data?.deals?.data ? data.deals.data : [])
          setLoading(false)
        },
        (e) => {
          setTableHeader([])
          setTableData({})
          setDataChart([])
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
        <div className="card overview-deal">
          <div className="card-body d-flex flex-column">
            <div className="fw-semibold text-primary mb-2">
              <Skeleton width={80} />
            </div>

            <Skeleton height={300} className="mb-3" />

            <div className="table-responsive">
              <table className="table table-sm table-borderless mb-0">
                <tbody>
                  {[...Array(11)].map((key, idx) => {
                    return (
                      <tr
                        key={idx}
                        className={`${
                          idx === 0
                            ? 'bg-primary'
                            : idx === 1
                            ? 'bg-warning'
                            : idx % 2 === 0
                            ? 'bg-white'
                            : 'bg-secondary'
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

  const table_header_blue = []
  tableHeader.map((v) => {
    const split = v.split(' - ')
    if (split.length > 1) {
      const thb_idx = table_header_blue.findIndex((o) => o.name === split[0])

      if (thb_idx > -1) {
        table_header_blue[thb_idx].col++
      } else {
        table_header_blue.push({ name: split[0], col: 1 })
      }
    } else {
      table_header_blue.push({ name: '', col: 1 })
    }
    return true
  })

  return (
    <>
      <div className="card overview-deal">
        <div className="card-body d-flex flex-column">
          <div className="fw-semibold text-primary mb-2">Overview - Deal%</div>
          {/* Chart */}
          <ResponsiveContainer width="100%" height={300} className="mb-3">
            <BarChart
              data={dataChart}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="100%" spreadMethod="reflect">
                  <stop offset="0" stopColor="#F7B500" />
                  <stop offset="1" stopColor="#D0242A" />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="source_group"
                tickFormatter={(e) => {
                  return e.split(' - ')[e.split(' - ').length - 1]
                }}
              />
              <Tooltip content={<TooltipContent />} />
              <Bar
                dataKey="percentage"
                fill="url(#colorUv)"
                maxBarSize={20}
                label={<CustomizedLabel />}
              />
            </BarChart>
          </ResponsiveContainer>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-sm table-borderless mb-0">
              <tbody>
                <tr className="bg-primary">
                  <td></td>
                  {table_header_blue.map((header, index) => (
                    <td
                      key={index}
                      colSpan={header.col}
                      className={`text-center text-white fw-bold ${
                        header.col > 1 ? 'border-bottom-absolute' : ''
                      }`}
                    >
                      {header.name}
                    </td>
                  ))}
                </tr>
                <tr className="bg-warning">
                  <td></td>
                  {tableHeader.map((header, index) => (
                    <td key={index} className="text-center">
                      {header.split(' - ')[header.split(' - ').length - 1]}
                    </td>
                  ))}
                </tr>
                {Object.keys(tableData).map((row, idx_row) => (
                  <tr
                    key={idx_row}
                    className={`${idx_row % 2 === 0 ? 'bg-secondary' : 'bg-white'}`}
                  >
                    <td className="text-capitalize">{row.split('_').join(' ')}</td>
                    {tableHeader.map((header, idx_header) => (
                      <td key={idx_header} className="text-center">
                        <NumberFormat
                          className={`text-medium`}
                          value={
                            tableData?.[row]?.[header] !== 0
                              ? tableData[row][header]
                                ? tableData[row][header]
                                : '-'
                              : 0
                          }
                          displayType={'text'}
                          thousandSeparator={','}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

OverviewDeal.propTypes = { filter: PropTypes.object }

export default OverviewDeal
