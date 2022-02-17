import React from 'react'
import { useSelector } from 'react-redux'
// import PropTypes from 'prop-types'

import { AsyncTypeahead } from 'react-bootstrap-typeahead'

import axios from 'axios'

const PER_PAGE = 10
let _cache = {}

const Visible = () => {
  const variables = useSelector((state) => state.variables)
  const access_token = useSelector((state) => state.access_token)

  const [isLoading, setIsLoading] = React.useState(false)
  const [options, setOptions] = React.useState([])
  const [query, setQuery] = React.useState('')

  function makeAndHandleRequest(query, page = 1) {
    return axios({
      method: 'get',
      baseURL: variables.api_base_url,
      url: 'api/cms/get-list-province-non-ro',
      headers: { Authorization: access_token },
      params: {
        page,
        limit: PER_PAGE,
        'filter[name]': query,
      },
    })
      .then((result) => {
        const { data } = result.data

        return { options: data.data, total_count: data.last_page }
      })
      .catch((error) => {
        return { options: [], total_count: _cache[query].total_count }
      })
  }

  const _handlePagination = (e, shownResults) => {
    const cachedQuery = _cache[query]
    console.log('_handlePagination', cachedQuery)

    // Don't make another request if:
    // - the cached results exceed the shown results
    // - we've already fetched all possible results
    if (
      cachedQuery.options.length > shownResults ||
      cachedQuery.options.length === cachedQuery.total_count
    ) {
      console.log('_handlePagination', 'GET DATA FROM CACHE', _cache[query])
      return
    }

    console.log('_handlePagination', 'REQUEST DATA FROM API')
    const page = cachedQuery.page + 1
    setIsLoading(true)
    makeAndHandleRequest(query, page).then((res) => {
      const options = cachedQuery.options.concat(res.options)
      _cache[query] = { ...cachedQuery, options, page }
      console.log('_handlePagination', 'DATA FROM API', res.options, options)
      setOptions(options)
      setIsLoading(false)
    })
  }

  const _handleSearch = (query = '') => {
    console.log('_handleSearch', query)
    setQuery(query)

    if (_cache[query]) {
      console.log('_handleSearch', 'GET DATA FROM CACHE', _cache)
      setOptions(_cache[query].options)
      return
    }

    console.log('_handleSearch', 'REQUEST DATA FROM API')
    setIsLoading(true)
    makeAndHandleRequest(query).then((resp) => {
      console.log('_handleSearch', 'DATA FROM API', resp)
      _cache[query] = { ...resp, page: 1 }
      setOptions(resp.options)
      setIsLoading(false)
    })
  }

  return (
    <>
      <AsyncTypeahead
        delay={300}
        filterBy={() => true}
        isLoading={isLoading}
        options={options}
        query={query}
        id="province_id"
        labelKey={(option) => option.name}
        maxResults={PER_PAGE - 1}
        minLength={0}
        onChange={(option) => {
          console.log('option', option)
          setOptions([])
        }}
        onPaginate={_handlePagination}
        onSearch={_handleSearch}
        onMenuToggle={(isOpen) => {
          if (isOpen) _handleSearch()
        }}
        paginate={true}
        placeholder=""
        paginationText="Tampilkan lebih banyak"
        useCache={false}
      />
    </>
  )
}

// Visible.propTypes = { when: PropTypes.func, children: PropTypes.element }

export default Visible
