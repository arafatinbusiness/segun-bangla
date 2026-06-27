'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface UITemplate {
  id: string; name: string
  layout: 'default' | 'prothom-alo' | 'news-grid'
  primaryColor: string; secondaryColor: string; accentColor: string
  bgColor: string; cardBg: string; textColor: string; headingColor: string
  borderColor: string; borderRadius: string; cardShadow: string; imageRadius: string; spacing: string
}

const DEFAULT: UITemplate = {
  id: 'default', name: '\u0995\u09cd\u09b2\u09be\u09b8\u09bf\u0995 \u09b8\u09c7\u0997\u09c1\u09a8',
  layout: 'default',
  primaryColor: '#FF0000', secondaryColor: '#000000', accentColor: '#FF4444',
  bgColor: '#FFFFFF', cardBg: '#FFFFFF', textColor: '#000000',
  headingColor: '#000000', borderColor: '#E5E7EB',
  borderRadius: '8px', cardShadow: '0 1px 3px rgba(0,0,0,0.1)', imageRadius: '8px', spacing: '16px',
}

const TEMPLATES: Record<string, UITemplate> = {
  'default': DEFAULT,
  'prothom-alo': {
    id: 'prothom-alo', name: '\u09aa\u09cd\u09b0\u09a5\u09ae \u0986\u09b2\u09cb \u09b8\u09cd\u099f\u09be\u0987\u09b2',
    layout: 'prothom-alo',
    primaryColor: '#CC0000', secondaryColor: '#1A1A1A', accentColor: '#E00000',
    bgColor: '#FFFFFF', cardBg: '#FFFFFF', textColor: '#1A1A1A',
    headingColor: '#1A1A1A', borderColor: '#E0E0E0',
    borderRadius: '0px', cardShadow: '0 1px 2px rgba(0,0,0,0.06)', imageRadius: '0px', spacing: '12px',
  },
  'news-grid': {
    id: 'news-grid', name: '\u09a8\u09bf\u0989\u099c\u09aa\u09c7\u09aa\u09be\u09b0 \u0997\u09cd\u09b0\u09bf\u09a1',
    layout: 'news-grid',
    primaryColor: '#C00000', secondaryColor: '#1A1A1A', accentColor: '#FF0000',
    bgColor: '#FFFFFF', cardBg: '#FFFFFF', textColor: '#1A1A1A',
    headingColor: '#1A1A1A', borderColor: '#E0E0E0',
    borderRadius: '0px', cardShadow: 'none', imageRadius: '0px', spacing: '0px',
  },
}

const ThemeCtx = createContext({ template: DEFAULT })

export function useTheme() { return useContext(ThemeCtx) }

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [template, setTemplate] = useState<UITemplate>(DEFAULT)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getDoc(doc(db, 'settings', 'ui-template')).then(snap => {
      if (snap.exists() && snap.data().templateId && TEMPLATES[snap.data().templateId]) {
        setTemplate(TEMPLATES[snap.data().templateId])
      }
    }).catch(() => {}).finally(() => {
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!loaded) return
    const r = document.documentElement
    r.style.setProperty('--theme-primary', template.primaryColor)
    r.style.setProperty('--theme-secondary', template.secondaryColor)
    r.style.setProperty('--theme-accent', template.accentColor)
    r.style.setProperty('--theme-bg', template.bgColor)
    r.style.setProperty('--theme-card-bg', template.cardBg)
    r.style.setProperty('--theme-text', template.textColor)
    r.style.setProperty('--theme-heading', template.headingColor)
    r.style.setProperty('--theme-border', template.borderColor)
    r.style.setProperty('--theme-radius', template.borderRadius)
    r.style.setProperty('--theme-card-shadow', template.cardShadow)
    r.style.setProperty('--theme-image-radius', template.imageRadius)
    r.style.setProperty('--theme-spacing', template.spacing)
  }, [template, loaded])

  return <ThemeCtx.Provider value={{ template }}>{children}</ThemeCtx.Provider>
}
