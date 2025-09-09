'use client';

import React from 'react';
import { Loader2, Search, Github } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  type?: 'search' | 'general';
}

export default function LoadingSpinner({ 
  message = "로딩 중...", 
  size = 'md',
  type = 'general'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerSizeClasses = {
    sm: 'py-4',
    md: 'py-8',
    lg: 'py-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (type === 'search') {
    return (
      <div className={`flex flex-col items-center justify-center ${containerSizeClasses[size]} space-y-4`}>
        <div className="relative">
          {/* GitHub icon with pulsing effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Github className={`${sizeClasses[size]} text-gray-300 animate-pulse`} />
          </div>
          {/* Rotating search icon */}
          <Search className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
        </div>
        
        <div className="text-center space-y-2">
          <p className={`font-medium text-gray-900 ${textSizeClasses[size]}`}>
            GitHub 저장소 검색 중...
          </p>
          <p className="text-sm text-gray-600 max-w-md">
            선택하신 언어와 기여 유형에 맞는 최적의 오픈소스 프로젝트를 찾고 있습니다.
          </p>
          
          {/* Progress indicators */}
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${containerSizeClasses[size]} space-y-3`}>
      <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
      <p className={`text-gray-600 ${textSizeClasses[size]}`}>
        {message}
      </p>
    </div>
  );
}

// Skeleton loading component for repository cards
export function RepositoryCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
      </div>
      
      {/* Languages */}
      <div className="flex space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex space-x-6 mb-4">
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-8"></div>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-8"></div>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
      
      {/* Tags */}
      <div className="flex space-x-2 mb-4">
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        <div className="h-6 bg-gray-200 rounded-full w-24"></div>
      </div>
      
      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex space-x-4">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

// Loading state for repository list
export function RepositoryListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      {/* Controls skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
      </div>
      
      {/* Repository cards skeleton */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: count }, (_, i) => (
          <RepositoryCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}