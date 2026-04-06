'use client'

import { create } from 'zustand'

type Language = 'id' | 'en'

interface LanguageStore {
  language: Language
  setLanguage: (lang: Language) => void
  t: (id: string, en: string) => string
}

export const useLanguageStore = create<LanguageStore>((set, get) => ({
  language: 'id',
  setLanguage: (lang: Language) => set({ language: lang }),
  t: (id: string, en: string) => {
    return get().language === 'id' ? id : en
  },
}))
