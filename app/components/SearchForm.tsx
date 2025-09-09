'use client';

import React, { useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import ContributionTypeSelector from './ContributionTypeSelector';
import { useSettings } from '../hooks/useSettings';

interface SearchFormProps {
  onSearch: (filters: {
    languages: string[];
    contributionTypes: string[];
  }, advancedFilters?: {
    searchMode: 'include' | 'exclude';
    includedLanguages: string[];
    excludedLanguages: string[];
  }) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function SearchForm({ onSearch, isLoading = false, error = null }: SearchFormProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedContributionTypes, setSelectedContributionTypes] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [languageFilterMode, setLanguageFilterMode] = useState<'include' | 'exclude'>('include');
  const [includedLanguages, setIncludedLanguages] = useState<string[]>([]);
  const [excludedLanguages, setExcludedLanguages] = useState<string[]>([]);
  const { settings, isHydrated } = useSettings();

  const canSearch = selectedLanguages.length > 0 && selectedContributionTypes.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSearch || isLoading) {
      return;
    }

    const advancedFilters = showAdvancedFilters ? {
      searchMode: languageFilterMode,
      includedLanguages,
      excludedLanguages,
    } : undefined;

    onSearch({
      languages: selectedLanguages,
      contributionTypes: selectedContributionTypes,
    }, advancedFilters);
  };

  const handleQuickStart = (preset: {
    languages: string[];
    contributionTypes: string[];
    label: string;
  }) => {
    setSelectedLanguages(preset.languages);
    setSelectedContributionTypes(preset.contributionTypes);
    // 자동 검색 제거 - 사용자가 검색 버튼을 직접 눌러야 함
  };

  const quickStartPresets = [
    {
      label: '🚀 JavaScript 초보자',
      languages: ['JavaScript', 'TypeScript'],
      contributionTypes: ['good-first-issue', 'documentation'],
    },
    {
      label: '🐍 Python 문서화',
      languages: ['Python'],
      contributionTypes: ['documentation', 'translation'],
    },
    {
      label: '🛠️ 전체 버그 헌터',
      languages: ['JavaScript', 'Python', 'TypeScript'],
      contributionTypes: ['bug-fix', 'testing'],
    },
  ];

  return (
    <div className={`rounded-lg shadow-lg p-6 ${
      isHydrated && settings.theme === 'dark' 
        ? 'bg-gray-800' 
        : 'bg-white'
    }`}>
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${
          isHydrated && settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          맞춤형 오픈소스 프로젝트 찾기
        </h2>
        <p className={`${
          isHydrated && settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          선호하는 언어와 기여 유형을 선택하면 가장 적합한 저장소를 추천해드립니다.
        </p>
      </div>

      {/* Quick Start */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
        <h3 className="font-semibold text-gray-900 mb-2">빠른 시작</h3>
        <p className="text-sm text-gray-600 mb-3">인기 조합을 선택한 후 검색 버튼을 눌러보세요:</p>
        <div className="flex flex-wrap gap-2">
          {quickStartPresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleQuickStart(preset)}
              disabled={isLoading}
              className="px-3 py-2 text-sm bg-white border border-blue-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Language Selection */}
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onLanguageChange={setSelectedLanguages}
          maxSelections={3}
        />

        {/* Contribution Type Selection */}
        <ContributionTypeSelector
          selectedTypes={selectedContributionTypes}
          onTypeChange={setSelectedContributionTypes}
          maxSelections={3}
        />

        {/* Advanced Filters Toggle */}
        <div className={`border-t pt-6 ${
          isHydrated && settings.theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
        }`}>
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center justify-between w-full text-left font-medium ${
              isHydrated && settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            <span>고급 필터 옵션</span>
            <span className={`transform transition-transform ${
              showAdvancedFilters ? 'rotate-180' : ''
            }`}>▼</span>
          </button>
          
          {showAdvancedFilters && (
            <div className="mt-4 space-y-4">
              {/* Language Filter Mode */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isHydrated && settings.theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  언어 필터 모드
                </label>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setLanguageFilterMode('include')}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      languageFilterMode === 'include'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : isHydrated && settings.theme === 'dark' 
                          ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                          : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    포함 모드
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguageFilterMode('exclude')}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      languageFilterMode === 'exclude'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : isHydrated && settings.theme === 'dark' 
                          ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                          : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    제외 모드
                  </button>
                </div>
                <p className={`text-sm mt-2 ${
                  isHydrated && settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {languageFilterMode === 'include' 
                    ? '선택한 언어만 검색 결과에 포함됩니다.' 
                    : '선택한 언어는 검색 결과에서 제외됩니다.'}
                </p>
              </div>

              {/* Language Selection for Advanced Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isHydrated && settings.theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {languageFilterMode === 'include' ? '포함할 언어' : '제외할 언어'} (선택사항)
                </label>
                <LanguageSelector
                  selectedLanguages={languageFilterMode === 'include' ? includedLanguages : excludedLanguages}
                  onLanguageChange={languageFilterMode === 'include' ? setIncludedLanguages : setExcludedLanguages}
                  maxSelections={10}
                  placeholder={`${languageFilterMode === 'include' ? '포함' : '제외'}할 언어를 선택하세요`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">검색 중 오류가 발생했습니다</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search Button */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="submit"
            disabled={!canSearch || isLoading}
            className={`
              flex items-center justify-center px-8 py-4 rounded-lg text-white font-semibold text-lg transition-all duration-200
              ${canSearch && !isLoading
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105' 
                : 'bg-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                검색 중...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                추천 저장소 찾기
              </>
            )}
          </button>

          {!canSearch && (
            <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4 mr-2" />
              언어와 기여 유형을 각각 하나 이상 선택해주세요
            </div>
          )}
        </div>

        {/* Selection Summary */}
        {(selectedLanguages.length > 0 || selectedContributionTypes.length > 0) && (
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-medium text-gray-900 mb-2">현재 선택:</h4>
            <div className="space-y-2 text-sm">
              {selectedLanguages.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">언어:</span>{' '}
                  <span className="text-blue-600">{selectedLanguages.join(', ')}</span>
                </div>
              )}
              {selectedContributionTypes.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">기여 유형:</span>{' '}
                  <span className="text-purple-600">
                    {selectedContributionTypes.map(type => {
                      const typeData = require('@/types').CONTRIBUTION_TYPES.find((t: any) => t.id === type);
                      return typeData?.label || type;
                    }).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}