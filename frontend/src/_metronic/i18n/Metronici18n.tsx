import React, {FC, createContext, useContext} from 'react'
import {WithChildren} from '../helpers'

const I18N_CONFIG_KEY = process.env.REACT_APP_I18N_CONFIG_KEY || 'i18nConfig'

type Props = {
  selectedLang: 'en' | 'fr'
}
const initialState: Props = {
  selectedLang: 'fr',
}

function getConfig(): Props {
  const ls = localStorage.getItem(I18N_CONFIG_KEY)
  if (ls) {
    try {
      const parsed = JSON.parse(ls) as Props
      if (parsed.selectedLang === 'en' || parsed.selectedLang === 'fr') {
        return parsed
      }
    } catch (er) {
      console.error(er)
    }
  }
  return initialState
}


export function setLanguage(lang: string) {
  localStorage.setItem(I18N_CONFIG_KEY, JSON.stringify({selectedLang: lang}))
  window.location.reload()
}

const I18nContext = createContext<Props>(initialState)

const useLang = () => {
  return useContext(I18nContext).selectedLang
}

const MetronicI18nProvider: FC<WithChildren> = ({children}) => {
  const lang = getConfig()
  return <I18nContext.Provider value={lang}>{children}</I18nContext.Provider>
}

export {MetronicI18nProvider, useLang}