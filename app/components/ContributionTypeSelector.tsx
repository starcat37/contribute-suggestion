'use client';

import React from 'react';
import { Check, FileText, Globe, Bug, Plus, TestTube, Code, Star } from 'lucide-react';
import { CONTRIBUTION_TYPES } from '@/types';

interface ContributionTypeSelectorProps {
  selectedTypes: string[];
  onTypeChange: (types: string[]) => void;
  maxSelections?: number;
}

const contributionTypeIcons: { [key: string]: React.ReactNode } = {
  'documentation': <FileText size={20} />,
  'translation': <Globe size={20} />,
  'bug-fix': <Bug size={20} />,
  'feature': <Plus size={20} />,
  'testing': <TestTube size={20} />,
  'refactoring': <Code size={20} />,
  'good-first-issue': <Star size={20} />,
};

const contributionTypeColors: { [key: string]: string } = {
  'documentation': 'bg-blue-500',
  'translation': 'bg-green-500',
  'bug-fix': 'bg-red-500',
  'feature': 'bg-purple-500',
  'testing': 'bg-orange-500',
  'refactoring': 'bg-indigo-500',
  'good-first-issue': 'bg-yellow-500',
};

export default function ContributionTypeSelector({ 
  selectedTypes, 
  onTypeChange, 
  maxSelections = 4 
}: ContributionTypeSelectorProps) {
  
  const handleTypeToggle = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      // Remove type
      onTypeChange(selectedTypes.filter(type => type !== typeId));
    } else if (selectedTypes.length < maxSelections) {
      // Add type
      onTypeChange([...selectedTypes, typeId]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          기여 유형 선택
        </h3>
        <span className="text-sm text-gray-500">
          {selectedTypes.length}/{maxSelections}개 선택됨
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CONTRIBUTION_TYPES.map((type) => {
          const isSelected = selectedTypes.includes(type.id);
          const isDisabled = !isSelected && selectedTypes.length >= maxSelections;
          const colorClass = contributionTypeColors[type.id] || 'bg-gray-500';
          
          return (
            <div key={type.id} className="relative">
              <button
                onClick={() => handleTypeToggle(type.id)}
                disabled={isDisabled}
                className={`
                  w-full p-4 rounded-lg border-2 text-left transition-all duration-200 group
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }
                  ${isDisabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'cursor-pointer'
                  }
                `}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className={`
                    flex-shrink-0 p-2 rounded-lg text-white transition-all duration-200
                    ${colorClass}
                    ${isSelected ? 'scale-110' : 'group-hover:scale-105'}
                  `}>
                    {contributionTypeIcons[type.id]}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">
                        {type.label}
                      </h4>
                      {/* Checkbox */}
                      <div className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
                        ${isSelected 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-gray-300 group-hover:border-gray-400'
                        }
                      `}>
                        {isSelected && <Check size={14} className="text-white" />}
                      </div>
                    </div>
                    
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                      {type.description}
                    </p>
                    
                    {/* Keywords */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {type.keywords.slice(0, 3).map((keyword) => (
                        <span 
                          key={keyword}
                          className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                      {type.keywords.length > 3 && (
                        <span className="inline-block px-2 py-0.5 text-xs text-gray-400">
                          +{type.keywords.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
              
              {/* Selected overlay effect */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Helper text */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">💡 선택 가이드</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>초보자 이슈</strong>: 처음 오픈소스에 기여하시는 분께 추천</li>
          <li>• <strong>문서 개선</strong>: 코딩보다는 문서 작성을 선호하시는 분께 추천</li>
          <li>• <strong>번역</strong>: 다국어 지원에 관심이 있으시다면 선택해보세요</li>
          <li>• <strong>버그 수정</strong>: 문제를 찾고 해결하는 것을 좋아하시는 분께 추천</li>
        </ul>
      </div>

      {selectedTypes.length >= maxSelections && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            <strong>최대 선택 수에 도달했습니다.</strong><br />
            더 정확한 추천을 위해 {maxSelections}개까지만 선택할 수 있습니다. 
            다른 유형을 선택하려면 기존 선택을 해제해주세요.
          </p>
        </div>
      )}
    </div>
  );
}