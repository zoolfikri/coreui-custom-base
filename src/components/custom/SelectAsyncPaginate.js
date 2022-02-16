import React from 'react'
import PropTypes from 'prop-types'

import { AsyncPaginate } from 'react-select-async-paginate'
import { components as RSComponents } from 'react-select'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'

const SelectAsyncPaginate = ({
  className,
  components,
  value,
  onChange,
  loadOptions,
  getOptionValue,
  getOptionLabel,
  additional,
  loadOptionsOnMenuOpen,
  shouldLoadMore,
}) => {
  return (
    <AsyncPaginate
      debounceTimeout={500}
      className={`react-select ${className}`}
      classNamePrefix="react-select"
      components={{
        DropdownIndicator: (props) => {
          return (
            <RSComponents.DropdownIndicator {...props}>
              <FontAwesomeIcon icon={faChevronDown} />
            </RSComponents.DropdownIndicator>
          )
        },
        ...components,
      }}
      value={value}
      loadOptions={loadOptions}
      onChange={onChange}
      getOptionValue={getOptionValue}
      getOptionLabel={getOptionLabel}
      additional={additional}
      backspaceRemovesValue
      isClearable
      loadOptionsOnMenuOpen={loadOptionsOnMenuOpen}
      shouldLoadMore={shouldLoadMore}
    />
  )
}

SelectAsyncPaginate.propTypes = {
  loadOptions: PropTypes.func,
  className: PropTypes.string,
  components: PropTypes.object,
  value: PropTypes.any,
  onChange: PropTypes.func,
  getOptionValue: PropTypes.any,
  getOptionLabel: PropTypes.any,
  additional: PropTypes.any,
  loadOptionsOnMenuOpen: PropTypes.bool,
  shouldLoadMore: PropTypes.func,
}

export default SelectAsyncPaginate
