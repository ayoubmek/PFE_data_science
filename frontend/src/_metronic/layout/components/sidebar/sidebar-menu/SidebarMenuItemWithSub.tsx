import React from 'react'
import clsx from 'clsx'
import {useLocation, Link} from 'react-router-dom'
import {checkIsActive, KTIcon, WithChildren} from '../../../../helpers'
import {useLayout} from '../../../core'

type Props = {
  to: string
  title: string
  icon?: string
  fontIcon?: string
  hasBullet?: boolean
  iconColor?: string
}

const SidebarMenuItemWithSub: React.FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
  fontIcon,
  hasBullet,
  iconColor,
}) => {
  const {pathname} = useLocation()
  const isActive = checkIsActive(pathname, to)
  const {config} = useLayout()
  const {app} = config

  return (
    <div
      className={clsx('menu-item', {'here show': isActive}, 'menu-accordion')}
      data-kt-menu-trigger='click'
    >
      <span className='menu-link' style={{ cursor: 'pointer' }}>
        {hasBullet && (
          <span className='menu-bullet'>
            <span className='bullet bullet-dot'></span>
          </span>
        )}
        {icon && app?.sidebar?.default?.menu?.iconType === 'svg' && (
          <span className='menu-icon'>
            <KTIcon iconName={icon} className='fs-2' style={iconColor ? { color: iconColor } : undefined} />
          </span>
        )}
        {fontIcon && app?.sidebar?.default?.menu?.iconType === 'font' && (
          <i className={clsx('bi fs-3', fontIcon)} style={iconColor ? { color: iconColor } : undefined}></i>
        )}
        <span className='menu-title'>{title}</span>
        <span className='menu-arrow'>
          <KTIcon iconName='down' className='fs-6 text-gray-500' />
        </span>
      </span>
      <div className={clsx('menu-sub menu-sub-accordion', {'menu-active-bg': isActive})}>
        {children}
      </div>
    </div>
  )
}

export {SidebarMenuItemWithSub}