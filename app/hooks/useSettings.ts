'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useRepositorySearch';

interface Settings {
  githubToken?: string;
  theme: 'light' | 'dark';
  language: 'ko' | 'en' | 'zh' | 'ja' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'ar' | 'hi';
}

const defaultSettings: Settings = {
  theme: 'light',
  language: 'ko',
};

export function useSettings() {
  const [settings, setSettings, removeSettings] = useLocalStorage<Settings>('app-settings', defaultSettings);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // GitHub 토큰 유효성 검증
  const validateToken = useCallback(async (token: string): Promise<boolean> => {
    if (!token || token.trim() === '') {
      return false;
    }

    setIsValidating(true);
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      const isValid = response.ok;
      setIsTokenValid(isValid);
      return isValid;
    } catch (error) {
      console.error('Token validation failed:', error);
      setIsTokenValid(false);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, []);

  // 설정 업데이트
  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, [setSettings]);

  // GitHub 토큰 설정
  const setGithubToken = useCallback(async (token: string) => {
    const isValid = await validateToken(token);
    if (isValid) {
      updateSettings({ githubToken: token });
    }
    return isValid;
  }, [validateToken, updateSettings]);

  // 토큰 제거
  const removeGithubToken = useCallback(() => {
    setSettings(prev => ({ ...prev, githubToken: undefined }));
    setIsTokenValid(null);
  }, [setSettings]);

  // 테마 변경
  const setTheme = useCallback((theme: 'light' | 'dark') => {
    updateSettings({ theme });
    // HTML 클래스에 즉시 적용
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    }
  }, [updateSettings]);

  // 언어 설정
  const setLanguage = useCallback((language: 'ko' | 'en' | 'zh' | 'ja' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'ar' | 'hi') => {
    updateSettings({ language });
    // HTML lang 속성에 즉시 적용
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [updateSettings]);


  // 초기화
  const resetSettings = useCallback(() => {
    removeSettings();
    setIsTokenValid(null);
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [removeSettings]);

  // 컴포넌트 마운트 시 토큰 검증
  useEffect(() => {
    if (settings.githubToken) {
      validateToken(settings.githubToken);
    }
  }, [settings.githubToken, validateToken]);

  // 하이드레이션 상태 체크
  useEffect(() => {
    setIsHydrated(true);
    
    // 하이드레이션 완료 시 즉시 현재 설정 적용
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(settings.theme);
      document.documentElement.lang = settings.language;
    }
  }, []);

  // 설정 변경 시 즉시 DOM 업데이트
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(settings.theme);
      document.documentElement.lang = settings.language;
    }
  }, [settings.theme, settings.language, isHydrated]);

  return {
    settings: isHydrated ? settings : defaultSettings, // SSR 불일치 방지
    updateSettings,
    setGithubToken,
    removeGithubToken,
    setTheme,
    setLanguage,
    resetSettings,
    isTokenValid,
    isValidating,
    validateToken,
    isHydrated,
  };
}