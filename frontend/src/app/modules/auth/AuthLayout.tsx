
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { toAbsoluteUrl } from '../../../_metronic/helpers'

const AuthLayout = () => {
  useEffect(() => {
    const root = document.getElementById('root')
    if (root) {
      root.style.height = '100%'
    }
    return () => {
      if (root) {
        root.style.height = 'auto'
      }
    }
  }, [])

  return (
    <div className='d-flex flex-column flex-lg-row flex-column-fluid h-100'>
      <div className='d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1'>
        <div className='d-flex flex-center flex-column flex-lg-row-fluid'>
          <div className='w-lg-500px p-10'>
            <Outlet />
          </div>
        </div>
      </div>

      <div
        className='d-flex flex-lg-row-fluid w-lg-50 order-1 order-lg-2'
        style={{
          background: `url(${toAbsoluteUrl('/media/misc/login_square_bg.png')}) no-repeat center / cover, linear-gradient(135deg, #1e293b, #0f766e)`
        }}
      >
      </div>
    </div>
  )
}

export { AuthLayout }
