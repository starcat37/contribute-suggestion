'use client';

import React, { useState, useEffect } from 'react';
import { Github, Heart, ExternalLink, Sparkles, Settings } from 'lucide-react';
import SearchForm from './components/SearchForm';
import RepositoryList from './components/RepositoryList';
import LoadingSpinner, { RepositoryListSkeleton } from './components/LoadingSpinner';
import SettingsModal from './components/SettingsModal';
import { useRepositorySearch, useSearchHistory } from './hooks/useRepositorySearch';
import { useSettings } from './hooks/useSettings';
import { useTranslation } from './hooks/useTranslation';

export default function Home() {
  const [showResults, setShowResults] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const { 
    repositories, 
    totalCount, 
    isLoading, 
    error, 
    hasMore, 
    search, 
    loadMore, 
    reset 
  } = useRepositorySearch();
  
  const { addToHistory, searchHistory, getRecentLanguages, getRecentContributionTypes } = useSearchHistory();
  const { settings, isHydrated } = useSettings();
  const { t } = useTranslation();

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setForceUpdate(prev => prev + 1);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('language-changed', handleLanguageChange);
      return () => window.removeEventListener('language-changed', handleLanguageChange);
    }
  }, []);

  const handleSearch = async (
    filters: {
      languages: string[];
      contributionTypes: string[];
    },
    advancedFilters?: {
      searchMode: 'include' | 'exclude';
      includedLanguages: string[];
      excludedLanguages: string[];
    }
  ) => {
    setShowResults(true);
    
    // Use advanced filters from search form if provided
    const userSettings = advancedFilters ? {
      searchMode: advancedFilters.searchMode,
      includedLanguages: advancedFilters.includedLanguages,
      excludedLanguages: advancedFilters.excludedLanguages
    } : undefined;
    
    // @ts-ignore - search function accepts 3 params but TypeScript isn't recognizing it
    await search(filters, settings.githubToken, userSettings);
    addToHistory(filters.languages, filters.contributionTypes, totalCount);
    
    // Scroll to results after a brief delay
    setTimeout(() => {
      const resultsElement = document.getElementById('search-results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleNewSearch = () => {
    setShowResults(false);
    reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show loading skeleton during initial search
  if (isLoading && repositories.length === 0 && showResults) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner 
            message={t.loading} 
            size="lg" 
            type="search"
          />
          <div className="mt-12">
            <RepositoryListSkeleton count={6} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isHydrated && settings.theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />

      {/* Header */}
      <header className={`${
        isHydrated && settings.theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } border-b sticky top-0 z-40`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Github size={32} className={isHydrated && settings.theme === 'dark' ? 'text-white' : 'text-gray-800'} />
              <span className="text-xl font-bold">{t.appTitle}</span>
            </div>
            
            <button
              onClick={() => setShowSettings(true)}
              className={`p-2 rounded-lg transition-colors ${
                isHydrated && settings.theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              title={t.settings}
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className={`${
        isHydrated && settings.theme === 'dark'
          ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-blue-900'
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
      }`}>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="flex justify-center items-center mb-6">
              <div className="relative">
                <Github size={64} className="text-gray-800" />
                <Sparkles size={24} className="absolute -top-2 -right-2 text-yellow-500" />
              </div>
            </div>
            
            <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${
              isHydrated && settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {t.appTitle}
            </h1>
            
            <p className={`text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed ${
              isHydrated && settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {t.appDescription}
            </p>

            {/* Stats */}
            <div className="flex justify-center space-x-8 mb-12">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">1000+</div>
                <div className="text-sm text-gray-600">추천된 저장소</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">50+</div>
                <div className="text-sm text-gray-600">지원 언어</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">7</div>
                <div className="text-sm text-gray-600">기여 유형</div>
              </div>
            </div>
          </div>

          {/* Search Form */}
          {!showResults && (
            <div className="max-w-4xl mx-auto">
              <SearchForm 
                onSearch={handleSearch} 
                isLoading={isLoading}
                error={error}
              />
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {showResults && (
        <div id="search-results" className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h2 className={`text-3xl font-bold mb-2 ${
                isHydrated && settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{t.searchResults}</h2>
              <p className={isHydrated && settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                {totalCount} {t.repositoriesFound}
              </p>
            </div>
            <button
              onClick={handleNewSearch}
              className="mt-4 sm:mt-0 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t.newSearch}
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Github className="w-8 h-8 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-red-800">
                    검색 중 오류가 발생했습니다
                  </h3>
                  <p className="text-red-700 mt-1">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    다시 시도
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results List */}
          {!error && (
            <RepositoryList
              repositories={repositories}
              totalCount={totalCount}
              isLoading={isLoading}
              onLoadMore={loadMore}
              hasMore={hasMore}
            />
          )}
        </div>
      )}

      {/* Features Section - Only show when no results */}
      {!showResults && (
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              어떻게 작동하나요?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              정교한 점수 알고리즘이 여러분의 선호도와 기술 수준을 분석하여 가장 적합한 오픈소스 프로젝트를 추천합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Github className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                맞춤형 추천
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                선호하는 프로그래밍 언어와 기여 유형을 기반으로 
                가장 적합한 저장소를 추천해드립니다.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                초보자 친화적
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                초보자를 위한 이슈와 기여 가이드가 있는 
                프로젝트를 우선적으로 추천합니다.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                실시간 분석
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                프로젝트의 활성도, 커뮤니티 응답성, 
                기여 가능성을 실시간으로 분석합니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Github size={24} className="mr-2" />
              <span className="text-lg font-semibold">오픈소스 기여 추천 시스템</span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm">
              <span>Made with</span>
              <Heart size={16} className="text-red-400" />
              <span>for Open Source Community</span>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-700 text-center text-sm text-gray-400">
            <p>
              GitHub API를 사용하여 실시간으로 저장소 정보를 제공합니다. 
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 ml-1 inline-flex items-center"
              >
                GitHub
                <ExternalLink size={12} className="ml-1" />
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}