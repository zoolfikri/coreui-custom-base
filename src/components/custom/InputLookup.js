import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'

import {
  CModal,
  CModalHeader,
  //  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
} from '@coreui/react'
import ReactTable from 'src/components/custom/ReactTable'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faCheck } from '@fortawesome/free-solid-svg-icons'

import sweetalert2 from 'src/components/custom/Sweetalert2'
import axios from 'axios'

const InputLookup = ({
  id,
  inputClassName,
  buttonClassName,
  tableClassName,
  displayValue,
  onChange,
  requestConfig,
  tableColumns,
  tableDataKey,
  tablePagesKey,
}) => {
  const [visible, setVisible] = useState(false)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageCount, setPageCount] = useState(0)

  const fetchData = useCallback(
    ({ pageSize, pageIndex, formatedFilters }) => {
      setLoading(true)

      axios({
        ...requestConfig,
        params: {
          limit: pageSize,
          page: pageIndex + 1,
          ...formatedFilters,
          ...(requestConfig?.params && typeof requestConfig?.params === 'object'
            ? requestConfig?.params
            : {}),
        },
        data: {
          ...(requestConfig?.data && typeof requestConfig?.data === 'object'
            ? requestConfig?.data
            : {}),
        },
      }).then(
        (result) => {
          const data = result.data

          const tableDataKeys = tableDataKey.split('.')
          const tableData = tableDataKeys.reduce((value, entry) => value[entry], data)
          const tablePagesKeys = tablePagesKey.split('.')
          const tablePages = tablePagesKeys.reduce((value, entry) => value[entry], data)

          setData(Array.isArray(tableData) ? tableData : [])
          setPageCount(isNaN(tablePages) ? 0 : tablePages)
          setLoading(false)
        },
        (e) => {
          sweetalert2.fire({
            text: e.message || e.status,
            icon: 'error',
          })

          setData([])
          setPageCount(0)
          setLoading(false)
        },
      )
    },
    [requestConfig, tableDataKey, tablePagesKey],
  )

  return (
    <>
      <div className="input-group">
        <button
          className={`${buttonClassName ? buttonClassName : 'btn btn-outline-primary'}`}
          type="button"
          id={id}
          onClick={() => setVisible(!visible)}
        >
          <FontAwesomeIcon icon={faSearch} />
        </button>
        <input
          type="text"
          className={`${inputClassName ? inputClassName : 'form-control'}`}
          value={displayValue ? displayValue : ''}
          onChange={() => {
            return true
          }}
          aria-describedby={id}
        />
      </div>

      <CModal alignment="center" size="xl" visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>{/* <CModalTitle>Modal title</CModalTitle> */}</CModalHeader>
        <CModalBody>
          <ReactTable
            columns={
              Array.isArray(tableColumns)
                ? [
                    ...tableColumns,
                    {
                      Header: 'Pilih',
                      THClassName: 'text-center',
                      TDClassName: 'text-center',
                      Cell: ({ row: { original } }) => (
                        <>
                          <FontAwesomeIcon
                            icon={faCheck}
                            className="cursor-pointer"
                            onClick={() => {
                              if (onChange) {
                                onChange(original)
                              }
                              setVisible(false)
                            }}
                          />
                        </>
                      ),
                    },
                  ]
                : []
            }
            data={data}
            fetchData={fetchData}
            loading={loading}
            pageCount={pageCount}
            tableClassName={tableClassName}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Batal
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

InputLookup.propTypes = {
  id: PropTypes.string,
  inputClassName: PropTypes.string,
  buttonClassName: PropTypes.string,
  tableClassName: PropTypes.string,
  displayValue: PropTypes.string,
  onChange: PropTypes.func,
  requestConfig: PropTypes.object,
  tableColumns: PropTypes.array,
  tableDataKey: PropTypes.string,
  tablePagesKey: PropTypes.string,
  // ReactTable Cell props
  row: PropTypes.object,
}

export default InputLookup
