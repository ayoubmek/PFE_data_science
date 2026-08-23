import clsx from 'clsx'
import {FC} from 'react'
import {toAbsoluteUrl} from '../../../helpers'
import {useLang, setLanguage} from '../../../i18n/Metronici18n'

const languages = [
  {
    lang: 'en',
    name: 'English',
    flag: toAbsoluteUrl('/media/flags/united-states.svg'),
  },
  {
    lang: 'fr',
    name: 'French',
    flag: toAbsoluteUrl('/media/flags/france.svg'),
  },
]

const LanguageSwitcher: FC = () => {
  const lang = useLang()
  const currentLanguage = languages.find((x) => x.lang === lang) || languages[0]

  return (
    <div className='app-navbar-item ms-1 ms-md-4'>
      <div
        className='btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px'
        data-kt-menu-trigger='click'
        data-kt-menu-attach='parent'
        data-kt-menu-placement='bottom-end'
      >
        <img className='w-20px h-20px rounded-1' src={currentLanguage.flag} alt='metronic' />
      </div>

      <div className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-title-gray-700 menu-icon-muted menu-active-bg menu-state-primary fw-semibold py-4 fs-base w-175px' data-kt-menu='true'>
        {languages.map((l) => (
          <div
            className='menu-item px-3'
            key={l.lang}
            onClick={() => {
              setLanguage(l.lang)
            }}
          >
            {}
            <a
              href='#'
              className={clsx('menu-link d-flex px-5', {active: l.lang === currentLanguage.lang})}
            >
              <span className='symbol symbol-20px me-4'>
                <img className='rounded-1' src={l.flag} alt='metronic' />
              </span>
              {l.name}
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

export {LanguageSwitcher}