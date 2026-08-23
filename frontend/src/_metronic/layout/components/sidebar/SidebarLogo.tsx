import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { KTIcon, toAbsoluteUrl } from '../../../helpers'
import { useLayout } from '../../core'
import { MutableRefObject, useEffect, useRef } from 'react'
import { ToggleComponent } from '../../../assets/ts/components'

type PropsType = {
  sidebarRef: MutableRefObject<HTMLDivElement | null>
}

const SidebarLogo = (props: PropsType) => {
  const { config } = useLayout()
  const toggleRef = useRef<HTMLDivElement>(null)

  const appSidebarDefaultMinimizeDesktopEnabled =
    config?.app?.sidebar?.default?.minimize?.desktop?.enabled
  const appSidebarDefaultCollapseDesktopEnabled =
    config?.app?.sidebar?.default?.collapse?.desktop?.enabled
  const toggleType = appSidebarDefaultCollapseDesktopEnabled
    ? 'collapse'
    : appSidebarDefaultMinimizeDesktopEnabled
      ? 'minimize'
      : ''
  const toggleState = appSidebarDefaultMinimizeDesktopEnabled ? 'active' : ''
  const appSidebarDefaultMinimizeDefault = config.app?.sidebar?.default?.minimize?.desktop?.default

  useEffect(() => {
    setTimeout(() => {
      const toggleObj = ToggleComponent.getInstance(toggleRef.current!) as ToggleComponent | null

      if (toggleObj === null) {
        return
      }

      toggleObj.on('kt.toggle.change', function () {
        props.sidebarRef.current!.classList.add('animating')

        setTimeout(function () {
          props.sidebarRef.current!.classList.remove('animating')
        }, 300)
      })
    }, 600)
  }, [toggleRef, props.sidebarRef])

  const logoStyle: React.CSSProperties = {
    maxWidth: '120px',
    maxHeight: '65px',
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
    display: 'block',
    margin: '0 auto',
  }

  return (
    <div className='app-sidebar-logo d-flex justify-content-center align-items-center' id='kt_app_sidebar_logo' style={{height: '80px', padding: '8px 16px'}}>
      <Link to='/dashboard' style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
        {config.layoutType === 'dark-sidebar' ? (
          <img
            alt='Logo'
            src={toAbsoluteUrl('/media/pfe/logo.png')}
            className='app-sidebar-logo-default'
            style={logoStyle}
          />
        ) : (
          <>
            <img
              alt='Logo'
              src={toAbsoluteUrl('/media/pfe/logo.png')}
              className='app-sidebar-logo-default theme-light-show'
              style={logoStyle}
            />
            <img
              alt='Logo'
              src={toAbsoluteUrl('/media/pfe/logo.png')}
              className='app-sidebar-logo-default theme-dark-show'
              style={logoStyle}
            />
          </>
        )}

        <img
          alt='Logo'
          src={toAbsoluteUrl('/media/pfe/logo.png')}
          className='h-25px app-sidebar-logo-minimize'
        />
      </Link>

      {(appSidebarDefaultMinimizeDesktopEnabled || appSidebarDefaultCollapseDesktopEnabled) && (
        <div
          ref={toggleRef}
          id='kt_app_sidebar_toggle'
          className={clsx(
            'app-sidebar-toggle btn btn-icon btn-shadow btn-sm btn-color-muted btn-active-color-primary h-30px w-30px position-absolute top-50 start-100 translate-middle rotate',
            { active: appSidebarDefaultMinimizeDefault }
          )}
          data-kt-toggle='true'
          data-kt-toggle-state={toggleState}
          data-kt-toggle-target='body'
          data-kt-toggle-name={`app-sidebar-${toggleType}`}
        >
          <KTIcon iconName='black-left-line' className='fs-3 rotate-180 ms-1' />
        </div>
      )}
    </div>
  )
}

export { SidebarLogo }