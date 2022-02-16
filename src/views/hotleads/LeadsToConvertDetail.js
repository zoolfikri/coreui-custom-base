import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { CFormInput, CFormLabel, CFormSelect } from '@coreui/react'
import DatePicker from 'react-datepicker'
import SelectAsyncPaginate from 'src/components/custom/SelectAsyncPaginate'
import InputLookup from 'src/components/custom/InputLookup'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faChevronDown } from '@fortawesome/free-solid-svg-icons'

import axios from 'axios'
import moment from 'moment'
import sweetalert2 from 'src/components/custom/Sweetalert2'

function LeadsToConvertDetail() {
  const variables = useSelector((state) => state.variables)
  const access_token = useSelector((state) => state.access_token)
  const { id } = useParams()

  const [dataLeads, setDataLeads] = React.useState({})
  const [loading, setLoading] = React.useState(false)
  const [province_options, setProvince_options] = React.useState([])
  const [city_options, setCity_options] = React.useState([])
  const [subdistrict_options, setSubdistrict_options] = React.useState([])
  const [sales_options, setSales_options] = React.useState([])

  const columnsRD = React.useMemo(
    () => [
      {
        Header: 'Nama RD',
        accessor: 'name',
        filterable: true,
      },
      {
        Header: 'No Telepon',
        accessor: 'phone_number',
        filterable: true,
      },
      {
        Header: 'Alamat',
        accessor: 'address',
        filterable: true,
      },
      {
        Header: 'Metode Pembayaran',
        accessor: 'bank_name',
        filterable: true,
      },
    ],
    [],
  )

  const getSalesOptions = (search, loadedOptions, additional) => {
    return {
      options: sales_options,
      hasMore: false,
    }
  }

  const getProvinceOptions = async (search, loadedOptions, { page }) => {
    const response = await axios({
      method: 'get',
      baseURL: variables.api_base_url,
      url: 'api/cms/get-list-province-non-ro',
      headers: { Authorization: access_token },
      params: {
        page,
        limit: 5,
        'filter[name]': search,
      },
    })
    const { data } = response.data

    setProvince_options(loadedOptions.concat(data.data))

    return {
      options: data.data,
      hasMore: data.last_page > page,
      additional: {
        page: page + 1,
      },
    }
  }

  const getCityOptions = async (search, loadedOptions, { page, province_id }) => {
    try {
      const response = await axios({
        method: 'post',
        baseURL: variables.api_base_url,
        url: 'api/cms/get-city-by-province-id',
        headers: { Authorization: access_token },
        params: {
          page,
          limit: 5,
          'filter[name]': search,
        },
        data: {
          province_id,
        },
      })

      const { data } = response.data

      setCity_options(loadedOptions.concat(data.data))

      return {
        options: data.data,
        hasMore: data.last_page > page,
        additional: {
          page: page + 1,
          province_id,
        },
      }
    } catch (err) {
      return {
        options: [],
        hasMore: false,
        additional: {
          page,
          province_id,
        },
      }
    }
  }

  const getSubdistrictOptions = async (search, loadedOptions, { page, city_id }) => {
    try {
      const response = await axios({
        method: 'post',
        baseURL: variables.api_base_url,
        url: 'api/cms/get-subdistrict-by-city-id',
        headers: { Authorization: access_token },
        params: {
          page,
          limit: 5,
          'filter[name]': search,
        },
        data: {
          city_id,
        },
      })

      const { data } = response.data

      setSubdistrict_options(loadedOptions.concat(data.data))

      return {
        options: data.data,
        hasMore: data.last_page > page,
        additional: {
          page: page + 1,
          city_id,
        },
      }
    } catch (err) {
      return {
        options: [],
        hasMore: false,
        additional: {
          page,
          city_id,
        },
      }
    }
  }

  const getDataPropspectNonRoByLeads = React.useCallback(
    (params = {}) =>
      axios({
        method: 'post',
        baseURL: variables.api_base_url,
        url: 'api/cms/get-prospect-non-ro-data-by-leads',
        headers: { Authorization: access_token },
        data: params,
      }),
    [access_token, variables.api_base_url],
  )

  const getDataCustomerNonRODetailConvert = React.useCallback(
    (params = {}) =>
      axios({
        method: 'post',
        baseURL: variables.api_base_url,
        url: 'api/cms/get-customer-data-non-ro-detail',
        headers: {
          Authorization: access_token,
        },
        data: params,
      }),
    [access_token, variables.api_base_url],
  )

  React.useEffect(() => {
    setLoading(true)

    Promise.all([
      getDataPropspectNonRoByLeads({ customer_id: id }),
      getDataCustomerNonRODetailConvert({ customer_id: id }),
    ]).then(
      ([dataPropspectNonRoByLeads, dataCustomerNonRODetailConvert]) => {
        const dataProspect = dataPropspectNonRoByLeads.data
        const dataCustomer = dataCustomerNonRODetailConvert.data

        setDataLeads((prev) => {
          return {
            ...prev,
            ...(dataProspect?.data && typeof dataProspect?.data === 'object'
              ? dataProspect?.data
              : {}),
            ...(dataCustomer?.data && typeof dataCustomer?.data === 'object'
              ? dataCustomer?.data
              : {}),
          }
        })
        setLoading(false)
      },
      (e) => {
        sweetalert2.fire({
          text: e.message || e.status,
          icon: 'error',
        })
      },
    )
  }, [getDataPropspectNonRoByLeads, getDataCustomerNonRODetailConvert, id])

  if (loading) {
    return <>LOADING</>
  }

  console.log('DATA LEADS', dataLeads)

  return (
    <>
      {/* Detail Customer */}
      <div className="card rounded-0">
        <div className="card-header bg-primary rounded-0">
          <span className="fw-semibold text-white">Detail Customer</span>
        </div>
        <div className="card-body">
          <div className="row row-cols-md-4">
            {/* Col 1 */}
            <div className="col">
              <div className="mb-3">
                <CFormLabel htmlFor="customer_name">
                  Nama<span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  id="customer_name"
                  value={dataLeads?.customer_name ? dataLeads?.customer_name : ''}
                  onChange={(e) => {
                    let tempDataLeads = { ...dataLeads }
                    tempDataLeads[e.target.id] = e.target.value
                    setDataLeads(tempDataLeads)
                  }}
                />
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="id_card_num">No. KTP</CFormLabel>
                <CFormInput
                  type="text"
                  id="id_card_num"
                  value={dataLeads?.id_card_num ? dataLeads?.id_card_num : ''}
                  onChange={(e) => {
                    let tempDataLeads = { ...dataLeads }
                    tempDataLeads[e.target.id] = e.target.value
                    setDataLeads(tempDataLeads)
                  }}
                />
              </div>

              <div className="mb-3">
                <div className="row">
                  <div className="col-md">
                    <CFormLabel htmlFor="birthdate">Tanggal Lahir</CFormLabel>
                    <DatePicker
                      id="birthdate"
                      className="form-control mb-3"
                      selected={
                        dataLeads?.birthdate
                          ? moment(dataLeads?.birthdate, 'YYYY-MM-DD').toDate()
                          : ''
                      }
                      onChange={(date) => {
                        let tempDataLeads = { ...dataLeads }
                        tempDataLeads['birthdate'] = moment(date).format('YYYY-MM-DD')
                        setDataLeads(tempDataLeads)
                      }}
                      maxDate={new Date()}
                      showYearDropdown
                    />
                  </div>

                  <div className="col-md">
                    <CFormLabel htmlFor="gender">
                      Gender<span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormSelect
                      type="select"
                      id="gender"
                      value={dataLeads?.gender ? String(dataLeads?.gender) : ''}
                      onChange={(e) => {
                        let tempDataLeads = { ...dataLeads }
                        tempDataLeads[e.target.id] = e.target.value
                        setDataLeads(tempDataLeads)
                      }}
                    >
                      <option value={''}></option>
                      <option value={'1'}>L</option>
                      <option value={'2'}>P</option>
                    </CFormSelect>
                  </div>
                </div>
              </div>
            </div>

            {/* Col 2 */}
            <div className="col">
              <div className="mb-3">
                <CFormLabel htmlFor="mobile_phone_number">
                  No. HP<span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  id="mobile_phone_number"
                  value={dataLeads?.mobile_phone_number ? dataLeads?.mobile_phone_number : ''}
                  onChange={(e) => {
                    let tempDataLeads = { ...dataLeads }
                    tempDataLeads[e.target.id] = e.target.value
                    setDataLeads(tempDataLeads)
                  }}
                />
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="retail_dealer_id">
                  Retail Dealer<span className="text-danger">*</span>
                </CFormLabel>
                <InputLookup
                  id="retail_dealer_id"
                  tableColumns={columnsRD}
                  tableDataKey="data.data"
                  tablePagesKey="data.last_page"
                  displayValue={dataLeads['retail_name']}
                  requestConfig={{
                    method: 'post',
                    baseURL: variables.api_base_url,
                    url: 'api/cms/list-rd',
                    headers: {
                      Authorization: access_token,
                    },
                    data: {
                      md_id: variables.main_dealer_id,
                    },
                  }}
                  onChange={(values) => {
                    let tempDataLeads = { ...dataLeads }
                    tempDataLeads['retail_dealer_id'] = values.id
                    tempDataLeads['retail_name'] = values.name
                    tempDataLeads['sales_people_id'] = ''

                    setDataLeads(tempDataLeads)
                    setSales_options(Array.isArray(values?.sales_person) ? values.sales_person : [])
                  }}
                />
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="sales_people_id">Sales Terkait</CFormLabel>

                <SelectAsyncPaginate
                  className={dataLeads?.projectId ? 'is-invalid' : ''}
                  value={sales_options.filter((o) => o.id === dataLeads?.sales_people_id)}
                  loadOptions={getSalesOptions}
                  onChange={(selected) => {
                    let tempDataLeads = { ...dataLeads }
                    tempDataLeads['sales_people_id'] = selected?.id
                    setDataLeads(tempDataLeads)
                  }}
                  getOptionValue={(option) => option.id}
                  getOptionLabel={(option) => option.username}
                  cacheUniqs={[dataLeads?.['retail_dealer_id']]}
                />
              </div>
            </div>

            {/* Col 3 */}
            <div className="col">
              <div className="mb-3">
                <CFormLabel htmlFor="address">
                  Alamat<span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  id="address"
                  value={dataLeads?.['address'] ? dataLeads?.['address'] : ''}
                  onChange={(e) => {
                    let tempDataLeads = { ...dataLeads }
                    tempDataLeads[e.target.id] = e.target.value
                    setDataLeads(tempDataLeads)
                  }}
                />
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="kelurahan">Kelurahan</CFormLabel>
                <CFormInput
                  type="text"
                  id="kelurahan"
                  value={dataLeads?.['kelurahan'] ? dataLeads?.['kelurahan'] : ''}
                  onChange={(e) => {
                    let tempDataLeads = { ...dataLeads }
                    tempDataLeads[e.target.id] = e.target.value
                    setDataLeads(tempDataLeads)
                  }}
                />
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="postal_code">Kode Pos</CFormLabel>
                <CFormInput
                  type="text"
                  id="postal_code"
                  value={dataLeads?.['postal_code'] ? dataLeads?.['postal_code'] : ''}
                  onChange={(e) => {
                    let tempDataLeads = { ...dataLeads }
                    tempDataLeads[e.target.id] = e.target.value
                    setDataLeads(tempDataLeads)
                  }}
                />
              </div>
            </div>

            {/* Col 4 */}
            <div className="col">
              <div className="mb-3">
                <CFormLabel htmlFor="province_id">Provinsi</CFormLabel>

                <SelectAsyncPaginate
                  value={province_options.filter((o) => o.id === dataLeads?.['province_id'])}
                  loadOptions={getProvinceOptions}
                  onChange={(selected) => {
                    let tempDataLeads = { ...dataLeads }
                    tempDataLeads['province_id'] = selected?.id
                    tempDataLeads['city_id'] = ''
                    tempDataLeads['city_name'] = ''
                    tempDataLeads['subdistrict_id'] = ''
                    tempDataLeads['subdistrict'] = ''
                    setDataLeads(tempDataLeads)
                  }}
                  getOptionValue={(option) => option.id}
                  getOptionLabel={(option) => option.name}
                  additional={{
                    page: 1,
                  }}
                />
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="city_id">Kota</CFormLabel>

                <SelectAsyncPaginate
                  value={city_options.filter((o) => o.id === dataLeads?.city_id)}
                  loadOptions={getCityOptions}
                  onChange={(selected) => {
                    let tempDataLeads = { ...dataLeads }
                    tempDataLeads['city_id'] = selected?.id
                    tempDataLeads['city_name'] = selected?.name
                    tempDataLeads['subdistrict_id'] = ''
                    tempDataLeads['subdistrict'] = ''
                    setDataLeads(tempDataLeads)
                  }}
                  getOptionValue={(option) => option.id}
                  getOptionLabel={(option) => option.name}
                  additional={{
                    page: 1,
                    province_id: dataLeads.province_id,
                  }}
                  cacheUniqs={[dataLeads?.['province_id']]}
                />
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="subdistrict_id">Kecamatan</CFormLabel>

                <SelectAsyncPaginate
                  value={subdistrict_options.filter((o) => o.id === dataLeads?.subdistrict_id)}
                  loadOptions={getSubdistrictOptions}
                  onChange={(selected) => {
                    let tempDataLeads = { ...dataLeads }
                    tempDataLeads['subdistrict_id'] = selected?.id
                    tempDataLeads['subdistrict'] = selected?.name
                    setDataLeads(tempDataLeads)
                  }}
                  getOptionValue={(option) => option.id}
                  getOptionLabel={(option) => option.name}
                  additional={{
                    page: 1,
                    city_id: dataLeads.city_id,
                  }}
                  cacheUniqs={[dataLeads?.['city_id']]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

LeadsToConvertDetail.propTypes = {
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

export default LeadsToConvertDetail
