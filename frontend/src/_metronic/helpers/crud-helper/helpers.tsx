import {createContext, Dispatch, SetStateAction, useEffect, useState} from 'react'
import qs from 'qs'
import {ID, QueryResponseContextProps, QueryState} from './models'

function createResponseContext<T>(initialState: QueryResponseContextProps<T>) {
  return createContext(initialState)
}

function isNotEmpty(obj: unknown) {
  return obj !== undefined && obj !== null && obj !== ''
}


function stringifyRequestQuery(state: QueryState): string {
  const pagination = qs.stringify(state, {filter: ['page', 'items_per_page'], skipNulls: true})
  const sort = qs.stringify(state, {filter: ['sort', 'order'], skipNulls: true})
  const search = isNotEmpty(state.search)
    ? qs.stringify(state, {filter: ['search'], skipNulls: true})
    : ''

  const filter = state.filter
    ? Object.entries(state.filter as Object)
        .filter((obj) => isNotEmpty(obj[1]))
        .map((obj) => {
          return `filter_${obj[0]}=${obj[1]}`
        })
        .join('&')
    : ''

  return [pagination, sort, search, filter]
    .filter((f) => f)
    .join('&')
    .toLowerCase()
}

function parseRequestQuery(query: string): QueryState {
  const cache: unknown = qs.parse(query)
  return cache as QueryState
}

function calculatedGroupingIsDisabled<T>(isLoading: boolean, data: Array<T> | undefined): boolean {
  if (isLoading) {
    return true
  }

  return !data || !data.length
}

function calculateIsAllDataSelected<T>(data: Array<T> | undefined, selected: Array<ID>): boolean {
  if (!data) {
    return false
  }

  return data.length > 0 && data.length === selected.length
}

function groupingOnSelect(
  id: ID,
  selected: Array<ID>,
  setSelected: Dispatch<SetStateAction<Array<ID>>>
) {
  if (!id) {
    return
  }

  if (selected.includes(id)) {
    setSelected(selected.filter((itemId) => itemId !== id))
  } else {
    const updatedSelected = [...selected]
    updatedSelected.push(id)
    setSelected(updatedSelected)
  }
}

function groupingOnSelectAll<T>(
  isAllSelected: boolean,
  setSelected: Dispatch<SetStateAction<Array<ID>>>,
  data?: Array<T & {id?: ID}>
) {
  if (isAllSelected) {
    setSelected([])
    return
  }

  if (!data || !data.length) {
    return
  }

  setSelected(data.filter((item) => item.id).map((item) => item.id))
}


function useDebounce(value: string | undefined, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(
    () => {
      const handler = setTimeout(() => {
        setDebouncedValue(value)
      }, delay)
      return () => {
        clearTimeout(handler)
      }
    },
    [value, delay] 
  )
  return debouncedValue
}

export {
  createResponseContext,
  stringifyRequestQuery,
  parseRequestQuery,
  calculatedGroupingIsDisabled,
  calculateIsAllDataSelected,
  groupingOnSelect,
  groupingOnSelectAll,
  useDebounce,
  isNotEmpty,
}