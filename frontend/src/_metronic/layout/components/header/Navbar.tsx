import clsx from 'clsx'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { KTIcon, toAbsoluteUrl } from '../../../helpers'
import { HeaderUserMenu, ThemeModeSwitcher, Search, HeaderNotificationsMenu } from '../../../partials'
import { useLayout } from '../../core'

import { toggleNexoraDrawer } from '../../../../app/modules/apps/nexora/IndustrialNexoraDrawer'

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
    const interval = setInterval(fetchNotifications, 20000)
    return () => clearInterval(interval)
  }, [])

  const mappedNotifications = notifications.map((n: any) => {
    let icon = 'notification-on'
    let color = '#3E97FF' 
    if (n.type === 'ALERTE_STOCK' || n.priorite === 'CRITIQUE') {
      icon = 'security-user'
      color = '#F1416C' 
    } else if (n.type === 'SUCCES') {
      icon = 'check-circle'
      color = '#50CD89' 
    } else if (n.type === 'ALERTE_PRODUCTION') {
      icon = 'setting-2'
      color = '#F1BC00' 
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

    const cleanTitle = (n.titre || '').replace(/^[?\s\uFFFD]+/, '').trim()
    return {
      id: n.id,
      title: cleanTitle || n.titre,
      description: n.message,
      time: timeStr,
      icon: icon,
      color: color,
      read: n.lu
    }
  })

  return (
    <div className='app-navbar flex-shrink-0 d-flex align-items-center'>
      {}
      <Search />

      {/* Assistant Décisionnel Trigger */}
      <div className={clsx('app-navbar-item', itemClass)}>
        <button
          type='button'
          className='btn btn-sm btn-light-primary d-flex align-items-center gap-2 px-3 py-2 shadow-xs rounded-pill border'
          onClick={() => toggleNexoraDrawer()}
          title='Assistant Décisionnel'
          style={{
            cursor: 'pointer'
          }}
        >
          <span
            className='rounded-circle bg-white d-flex align-items-center justify-content-center shadow-xs'
            style={{ width: '22px', height: '22px', padding: '2px' }}
          >
            <img
              src={toAbsoluteUrl('/media/pfe/logo.png')}
              alt='Logo'
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              onError={(e: any) => {
                e.target.style.display = 'none'
                e.target.parentElement.innerHTML = '<i class="bi bi-chat-left-text text-primary fs-7"></i>'
              }}
            />
          </span>
          <span className='fw-bold fs-7 text-gray-800 d-none d-md-inline'>Assistant</span>
        </button>
      </div>

      {}
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

      {}
      <div className={clsx('app-navbar-item', itemClass)}>
        <ThemeModeSwitcher toggleBtnClass={clsx('btn-active-light-primary btn-custom')} />
      </div>

      {}
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

      {}
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