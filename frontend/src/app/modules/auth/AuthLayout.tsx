
import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { toAbsoluteUrl } from '../../../_metronic/helpers'
import { IndustrialNexoraDrawer } from '../apps/nexora/IndustrialNexoraDrawer'

const AuthLayout = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

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

      {/* Floating Action Button (FAB) for Nexora IA on Login screen */}
      <div
        id='kt_copilot_fab_wrapper'
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1045
        }}
      >
        <button
          type='button'
          id='kt_copilot_fab_button'
          className='btn btn-icon rounded-circle d-flex align-items-center justify-content-center border-0 position-relative'
          onClick={() => setIsDrawerOpen((prev) => !prev)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          title='Assistant Décisionnel'
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1B84FF 0%, #0052CC 100%)',
            boxShadow: isHovered
              ? '0 8px 20px rgba(27, 132, 255, 0.45)'
              : '0 4px 14px rgba(27, 132, 255, 0.3)',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
        >
          {/* Circular inner badge with App Logo */}
          <div
            className='rounded-circle bg-white d-flex align-items-center justify-content-center shadow-xs'
            style={{
              width: '38px',
              height: '38px',
              padding: '3px',
              overflow: 'hidden'
            }}
          >
            <img
              src={toAbsoluteUrl('/media/pfe/logo.png')}
              alt='Logo'
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
              onError={(e: any) => {
                e.target.style.display = 'none'
                e.target.parentElement.innerHTML = '<i class="bi bi-chat-left-text text-primary fs-4"></i>'
              }}
            />
          </div>
        </button>
      </div>

      {/* Nexora IA Sliding Drawer */}
      <IndustrialNexoraDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  )
}

export { AuthLayout }