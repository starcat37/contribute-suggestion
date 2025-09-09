'use client';

import React, { useState } from 'react';
import { 
  Filter, 
  SortAsc, 
  SortDesc, 
  Grid, 
  List, 
  Search,
  Star,
  GitFork,
  Calendar,
  TrendingUp
} from 'lucide-react';
import RepositoryCard from './RepositoryCard';
import { Repository } from '@/types';
import { useTranslation } from '../hooks/useTranslation';
import { useSettings } from '../hooks/useSettings';

interface RepositoryListProps {
  repositories: Repository[];
  totalCount: number;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

type SortOption = 'score' | 'stars' | 'forks' | 'updated' | 'created';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

export default function RepositoryList({ 
  repositories, 
  totalCount, 
  isLoading = false,
  onLoadMore,
  hasMore = false
}: RepositoryListProps) {
  const { t } = useTranslation();
  const { settings, isHydrated } = useSettings();
  const [sortBy, setSortBy] = useState<SortOption>('score');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [minStars, setMinStars] = useState<number | undefined>();
  const [maxStars, setMaxStars] = useState<number | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  // Filter repositories based on search and filters
  const filteredRepositories = repositories.filter(repo => {
    const matchesSearch = !searchTerm || 
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.owner.login.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMinStars = !minStars || repo.stargazers_count >= minStars;
    const matchesMaxStars = !maxStars || repo.stargazers_count <= maxStars;

    return matchesSearch && matchesMinStars && matchesMaxStars;
  });

  // Sort repositories
  const sortedRepositories = [...filteredRepositories].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'score':
        comparison = (b.score || 0) - (a.score || 0);
        break;
      case 'stars':
        comparison = b.stargazers_count - a.stargazers_count;
        break;
      case 'forks':
        comparison = b.forks_count - a.forks_count;
        break;
      case 'updated':
        comparison = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        break;
      case 'created':
        comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        break;
      default:
        comparison = 0;
    }

    return sortOrder === 'desc' ? comparison : -comparison;
  });

  const handleSortChange = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (option: SortOption) => {
    if (sortBy !== option) return null;
    return sortOrder === 'desc' ? <SortDesc size={16} /> : <SortAsc size={16} />;
  };

  const getActiveSort = (option: SortOption) => {
    return sortBy === option ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900';
  };

  if (repositories.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Search size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noResults}</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          선택하신 조건에 맞는 저장소를 찾을 수 없습니다. 
          다른 언어나 기여 유형을 선택해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className={`text-2xl font-bold ${
            isHydrated && settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>{t.searchResults}</h2>
          <p className={
            isHydrated && settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }>
            총 {totalCount.toLocaleString()}{t.repositoriesFound} 중 {filteredRepositories.length.toLocaleString()}개 표시
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <div className={`flex border rounded-lg overflow-hidden ${
            isHydrated && settings.theme === 'dark' 
              ? 'border-gray-600' 
              : 'border-gray-300'
          }`}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${
                viewMode === 'grid' 
                  ? 'bg-blue-500 text-white' 
                  : isHydrated && settings.theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${
                viewMode === 'list' 
                  ? 'bg-blue-500 text-white' 
                  : isHydrated && settings.theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`rounded-lg border p-4 ${
        isHydrated && settings.theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        {/* Search and Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="저장소 이름, 설명 또는 소유자로 검색..."
              className={`block w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                isHydrated && settings.theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-md text-sm transition-colors ${
              isHydrated && settings.theme === 'dark'
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} />
            <span>필터</span>
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  최소 스타 수
                </label>
                <input
                  type="number"
                  value={minStars || ''}
                  onChange={(e) => setMinStars(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="예: 100"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  최대 스타 수
                </label>
                <input
                  type="number"
                  value={maxStars || ''}
                  onChange={(e) => setMaxStars(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="예: 10000"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setMinStars(undefined);
                  setMaxStars(undefined);
                  setSearchTerm('');
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                초기화
              </button>
            </div>
          </div>
        )}

        {/* Sort Options */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700 py-2">정렬:</span>
          
          <button
            onClick={() => handleSortChange('score')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${getActiveSort('score')}`}
          >
            <TrendingUp size={14} />
            <span>적합도</span>
            {getSortIcon('score')}
          </button>
          
          <button
            onClick={() => handleSortChange('stars')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${getActiveSort('stars')}`}
          >
            <Star size={14} />
            <span>{t.stars}</span>
            {getSortIcon('stars')}
          </button>
          
          <button
            onClick={() => handleSortChange('forks')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${getActiveSort('forks')}`}
          >
            <GitFork size={14} />
            <span>{t.forks}</span>
            {getSortIcon('forks')}
          </button>
          
          <button
            onClick={() => handleSortChange('updated')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${getActiveSort('updated')}`}
          >
            <Calendar size={14} />
            <span>{t.lastUpdated}</span>
            {getSortIcon('updated')}
          </button>
        </div>
      </div>

      {/* Repository Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? 'grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' 
          : 'space-y-4'
      }>
        {sortedRepositories.map((repo) => (
          <RepositoryCard 
            key={repo.id} 
            repository={repo}
            className={viewMode === 'list' ? 'max-w-none' : ''}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="text-center pt-8">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? t.loading : t.loadMore}
          </button>
        </div>
      )}
      
      {/* No more results */}
      {!hasMore && sortedRepositories.length > 0 && (
        <div className="text-center pt-8 text-gray-500">
          <p>모든 검색 결과를 확인하셨습니다.</p>
        </div>
      )}
    </div>
  );
}