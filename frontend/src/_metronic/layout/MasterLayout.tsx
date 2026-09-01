import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { HeaderWrapper } from './components/header'
import { ScrollTop } from './components/scroll-top'
import { Content } from './components/content'
import { FooterWrapper } from './components/footer'
import { Sidebar } from './components/sidebar'
import { PageDataProvider } from './core'
import { reInitMenu, toAbsoluteUrl } from '../helpers'
import { ToolbarWrapper } from './components/toolbar'
import { IndustrialNexoraDrawer } from '../../app/modules/apps/nexora/IndustrialNexoraDrawer'

const MasterLayout = () => {
  const location = useLocation()
  const [isHovered, setIsHovered] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    reInitMenu()
  }, [location.key])

  useEffect(() => {
    const handleOpen = () => setIsDrawerOpen(true)
    const handleClose = () => setIsDrawerOpen(false)
    const handleToggle = () => setIsDrawerOpen((prev) => !prev)

    window.addEventListener('open-nexora-drawer', handleOpen)
    window.addEventListener('close-nexora-drawer', handleClose)
    window.addEventListener('toggle-nexora-drawer', handleToggle)
    window.addEventListener('open-copilot-drawer', handleOpen)
    window.addEventListener('close-copilot-drawer', handleClose)
    window.addEventListener('toggle-copilot-drawer', handleToggle)

    return () => {
      window.removeEventListener('open-nexora-drawer', handleOpen)
      window.removeEventListener('close-nexora-drawer', handleClose)
      window.removeEventListener('toggle-nexora-drawer', handleToggle)
      window.removeEventListener('open-copilot-drawer', handleOpen)
      window.removeEventListener('close-copilot-drawer', handleClose)
      window.removeEventListener('toggle-copilot-drawer', handleToggle)
    }
  }, [])

  return (
    <PageDataProvider>
      <div className='d-flex flex-column flex-root app-root' id='kt_app_root'>
        <div className='app-page flex-column flex-column-fluid' id='kt_app_page'>
          <HeaderWrapper />
          <div className='app-wrapper flex-column flex-row-fluid' id='kt_app_wrapper'>
            <Sidebar />
            <div className='app-main flex-column flex-row-fluid' id='kt_app_main'>
              <div className='d-flex flex-column flex-column-fluid'>
                <ToolbarWrapper />
                <Content>
                  <Outlet />
                </Content>
              </div>
              <FooterWrapper />
            </div>
          </div>
        </div>
      </div>

      <ScrollTop />

      {/* Floating Action Button (FAB) for Copilot IA */}
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

      {/* Adjust ScrollTop position so it floats cleanly above Copilot button */}
      <style>{`
        #kt_scrolltop {
          bottom: 96px !important;
          right: 28px !important;
          transition: all 0.3s ease;
        }
      `}</style>

      {/* Nexora IA Sliding Drawer */}
      <IndustrialNexoraDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </PageDataProvider>
  )
}

export { MasterLayout }