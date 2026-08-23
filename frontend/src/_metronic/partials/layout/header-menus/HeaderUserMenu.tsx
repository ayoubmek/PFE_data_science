
import { FC, useEffect } from 'react'
import { useAuth } from '../../../../app/modules/auth'
import { Languages } from './Languages'
import { KTIcon, toAbsoluteUrl } from '../../../helpers'

const HeaderUserMenu: FC = () => {
  const { currentUser, logout } = useAuth()

  useEffect(() => {
    if (currentUser) {
      console.log('User Profile Data:', {
        name: (currentUser as any)?.name,
        roles: currentUser?.roles,
        email: currentUser?.email
      });
    }
  }, [currentUser]);

  const displayName =
    (currentUser as any)?.name ||
    [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ') ||
    currentUser?.username ||
    currentUser?.email ||
    'User'

  const rawRole = currentUser?.roles?.[0] || 'user'
  let badgeColor = 'badge-light-primary'
  let displayRoleLabel = rawRole.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  if (rawRole.includes('admin')) {
    badgeColor = 'badge-light-danger'
  } else if (rawRole.includes('seller')) {
    badgeColor = 'badge-light-success'
  } else if (rawRole.includes('logistic')) {
    badgeColor = 'badge-light-warning'
  }

  return (
    <div
      className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px'
      data-kt-menu='true'
    >
      {}
      <div className='menu-item px-3'>
        <div className='menu-content d-flex align-items-center px-3'>
          <div className='symbol symbol-50px me-5'>
            <img alt='Avatar' src={toAbsoluteUrl('/media/avatars/blank.png')} />
          </div>

          <div className='d-flex flex-column'>
            <div className='fw-bolder d-flex align-items-center fs-5 gap-2'>
              <span className="text-dark">{displayName}</span>
              <span className={`badge ${badgeColor} fw-bolder fs-8 px-2 py-1`}>
                {displayRoleLabel}
              </span>
            </div>
            <a href='#' className='fw-bold text-muted text-hover-primary fs-7'>
              {currentUser?.email}
            </a>
          </div>
        </div>
      </div>

      <div className='separator my-2'></div>

      <div className='menu-item px-5'>
        <a href='#' className='menu-link px-5'>
          <span className='menu-icon'>
            <KTIcon iconName='profile-circle' className='fs-2 me-3' />
          </span>
          My Profile
        </a>
      </div>

      <div className='separator my-2'></div>

      <Languages />

      <div className='separator my-2'></div>

      <div className='menu-item px-5'>
        <a onClick={logout} className='menu-link px-5 text-danger text-hover-danger'>
          <span className='menu-icon'>
            <KTIcon iconName='exit-right' className='fs-2 me-3 text-danger' />
          </span>
          Sign Out
        </a>
      </div>
    </div>
  )
}

export { HeaderUserMenu }