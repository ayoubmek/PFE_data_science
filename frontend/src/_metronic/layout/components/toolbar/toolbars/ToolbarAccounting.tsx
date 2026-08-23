
import {FC, useEffect, useState} from 'react'
import {KTIcon} from '../../../../helpers'

const ToolbarAccounting: FC = () => {
  const [progress, setProgress] = useState<string>('1')
  const [filter, setFilter] = useState<string>('1')

  useEffect(() => {
    document.body.setAttribute('data-kt-app-toolbar-fixed', 'true')
  }, [])

  return (
    <>
      <div className='d-flex align-items-center me-5'>
        {}
        <div className='d-flex align-items-center flex-shrink-0'>
          {}
          <span className='fs-7 text-gray-700 fw-bold pe-3 d-none d-md-block'>Actions:</span>
          {}

          {}
          <div className='d-flex flex-shrink-0'>
            {}
            <div
              data-bs-toggle='tooltip'
              data-bs-placement='top'
              data-bs-trigger='hover'
              title='Add a team member'
            >
              <a href='#' className='btn btn-sm btn-icon btn-active-color-success'>
                <KTIcon iconName='plus-square' className='fs-2x' />
              </a>
            </div>
            {}

            {}
            <div
              data-bs-toggle='tooltip'
              data-bs-placement='top'
              data-bs-trigger='hover'
              title='Create new account'
            >
              <a href='#' className='btn btn-sm btn-icon btn-active-color-success'>
                <KTIcon iconName='minus-square' className='fs-2x' />
              </a>
            </div>
            {}

            {}
            <div
              data-bs-toggle='tooltip'
              data-bs-placement='top'
              data-bs-trigger='hover'
              title='Invite friends'
            >
              <a href='#' className='btn btn-sm btn-icon btn-active-color-success'>
                <KTIcon iconName='dots-square' className='fs-2x' />
              </a>
            </div>
            {}
          </div>
          {}
        </div>
        {}

        {}
        <div className='d-flex align-items-center flex-shrink-0'>
          {}
          <div className='bullet bg-secondary h-35px w-1px mx-5'></div>
          {}

          {}
          <span className='fs-7 text-gray-700 fw-bold pe-4 ps-1 d-none d-md-block'>Progress:</span>
          {}

          <div className='progress w-100px w-xl-150px w-xxl-300px h-25px bg-light-success'>
            <div
              className='progress-bar rounded bg-success fs-7 fw-bold'
              role='progressbar'
              style={{width: '72%'}}
              aria-valuenow={72}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              72%
            </div>
          </div>
        </div>
        {}
        {}
      </div>
      {}
      <div className='d-flex align-items-center'>
        {}
        <div className='me-3'>
          {}
          <select
            className='form-select form-select-sm form-select-solid'
            data-control='select2'
            data-placeholder='Latest'
            data-hide-search='true'
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
          >
            <option value=''></option>
            <option value='1'>Today 16 Feb</option>
            <option value='2'>In Progress</option>
            <option value='3'>Done</option>
          </select>
          {}
        </div>
        {}

        {}
        <div className='m-0'>
          {}
          <select
            className='form-select form-select-sm form-select-solid w-md-125px'
            data-control='select2'
            data-placeholder='Filters'
            data-hide-search='true'
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value=''></option>
            <option value='1'>Filters</option>
            <option value='2'>In Progress</option>
            <option value='3'>Done</option>
          </select>
          {}
        </div>
        {}
      </div>
    </>
  )
}

export {ToolbarAccounting}