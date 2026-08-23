
import clsx from 'clsx'
import { FC } from 'react'
import { Link } from 'react-router-dom'
import {
  KTIcon,
  toAbsoluteUrl,
} from '../../../helpers'

type Notification = {
  id: number;
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
  read?: boolean;
};

const HeaderNotificationsMenu: FC<{
  notifications?: Notification[]
  onMarkAsRead?: (id: number) => void
  onMarkAllAsRead?: () => void
}> = ({ notifications = [], onMarkAsRead, onMarkAllAsRead }) => (
  <div
    className='menu menu-sub menu-sub-dropdown menu-column w-350px w-lg-375px'
    data-kt-menu='true'
  >
    <div
      className='d-flex flex-column bgi-no-repeat rounded-top'
      style={{
        backgroundImage: `url('${toAbsoluteUrl('/media/misc/menu-header-bg.jpg')}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className='d-flex flex-column px-9 mt-10 mb-6 bg-dark bg-opacity-25 rounded-top pt-3 pb-3'>
        <div className='d-flex justify-content-between align-items-center'>
          <h3 className='text-white fw-bold m-0 fs-5'>Notifications</h3>
          {notifications.some(n => !n.read) && onMarkAllAsRead && (
            <button 
              className='btn btn-link text-white text-hover-primary p-0 fs-8 fw-bold border-0 shadow-none'
              onClick={onMarkAllAsRead}
            >
              Tout marquer comme lu
            </button>
          )}
        </div>
        <span className='fs-8 text-white opacity-75 fw-semibold mt-1'>
          Vous avez {notifications.filter(n => !n.read).length} nouvelles alertes
        </span>
      </div>
    </div>

    <div className='tab-content'>
      <div className='tab-pane fade show active' role='tabpanel'>
        <div className='scroll-y mh-350px my-2 overflow-x-hidden'>
          {notifications.length === 0 ? (
            <div className="d-flex flex-column flex-center py-20">
              <KTIcon iconName='notification-on' className='fs-3x text-gray-300 mb-4' />
              <div className="text-gray-500 fw-semibold">Aucune nouvelle alerte</div>
            </div>
          ) : (
            notifications.map((notif, i) => (
              <div
                key={notif.id || i}
                onClick={() => !notif.read && onMarkAsRead && onMarkAsRead(notif.id)}
                className={clsx(
                  'd-flex flex-stack py-4 px-8 border-bottom border-gray-200 border-bottom-dashed cursor-pointer transition-all duration-200',
                  'hover-elevate-up hover:bg-light-primary',
                  { 'bg-light-light': notif.read }
                )}
              >
                <div className='d-flex align-items-center'>
                  <div className='symbol symbol-40px me-4'>
                    <span
                      className='symbol-label rounded-circle shadow-sm'
                      style={{
                        backgroundColor: `${notif.color}15`,
                        color: notif.color,
                        border: `1px solid ${notif.color}30`
                      }}
                    >
                      <KTIcon iconType='duotone' iconName={notif.icon} className='fs-2' />
                    </span>
                  </div>

                  <div className='mb-0 me-2' style={{ maxWidth: '200px' }}>
                    <span className={clsx('fs-7 text-gray-800 text-hover-primary d-block', { 'fw-bold': !notif.read })}>
                      {notif.title}
                    </span>
                    <div className='text-muted fs-8 fw-medium text-truncate' style={{ maxWidth: '200px' }}>
                      {notif.description}
                    </div>
                  </div>
                </div>

                <div className='d-flex flex-column align-items-end flex-shrink-0'>
                  <span className='text-muted fw-bold fs-9 mb-1'>{notif.time}</span>
                  {!notif.read && (
                    <span className='bullet bullet-dot bg-primary h-6px w-6px shadow-sm'></span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className='py-4 text-center border-top'>
          <Link
            to='/dashboard'
            className='btn btn-sm btn-light-primary fw-bold fs-8 px-6 rounded-pill'
          >
            Retour au Tableau de Bord <KTIcon iconName='arrow-right' className='ms-2 fs-7' />
          </Link>
        </div>
      </div>
    </div>
  </div>
)

export { HeaderNotificationsMenu }