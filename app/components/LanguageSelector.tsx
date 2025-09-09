'use client';

import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { POPULAR_LANGUAGES } from '@/types';

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onLanguageChange: (languages: string[]) => void;
  maxSelections?: number;
}

export default function LanguageSelector({ 
  selectedLanguages, 
  onLanguageChange, 
  maxSelections = 5 
}: LanguageSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const popularLanguages = POPULAR_LANGUAGES.map(lang => lang.name);
  
  const filteredLanguages = popularLanguages.filter(lang =>
    lang.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedLanguages.includes(lang)
  );

  const handleLanguageToggle = (language: string) => {
    if (selectedLanguages.includes(language)) {
      // Remove language
      onLanguageChange(selectedLanguages.filter(lang => lang !== language));
    } else if (selectedLanguages.length < maxSelections) {
      // Add language
      onLanguageChange([...selectedLanguages, language]);
    }
  };

  const handleRemoveLanguage = (language: string) => {
    onLanguageChange(selectedLanguages.filter(lang => lang !== language));
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredLanguages.length > 0) {
      e.preventDefault();
      const firstResult = filteredLanguages[0];
      if (!selectedLanguages.includes(firstResult) && selectedLanguages.length < maxSelections) {
        handleLanguageToggle(firstResult);
        setSearchTerm('');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          프로그래밍 언어 선택
        </h3>
        <span className="text-sm text-gray-500">
          {selectedLanguages.length}/{maxSelections}개 선택됨
        </span>
      </div>
      
      {/* Selected languages */}
      {selectedLanguages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedLanguages.map((language) => {
            const languageColor = POPULAR_LANGUAGES.find(
              lang => lang.name === language
            )?.color || '#6B7280';
            
            return (
              <div
                key={language}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white border-2 shadow-sm"
                style={{ borderColor: languageColor, color: languageColor }}
              >
                <span>{language}</span>
                <button
                  onClick={() => handleRemoveLanguage(language)}
                  className="ml-2 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label={`Remove ${language}`}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          onKeyDown={handleSearchKeyDown}
          placeholder="언어 검색 또는 아래에서 선택..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          disabled={selectedLanguages.length >= maxSelections}
        />

        {/* Search dropdown */}
        {isSearchFocused && searchTerm && filteredLanguages.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
            {filteredLanguages.slice(0, 8).map((language) => {
              const languageColor = POPULAR_LANGUAGES.find(
                lang => lang.name === language
              )?.color || '#6B7280';
              
              return (
                <button
                  key={language}
                  onClick={() => {
                    handleLanguageToggle(language);
                    setSearchTerm('');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <div
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: languageColor }}
                  />
                  {language}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Popular language chips */}
      <div>
        <p className="text-sm text-gray-600 mb-2">인기 언어:</p>
        <div className="flex flex-wrap gap-2">
          {popularLanguages.slice(0, 12).map((language) => {
            const isSelected = selectedLanguages.includes(language);
            const isDisabled = !isSelected && selectedLanguages.length >= maxSelections;
            const languageData = POPULAR_LANGUAGES.find(lang => lang.name === language);
            const color = languageData?.color || '#6B7280';
            
            return (
              <button
                key={language}
                onClick={() => handleLanguageToggle(language)}
                disabled={isDisabled}
                className={`
                  inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                  ${isSelected 
                    ? 'text-white shadow-md transform scale-105' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                style={isSelected ? { backgroundColor: color } : {}}
              >
                <div
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.8)' : color }}
                />
                {language}
              </button>
            );
          })}
        </div>
      </div>

      {selectedLanguages.length >= maxSelections && (
        <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
          최대 {maxSelections}개의 언어까지 선택할 수 있습니다. 더 추가하려면 기존 언어를 제거해주세요.
        </p>
      )}
    </div>
  );
}