import { FC } from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router'
import { checkIsActive, KTIcon, WithChildren } from '../../../../helpers'
import { useLayout } from '../../../core'

type Props = {
  to: string
  title: string
  icon?: string
  fontIcon?: string
  hasBullet?: boolean
  exact?: boolean
  badge?: string
  badgeColor?: string
  iconColor?: string
}

const SidebarMenuItem: FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
  fontIcon,
  hasBullet = false,
  exact = false,
  badge,
  badgeColor = 'danger',
  iconColor,
}) => {
  const { pathname } = useLocation()
  const isActive = exact ? pathname === to : checkIsActive(pathname, to)
  const { config } = useLayout()
  const { app } = config

  return (
    <div className='menu-item'>
      <Link className={clsx('menu-link without-sub', { active: isActive })} to={to}>
        {hasBullet && (
          <span className='menu-bullet'>
            <span className='bullet bullet-dot'></span>
          </span>
        )}
        {!hasBullet && icon && (
          <span className='menu-icon'>
            <KTIcon iconName={icon} className='fs-2' style={iconColor ? { color: iconColor } : undefined} />
          </span>
        )}
        {!hasBullet && !icon && fontIcon && (
          <span className='menu-icon'>
            <i className={clsx('bi fs-3', fontIcon)} style={iconColor ? { color: iconColor } : undefined}></i>
          </span>
        )}
        <span className='menu-title'>{title}</span>
        {badge && (
          <span className={`badge badge-${badgeColor} ms-2 fs-9 py-1 px-2 fw-bold`} style={{animation: '2s ease 0s infinite normal none running pulse'}}>
            {badge}
          </span>
        )}
      </Link>
      {children}
    </div>
  )
}

export { SidebarMenuItem }