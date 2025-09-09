'use client';

import { useEffect, useRef } from 'react';
import { useSettings } from '@/hooks/useSettings';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings, isHydrated } = useSettings();
  const initializedRef = useRef(false);

  // 초기 설정 로드 (브라우저 환경에서만)
  useEffect(() => {
    if (typeof window === 'undefined' || initializedRef.current) return;

    try {
      const savedSettings = localStorage.getItem('app-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(parsed.theme || 'light');
        document.documentElement.lang = parsed.language || 'ko';
      } else {
        // 기본값 적용
        document.documentElement.classList.add('light');
        document.documentElement.lang = 'ko';
      }
      initializedRef.current = true;
    } catch (error) {
      console.warn('Failed to load saved settings:', error);
      // 기본값 적용
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add('light');
      document.documentElement.lang = 'ko';
      initializedRef.current = true;
    }
  }, []);

  // 설정 변경 시 즉시 적용 (하이드레이션 완료 후)
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;

    // 테마 적용
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(settings.theme);

    // 언어 속성 적용
    document.documentElement.lang = settings.language;

    // 설정 변경 이벤트 발생 (다른 컴포넌트에서 감지할 수 있도록)
    window.dispatchEvent(new CustomEvent('theme-changed', { 
      detail: { theme: settings.theme, language: settings.language } 
    }));

  }, [settings.theme, settings.language, isHydrated]);

  return <>{children}</>;
}