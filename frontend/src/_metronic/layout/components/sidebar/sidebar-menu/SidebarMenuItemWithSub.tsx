import React, { useState } from 'react'
import clsx from 'clsx'
import {useLocation} from 'react-router-dom'
import {checkIsActive, KTIcon, WithChildren} from '../../../../helpers'
import {useLayout} from '../../../core'

type Props = {
  to: string
  title: string
  icon?: string
  fontIcon?: string
  hasBullet?: boolean
  iconColor?: string
  alwaysOpen?: boolean
}

const SidebarMenuItemWithSub: React.FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
  fontIcon,
  hasBullet,
  iconColor,
  alwaysOpen = true,
}) => {
  const {pathname} = useLocation()
  const isActive = checkIsActive(pathname, to)
  const [isOpen, setIsOpen] = useState(true)
  const {config} = useLayout()
  const {app} = config

  const isExpanded = alwaysOpen || isOpen || isActive

  return (
    <div
      className={clsx('menu-item', {'here': isActive, 'show': isExpanded}, 'menu-accordion')}
    >
      <span
        className='menu-link'
        style={{ cursor: 'pointer' }}
        onClick={() => {
          if (!alwaysOpen) {
            setIsOpen(!isOpen)
          }
        }}
      >
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
        {!alwaysOpen && (
          <span className='menu-arrow'>
            <KTIcon iconName='down' className='fs-6 text-gray-500' />
          </span>
        )}
      </span>
      <div
        className={clsx('menu-sub menu-sub-accordion', {'menu-active-bg': isActive, show: isExpanded})}
        style={isExpanded ? { display: 'block' } : undefined}
      >
        {children}
      </div>
    </div>
  )
}

export {SidebarMenuItemWithSub}