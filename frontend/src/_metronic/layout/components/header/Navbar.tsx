import clsx from 'clsx'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { KTIcon, toAbsoluteUrl } from '../../../helpers'
import { HeaderUserMenu, ThemeModeSwitcher, Search, HeaderNotificationsMenu } from '../../../partials'
import { useLayout } from '../../core'

const itemClass = 'ms-1 ms-md-4'
const userAvatarClass = 'symbol-35px'

const Navbar = () => {
  const { config } = useLayout()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081/api'
    try {
      const { data } = await axios.get(`${apiUrl}/notifications`)
      setNotifications(data || [])
      const countRes = await axios.get(`${apiUrl}/notifications/count`)
      setUnreadCount(countRes.data?.unread || 0)
    } catch (err) {
      console.warn('Failed to fetch notifications:', err)
    }
  }

  const handleMarkAsRead = async (id: number) => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081/api'
    try {
      await axios.put(`${apiUrl}/notifications/${id}/read`)
      fetchNotifications()
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081/api'
    try {
      await axios.put(`${apiUrl}/notifications/read-all`)
      fetchNotifications()
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll for notifications every 20 seconds
    const interval = setInterval(fetchNotifications, 20000)
    return () => clearInterval(interval)
  }, [])

  // Map backend notifications to Metronic menu structure
  const mappedNotifications = notifications.map((n: any) => {
    let icon = 'notification-on'
    let color = '#3E97FF' // primary blue
    
    if (n.type === 'ALERTE_STOCK' || n.priorite === 'CRITIQUE') {
      icon = 'security-user'
      color = '#F1416C' // danger red
    } else if (n.type === 'SUCCES') {
      icon = 'check-circle'
      color = '#50CD89' // success green
    } else if (n.type === 'ALERTE_PRODUCTION') {
      icon = 'setting-2'
      color = '#F1BC00' // warning yellow
    }

    let timeStr = 'Récemment'
    if (n.createdAt) {
      const diffMs = new Date().getTime() - new Date(n.createdAt).getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      if (diffMins < 60) {
        timeStr = `${diffMins}m`
      } else if (diffHours < 24) {
        timeStr = `${diffHours}h`
      } else {
        timeStr = new Date(n.createdAt).toLocaleDateString('fr-FR')
      }
    }

    return {
      id: n.id,
      title: n.titre,
      description: n.message,
      time: timeStr,
      icon: icon,
      color: color,
      read: n.lu
    }
  })

  return (
    <div className='app-navbar flex-shrink-0 d-flex align-items-center'>
      {/* Search Bar */}
      <Search />

      {/* Notifications Menu */}
      <div className={clsx('app-navbar-item', itemClass)}>
        <div
          className={clsx(
            'btn btn-icon btn-custom btn-active-light-primary position-relative',
            { 'pulse pulse-primary': unreadCount > 0 }
          )}
          data-kt-menu-trigger="{default: 'click'}"
          data-kt-menu-attach='parent'
          data-kt-menu-placement='bottom-end'
        >
          <KTIcon iconName='notification-on' className='fs-1' />
          {unreadCount > 0 && (
            <span className='position-absolute top-0 start-100 translate-middle badge badge-circle badge-danger h-18px w-18px fs-9 fw-bolder mt-2 ms-n2'>
              {unreadCount}
            </span>
          )}
        </div>
        <HeaderNotificationsMenu 
          notifications={mappedNotifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      </div>

      {/* Theme Mode Switcher */}
      <div className={clsx('app-navbar-item', itemClass)}>
        <ThemeModeSwitcher toggleBtnClass={clsx('btn-active-light-primary btn-custom')} />
      </div>

      {/* User Menu */}
      <div className={clsx('app-navbar-item', itemClass)}>
        <div
          className={clsx('cursor-pointer symbol', userAvatarClass)}
          data-kt-menu-trigger="{default: 'click'}"
          data-kt-menu-attach='parent'
          data-kt-menu-placement='bottom-end'
        >
          <img src={toAbsoluteUrl('/media/avatars/blank.png')} alt='User' />
        </div>
        <HeaderUserMenu />
      </div>

      {/* Mobile Toggle Menu */}
      {config.app?.header?.default?.menu?.display && (
        <div className='app-navbar-item d-lg-none ms-2 me-n3' title='Show header menu'>
          <div
            className='btn btn-icon btn-active-color-primary w-35px h-35px'
            id='kt_app_header_menu_toggle'
          >
            <i className='bi bi-text-left fs-2' />
          </div>
        </div>
      )}
    </div>
  )
}

export { Navbar }
