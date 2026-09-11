import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import fr from './fr.json'

const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('eg_lang') : null

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, fr: { translation: fr } },
  lng: stored || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export function setLanguage(lang: string) {
  localStorage.setItem('eg_lang', lang)
  i18n.changeLanguage(lang)
}

export default i18n
