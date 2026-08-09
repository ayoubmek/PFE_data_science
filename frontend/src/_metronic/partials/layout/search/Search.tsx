import React, {FC, useCallback, useEffect, useRef, useState} from 'react'
import { useIntl } from 'react-intl'
import axios from 'axios'
import {SearchComponent} from '../../../assets/ts/components'
import {KTIcon} from '../../../helpers'

const Search: FC = () => {
    const intl = useIntl()
    const [menuState, setMenuState] = useState<'main' | 'advanced' | 'preferences'>('main')
  const element = useRef<HTMLDivElement | null>(null)
  const wrapperElement = useRef<HTMLDivElement | null>(null)
  const resultsElement = useRef<HTMLDivElement | null>(null)
  const suggestionsElement = useRef<HTMLDivElement | null>(null)
  const emptyElement = useRef<HTMLDivElement | null>(null)
  const [results, setResults] = useState<{ orders: any[], vendors: any[] }>({ orders: [], vendors: [] })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searching, setSearching] = useState(false)

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('arkan_search_history')
    return saved ? JSON.parse(saved) : []
  })

  // Domain-specific fallbacks if history is empty
  const defaultRecentItems = [
    { title: 'Order #102345', desc: 'Arkan Shipper', icon: 'package' },
    { title: 'Tracking ID: ARK-2940', desc: 'DHL Express', icon: 'truck' },
    { title: 'Vendor: Modern Shop', desc: 'Active Seller', icon: 'shop' },
    { title: 'Customer: John Doe', desc: 'Algiers, Algeria', icon: 'profile-circle' },
  ]

  const updateHistory = (query: string) => {
    if (!query || query.length < 2) return
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(q => q !== query)].slice(0, 6)
      localStorage.setItem('arkan_search_history', JSON.stringify(updated))
      return updated
    })
  }

  const processs = useCallback(async (search: SearchComponent) => {
    const queryTerm = element.current?.querySelector<HTMLInputElement>('[data-kt-search-element="input"]')?.value
    if (queryTerm && queryTerm.length >= 2) {
      updateHistory(queryTerm)
      setSearching(true)
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/search/global`, {
          params: { query: queryTerm }
        })
        setResults(response.data)
        
        // Hide recently viewed
        suggestionsElement.current!.classList.add('d-none')

        if (response.data.orders.length === 0 && response.data.vendors.length === 0) {
          resultsElement.current!.classList.add('d-none')
          emptyElement.current!.classList.remove('d-none')
        } else {
          resultsElement.current!.classList.remove('d-none')
          emptyElement.current!.classList.add('d-none')
        }
      } catch (error) {
        console.error('Search error:', error)
        resultsElement.current!.classList.add('d-none')
        emptyElement.current!.classList.remove('d-none')
      } finally {
        setSearching(false)
        search.complete()
      }
    } else {
      search.complete()
    }
  }, [])

  const clear = useCallback((search: SearchComponent) => {
    // Show recently viewed
    suggestionsElement.current!.classList.remove('d-none')
    // Hide results
    resultsElement.current!.classList.add('d-none')
    // Hide empty message
    emptyElement.current!.classList.add('d-none')
  }, [])

  useEffect(() => {
    // Initialize search handler
    const searchObject = SearchComponent.createInsance('#kt_header_search')

    // Search handler
    searchObject!.on('kt.search.process', processs)

    // Clear handler
    searchObject!.on('kt.search.clear', clear)
  }, [processs, clear])

  return (
    <>
      <div
        id='kt_header_search'
        className='d-flex align-items-stretch'
        data-kt-search-keypress='true'
        data-kt-search-min-length='2'
        data-kt-search-enter='enter'
        data-kt-search-layout='menu'
        data-kt-menu-trigger='auto'
        data-kt-menu-overflow='false'
        data-kt-menu-permanent='true'
        data-kt-menu-placement='bottom-end'
        ref={element}
      >
        <div
          className='d-flex align-items-center'
          data-kt-search-element='toggle'
          id='kt_header_search_toggle'
        >
          <div className='btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px'>
            <KTIcon iconName='magnifier' className='fs-2' />
          </div>
        </div>

        <div
          data-kt-search-element='content'
          className='menu menu-sub menu-sub-dropdown p-7 w-325px w-md-375px'
        >
          <div
            className={`${menuState === 'main' ? '' : 'd-none'}`}
            ref={wrapperElement}
            data-kt-search-element='wrapper'
          >
            <form
              data-kt-search-element='form'
              className='w-100 position-relative mb-3'
              autoComplete='off'
            >
              <KTIcon
                iconName='magnifier'
                className='fs-2 text-lg-1 text-gray-500 position-absolute top-50 translate-middle-y ms-0'
              />

              <input
                type='text'
                className='form-control form-control-flush ps-10'
                name='search'
                placeholder='Search...'
                data-kt-search-element='input'
              />

              <span
                className='position-absolute top-50 end-0 translate-middle-y lh-0 d-none me-1'
                data-kt-search-element='spinner'
              >
                <span className='spinner-border h-15px w-15px align-middle text-gray-400' />
              </span>

              <span
                className='btn btn-flush btn-active-color-primary position-absolute top-50 end-0 translate-middle-y lh-0 d-none'
                data-kt-search-element='clear'
              >
                <KTIcon iconName='cross' className='fs-2 text-lg-1 me-0' />
              </span>

              <div
                className='position-absolute top-50 end-0 translate-middle-y'
                data-kt-search-element='toolbar'
              >
                <div
                  data-kt-search-element='preferences-show'
                  className='btn btn-icon w-20px btn-sm btn-active-color-primary me-1'
                  data-bs-toggle='tooltip'
                  onClick={() => {
                    setMenuState('preferences')
                  }}
                  title='Show search preferences'
                >
                  <KTIcon iconName='setting-2' className='fs-1' />
                </div>

                <div
                  data-kt-search-element='advanced-options-form-show'
                  className='btn btn-icon w-20px btn-sm btn-active-color-primary'
                  data-bs-toggle='tooltip'
                  onClick={() => {
                    setMenuState('advanced')
                  }}
                  title='Show more search options'
                >
                  <KTIcon iconName='down' className='fs-2' />
                </div>
              </div>
            </form>

            <div ref={resultsElement} data-kt-search-element='results' className='d-none'>
              <div className='scroll-y mh-200px mh-lg-350px'>
                {results.vendors.length > 0 && (
                  <>
                    <h3 className='fs-5 text-muted m-0 pb-5' data-kt-search-element='category-title'>
                      {intl.formatMessage({ id: 'DASHBOARD.VENDORS' })}
                    </h3>

                    {results.vendors.map((vendor) => (
                      <a
                        key={vendor.id}
                        href={`/vendeurs/${vendor.id}/stats`}
                        className='d-flex text-dark text-hover-primary align-items-center mb-5'
                      >
                        <div className='symbol symbol-40px me-4'>
                          <span className='symbol-label bg-light'>
                            <KTIcon iconName='shop' className='fs-2 text-primary' />
                          </span>
                        </div>

                        <div className='d-flex flex-column justify-content-start fw-bold'>
                          <span className='fs-6 fw-bold'>{vendor.name}</span>
                          <span className='fs-7 fw-bold text-muted'>{vendor.email}</span>
                        </div>
                      </a>
                    ))}
                  </>
                )}

                {results.orders.length > 0 && (
                  <>
                    <h3
                      className='fs-5 text-muted m-0 pt-5 pb-5'
                      data-kt-search-element='category-title'
                    >
                      {intl.formatMessage({ id: 'DASHBOARD.ORDERS' })}
                    </h3>

                    {results.orders.map((order) => (
                      <a
                        key={order.id}
                        href={`/magento-orders/availability?search=${order.increment_id}`}
                        className='d-flex text-dark text-hover-primary align-items-center mb-5'
                      >
                        <div className='symbol symbol-40px me-4'>
                          <span className='symbol-label bg-light'>
                            <KTIcon iconName='package' className='fs-2 text-primary' />
                          </span>
                        </div>

                        <div className='d-flex flex-column'>
                          <span className='fs-6 fw-bold'>#{order.increment_id}</span>
                          <span className='fs-7 fw-bold text-muted'>{order.customer}</span>
                        </div>
                      </a>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div ref={suggestionsElement} className='mb-4' data-kt-search-element='main'>
              <div className='d-flex flex-stack fw-bold mb-4'>
                <span className='text-muted fs-6 me-2'>{intl.formatMessage({id: 'SEARCH.RECENTLY_SEARCHED'})}</span>
                {recentSearches.length > 0 && (
                  <button
                    className='btn btn-flush btn-active-color-primary fs-7 fw-bold'
                    onClick={() => {
                      setRecentSearches([])
                      localStorage.removeItem('arkan_search_history')
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className='scroll-y mh-200px mh-lg-325px'>
                {recentSearches.length > 0 ? (
                  recentSearches.map((term, index) => (
                    <div
                      key={index}
                      className='d-flex align-items-center mb-5 cursor-pointer text-hover-primary'
                      onClick={() => {
                        const input = element.current?.querySelector<HTMLInputElement>('[data-kt-search-element="input"]')
                        if (input) {
                          input.value = term
                          input.dispatchEvent(new Event('input', { bubbles: true }))
                          input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
                        }
                      }}
                    >
                      <div className='symbol symbol-40px me-4'>
                        <span className='symbol-label bg-light'>
                          <KTIcon iconName='magnifier' className='fs-2 text-primary' />
                        </span>
                      </div>

                      <div className='d-flex flex-column'>
                        <span className='fs-6 text-gray-800 text-hover-primary fw-bold'>{term}</span>
                        <span className='fs-7 text-muted fw-bold'>Recent query</span>
                      </div>
                    </div>
                  ))
                ) : (
                  defaultRecentItems.map((item, index) => (
                    <div
                      key={index}
                      className='d-flex align-items-center mb-5 cursor-pointer text-hover-primary'
                      onClick={() => {
                        const input = element.current?.querySelector<HTMLInputElement>('[data-kt-search-element="input"]')
                        if (input) {
                          input.value = item.title
                          input.dispatchEvent(new Event('input', { bubbles: true }))
                        }
                      }}
                    >
                      <div className='symbol symbol-40px me-4'>
                        <span className='symbol-label bg-light'>
                          <KTIcon iconName={item.icon} className='fs-2 text-primary' />
                        </span>
                      </div>

                      <div className='d-flex flex-column'>
                        <span className='fs-6 text-gray-800 text-hover-primary fw-bold'>{item.title}</span>
                        <span className='fs-7 text-muted fw-bold'>{item.desc}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div ref={emptyElement} data-kt-search-element='empty' className='text-center d-none'>
              <div className='pt-10 pb-10'>
                <KTIcon iconName='search-list' className='fs-4x opacity-50' />
              </div>

              <div className='pb-15 fw-bold'>
                <h3 className='text-gray-600 fs-5 mb-2'>No result found</h3>
                <div className='text-muted fs-7'>Please try again with a different query</div>
              </div>
            </div>
          </div>

          <form className={`pt-1 ${menuState === 'advanced' ? '' : 'd-none'}`}>
            <h3 className='fw-bold text-dark mb-7'>Advanced Search</h3>

            <div className='mb-5'>
              <input
                type='text'
                className='form-control form-control-sm form-control-solid'
                placeholder='Contains the word'
                name='query'
              />
            </div>

            <div className='mb-5'>
              <div className='nav-group nav-group-fluid'>
                <label>
                  <input
                    type='radio'
                    className='btn-check'
                    name='type'
                    value='has'
                    defaultChecked
                  />
                  <span className='btn btn-sm btn-color-muted btn-active btn-active-primary'>
                    All
                  </span>
                </label>

                <label>
                  <input type='radio' className='btn-check' name='type' value='users' />
                  <span className='btn btn-sm btn-color-muted btn-active btn-active-primary px-4'>
                    Users
                  </span>
                </label>

                <label>
                  <input type='radio' className='btn-check' name='type' value='orders' />
                  <span className='btn btn-sm btn-color-muted btn-active btn-active-primary px-4'>
                    Orders
                  </span>
                </label>

                <label>
                  <input type='radio' className='btn-check' name='type' value='projects' />
                  <span className='btn btn-sm btn-color-muted btn-active btn-active-primary px-4'>
                    {intl.formatMessage({id: 'DASHBOARD.ORDERS'})}
                  </span>
                </label>
              </div>
            </div>

            <div className='mb-5'>
              <input
                type='text'
                name='assignedto'
                className='form-control form-control-sm form-control-solid'
                placeholder={intl.formatMessage({id: 'SEARCH.CARRIER_PLACEHOLDER'}) || 'Carrier / Driver'}
              />
            </div>

            <div className='mb-5'>
              <input
                type='text'
                name='collaborators'
                className='form-control form-control-sm form-control-solid'
                placeholder={intl.formatMessage({id: 'SEARCH.WAREHOUSE_PLACEHOLDER'}) || 'Warehouse Staff'}
              />
            </div>

            <div className='mb-5'>
              <div className='nav-group nav-group-fluid'>
                <label>
                  <input
                    type='radio'
                    className='btn-check'
                    name='attachment'
                    value='has'
                    defaultChecked
                  />
                  <span className='btn btn-sm btn-color-muted btn-active btn-active-primary'>
                    Has attachment
                  </span>
                </label>

                <label>
                  <input type='radio' className='btn-check' name='attachment' value='any' />
                  <span className='btn btn-sm btn-color-muted btn-active btn-active-primary px-4'>
                    Any
                  </span>
                </label>
              </div>
            </div>

            <div className='mb-5'>
              <select
                name='timezone'
                aria-label='Select a Timezone'
                data-control='select2'
                data-placeholder='date_period'
                className='form-select form-select-sm form-select-solid'
              >
                <option value='next'>Within the next</option>
                <option value='last'>Within the last</option>
                <option value='between'>Between</option>
                <option value='on'>On</option>
              </select>
            </div>

            <div className='row mb-8'>
              <div className='col-6'>
                <input
                  type='number'
                  name='date_number'
                  className='form-control form-control-sm form-control-solid'
                  placeholder='Lenght'
                />
              </div>

              <div className='col-6'>
                <select
                  name='date_typer'
                  aria-label='Select a Timezone'
                  data-control='select2'
                  data-placeholder='Period'
                  className='form-select form-select-sm form-select-solid'
                >
                  <option value='days'>Days</option>
                  <option value='weeks'>Weeks</option>
                  <option value='months'>Months</option>
                  <option value='years'>Years</option>
                </select>
              </div>
            </div>

            <div className='d-flex justify-content-end'>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setMenuState('main')
                }}
                className='btn btn-sm btn-light fw-bolder btn-active-light-primary me-2'
              >
                Cancel
              </button>

              <a
                href='/#'
                className='btn btn-sm fw-bolder btn-primary'
                data-kt-search-element='advanced-options-form-search'
              >
                Search
              </a>
            </div>
          </form>

          <form className={`pt-1 ${menuState === 'preferences' ? '' : 'd-none'}`}>
            <h3 className='fw-bold text-dark mb-7'>Search Preferences</h3>

            <div className='pb-4 border-bottom'>
              <label className='form-check form-switch form-switch-sm form-check-custom form-check-solid flex-stack'>
                <span className='form-check-label text-gray-700 fs-6 fw-bold ms-0 me-2'>
                  {intl.formatMessage({id: 'DASHBOARD.ORDERS'})}
                </span>

                <input className='form-check-input' type='checkbox' value='1' defaultChecked />
              </label>
            </div>

            <div className='py-4 border-bottom'>
              <label className='form-check form-switch form-switch-sm form-check-custom form-check-solid flex-stack'>
                <span className='form-check-label text-gray-700 fs-6 fw-bold ms-0 me-2'>
                  {intl.formatMessage({id: 'SEARCH.SHIPMENTS'}) || 'Shipments'}
                </span>
                <input className='form-check-input' type='checkbox' value='1' defaultChecked />
              </label>
            </div>

            <div className='py-4 border-bottom'>
              <label className='form-check form-switch form-switch-sm form-check-custom form-check-solid flex-stack'>
                <span className='form-check-label text-gray-700 fs-6 fw-bold ms-0 me-2'>
                  {intl.formatMessage({id: 'DASHBOARD.VENDORS'})}
                </span>
                <input className='form-check-input' type='checkbox' value='1' />
              </label>
            </div>

            <div className='py-4 border-bottom'>
              <label className='form-check form-switch form-switch-sm form-check-custom form-check-solid flex-stack'>
                <span className='form-check-label text-gray-700 fs-6 fw-bold ms-0 me-2'>
                  {intl.formatMessage({id: 'SEARCH.CUSTOMERS'}) || 'Customers'}
                </span>
                <input className='form-check-input' type='checkbox' value='1' defaultChecked />
              </label>
            </div>

            <div className='py-4 border-bottom'>
              <label className='form-check form-switch form-switch-sm form-check-custom form-check-solid flex-stack'>
                <span className='form-check-label text-gray-700 fs-6 fw-bold ms-0 me-2'>
                   {intl.formatMessage({id: 'SEARCH.USERS'}) || 'Users'}
                </span>
                <input className='form-check-input' type='checkbox' />
              </label>
            </div>

            <div className='d-flex justify-content-end pt-7'>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setMenuState('main')
                }}
                className='btn btn-sm btn-light fw-bolder btn-active-light-primary me-2'
              >
                {intl.formatMessage({id: 'SEARCH.CANCEL'}) || 'Cancel'}
              </button>
              <button className='btn btn-sm fw-bolder btn-primary'>
                {intl.formatMessage({id: 'SEARCH.SAVE'}) || 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export {Search}
