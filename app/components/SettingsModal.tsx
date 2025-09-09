'use client';

import React, { useState } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Github, 
  Moon, 
  Sun, 
  Globe,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useTranslation } from '../hooks/useTranslation';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { 
    settings, 
    setGithubToken, 
    removeGithubToken, 
    setTheme, 
    setLanguage, 
    resetSettings,
    isTokenValid,
    isValidating
  } = useSettings();
  
  const { t } = useTranslation();

  const [showToken, setShowToken] = useState(false);
  const [tokenInput, setTokenInput] = useState(settings.githubToken || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToken = async () => {
    if (!tokenInput.trim()) return;
    
    setIsSaving(true);
    const isValid = await setGithubToken(tokenInput.trim());
    setIsSaving(false);
    
    if (!isValid) {
      alert(t.settingsModal.invalidToken);
    }
  };

  const handleRemoveToken = () => {
    if (confirm(t.settingsModal.resetConfirm)) {
      removeGithubToken();
      setTokenInput('');
    }
  };

  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷', nativeName: '한국어' },
    { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
    { code: 'zh', name: '中文', flag: '🇨🇳', nativeName: '中文' },
    { code: 'ja', name: '日本語', flag: '🇯🇵', nativeName: '日本語' },
    { code: 'es', name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹', nativeName: 'Italiano' },
    { code: 'pt', name: 'Português', flag: '🇵🇹', nativeName: 'Português' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺', nativeName: 'Русский' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', nativeName: 'العربية' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', nativeName: 'हिन्दी' },
  ];

  const programmingLanguages = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
    'PHP', 'Ruby', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl',
    'Haskell', 'Erlang', 'Clojure', 'F#', 'Dart', 'Elixir', 'Lua', 'Shell'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <SettingsIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t.settingsModal.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* GitHub Token Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Github className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t.settingsModal.githubToken}</h3>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {t.settingsModal.githubTokenDescription}
                <a 
                  href="https://github.com/settings/tokens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
                >
                  {t.settingsModal.createToken}
                </a>
              </p>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder={t.settingsModal.tokenPlaceholder}
                  className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveToken}
                  disabled={!tokenInput.trim() || isSaving || isValidating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {(isSaving || isValidating) && <Loader2 size={16} className="animate-spin" />}
                  <span>{isSaving ? t.settingsModal.saving : isValidating ? t.settingsModal.validating : t.settingsModal.save}</span>
                </button>
                
                {settings.githubToken && (
                  <button
                    onClick={handleRemoveToken}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    {t.settingsModal.remove}
                  </button>
                )}

                {/* Token status */}
                {isTokenValid !== null && (
                  <div className="flex items-center space-x-1">
                    {isTokenValid ? (
                      <>
                        <Check size={16} className="text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400">{t.settingsModal.validToken}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} className="text-red-500" />
                        <span className="text-sm text-red-600 dark:text-red-400">{t.settingsModal.invalidToken}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Theme Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              {settings.theme === 'dark' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t.settingsModal.theme}</h3>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  // 즉시 DOM 업데이트
                  if (typeof window !== 'undefined') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                  setTheme('light');
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                  settings.theme === 'light'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Sun size={18} />
                <span>{t.settingsModal.light}</span>
              </button>
              
              <button
                onClick={() => {
                  // 즉시 DOM 업데이트
                  if (typeof window !== 'undefined') {
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                  }
                  setTheme('dark');
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                  settings.theme === 'dark'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Moon size={18} />
                <span>{t.settingsModal.dark}</span>
              </button>
            </div>
          </div>

          {/* Language Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t.settingsModal.language}</h3>
            </div>
            
            <div className="relative">
              <select
                value={settings.language}
                onChange={(e) => {
                  const newLanguage = e.target.value;
                  
                  // Only proceed if the language is supported
                  const supportedLanguages = ['ko', 'en', 'zh'];
                  const actualLanguage = supportedLanguages.includes(newLanguage) ? newLanguage : 'ko';
                  
                  // 즉시 HTML lang 속성 업데이트
                  if (typeof window !== 'undefined') {
                    document.documentElement.lang = actualLanguage;
                  }
                  setLanguage(actualLanguage as any);
                  
                  // 컴포넌트 강제 리렌더링을 위한 이벤트 발생
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('language-changed', { 
                      detail: { language: actualLanguage } 
                    }));
                  }, 100);
                }}
                className="w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white appearance-none bg-white dark:bg-gray-700"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName}
                  </option>
                ))}
              </select>
              
              {/* Custom dropdown arrow */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              
              {/* Language support notice */}
              {!['ko', 'en', 'zh'].includes(settings.language) && (
                <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ This language is not fully supported yet. The interface will display in Korean as fallback.
                    <br />
                    <span className="text-xs mt-1 block">Currently supported: 한국어, English, 中文</span>
                  </p>
                </div>
              )}
            </div>
          </div>


          {/* Actions Section */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
            {/* Save Settings */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                설정을 저장하고 페이지를 새로고침하여 모든 변경사항을 적용합니다.
              </p>
              <button
                onClick={() => {
                  // Save current settings to localStorage
                  const currentSettings = {
                    githubToken: tokenInput.trim() || settings.githubToken,
                    theme: settings.theme,
                    language: settings.language
                  };
                  
                  localStorage.setItem('app-settings', JSON.stringify(currentSettings));
                  
                  // Refresh the page to apply all changes
                  window.location.reload();
                }}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                ⚡ 설정 저장 및 적용
              </button>
            </div>

            {/* Reset Settings */}
            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                모든 설정을 초기값으로 되돌립니다. (GitHub 토큰 포함)
              </p>
              <button
                onClick={() => {
                  if (confirm(t.settingsModal.resetConfirm)) {
                    resetSettings();
                    setTokenInput('');
                  }
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                🔄 {t.settingsModal.resetSettings}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}