'use client';

import { useMemo, useEffect, useState, useCallback } from 'react';
import { translations, Language, Translations } from '@/lib/i18n/translations';
import { useSettings } from './useSettings';

export function useTranslation() {
  const { settings, isHydrated } = useSettings();
  const [translationKey, setTranslationKey] = useState(0);
  
  // 언어 변경 감지 및 강제 업데이트
  useEffect(() => {
    if (isHydrated) {
      setTranslationKey(prev => prev + 1);
    }
  }, [settings.language, isHydrated]);

  // Custom event listener for language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setTranslationKey(prev => prev + 1);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('language-changed', handleLanguageChange);
      return () => window.removeEventListener('language-changed', handleLanguageChange);
    }
  }, []);
  
  // 번역 객체 생성
  const t = useMemo((): Translations => {
    // SSR 중에는 한국어 기본값 반환
    if (!isHydrated) {
      return translations.ko;
    }
    
    const currentLanguage = settings.language as Language;
    const translation = translations[currentLanguage];
    
    if (!translation) {
      console.warn(`Translation not found for language: ${currentLanguage}, falling back to Korean`);
      return translations.ko;
    }
    
    return translation;
    // translationKey is intentionally included to force re-render on language changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.language, isHydrated, translationKey]);

  // 언어 변경 콜백
  const updateLanguage = useCallback(() => {
    setTranslationKey(prev => prev + 1);
  }, []);

  return { 
    t, 
    language: settings.language,
    updateLanguage
  };
}