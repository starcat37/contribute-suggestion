'use client';

import { useState, useCallback } from 'react';
import { Repository, SearchFilters, SearchResponse } from '@/types';

interface UseRepositorySearchResult {
  repositories: Repository[];
  totalCount: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  search: (filters: Omit<SearchFilters, 'page' | 'limit'>) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

export function useRepositorySearch(): UseRepositorySearchResult {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<Omit<SearchFilters, 'page' | 'limit'> | null>(null);
  const [currentGithubToken, setCurrentGithubToken] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);

  const search = useCallback(async (filters: Omit<SearchFilters, 'page' | 'limit'>, githubToken?: string, userSettings?: { searchMode: 'include' | 'exclude', includedLanguages: string[], excludedLanguages: string[] }) => {
    setIsLoading(true);
    setError(null);
    setCurrentPage(1);
    setCurrentFilters(filters);
    setCurrentGithubToken(githubToken);

    try {
      const response = await fetch('/api/repositories/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...filters,
          page: 1,
          limit: 30,
          githubToken,
          ...userSettings,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch repositories');
      }

      const data: SearchResponse = await response.json();
      
      setRepositories(data.repositories);
      setTotalCount(data.totalCount);
      setHasMore(data.totalCount > data.repositories.length);
      
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      setRepositories([]);
      setTotalCount(0);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!currentFilters || isLoading || !hasMore) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextPage = currentPage + 1;
      const response = await fetch('/api/repositories/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...currentFilters,
          page: nextPage,
          limit: 30,
          githubToken: currentGithubToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load more repositories');
      }

      const data: SearchResponse = await response.json();
      
      setRepositories(prev => {
        // Remove duplicates when merging new repositories
        const combined = [...prev, ...data.repositories];
        const uniqueRepositories = Array.from(
          new Map(combined.map(repo => [repo.id, repo])).values()
        );
        setHasMore(uniqueRepositories.length < data.totalCount);
        return uniqueRepositories;
      });
      setCurrentPage(nextPage);
      
    } catch (err) {
      console.error('Load more error:', err);
      setError(err instanceof Error ? err.message : '추가 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [currentFilters, currentPage, isLoading, hasMore, currentGithubToken]);

  const reset = useCallback(() => {
    setRepositories([]);
    setTotalCount(0);
    setCurrentPage(1);
    setIsLoading(false);
    setError(null);
    setCurrentFilters(null);
    setCurrentGithubToken(undefined);
    setHasMore(true);
  }, []);

  return {
    repositories,
    totalCount,
    currentPage,
    isLoading,
    error,
    hasMore,
    search,
    loadMore,
    reset,
  };
}

// Hook for managing search form state
export function useSearchForm() {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedContributionTypes, setSelectedContributionTypes] = useState<string[]>([]);

  const reset = useCallback(() => {
    setSelectedLanguages([]);
    setSelectedContributionTypes([]);
  }, []);

  const isValid = selectedLanguages.length > 0 && selectedContributionTypes.length > 0;

  return {
    selectedLanguages,
    setSelectedLanguages,
    selectedContributionTypes,
    setSelectedContributionTypes,
    reset,
    isValid,
  };
}

// Hook for local storage persistence
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // 즉시 상태 업데이트
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // 다른 탭에서도 변경사항을 감지할 수 있도록 storage 이벤트 발생
        window.dispatchEvent(new StorageEvent('storage', {
          key,
          oldValue: JSON.stringify(storedValue),
          newValue: JSON.stringify(valueToStore),
          storageArea: window.localStorage
        }));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}

// Hook for search history
export function useSearchHistory() {
  const [searchHistory, setSearchHistory, removeSearchHistory] = useLocalStorage<Array<{
    id: string;
    languages: string[];
    contributionTypes: string[];
    timestamp: number;
    resultCount?: number;
  }>>('search-history', []);

  const addToHistory = useCallback((
    languages: string[], 
    contributionTypes: string[], 
    resultCount?: number
  ) => {
    const newEntry = {
      id: Date.now().toString(),
      languages,
      contributionTypes,
      timestamp: Date.now(),
      resultCount,
    };

    setSearchHistory(prev => {
      // Remove duplicates and keep only last 10
      const filtered = prev.filter(entry => 
        !(JSON.stringify(entry.languages.sort()) === JSON.stringify(languages.sort()) &&
          JSON.stringify(entry.contributionTypes.sort()) === JSON.stringify(contributionTypes.sort()))
      );
      
      return [newEntry, ...filtered].slice(0, 10);
    });
  }, [setSearchHistory]);

  const clearHistory = useCallback(() => {
    removeSearchHistory();
  }, [removeSearchHistory]);

  const getRecentLanguages = useCallback(() => {
    const allLanguages = searchHistory.flatMap(entry => entry.languages);
    const languageCounts = allLanguages.reduce((acc, lang) => {
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(languageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([lang]) => lang);
  }, [searchHistory]);

  const getRecentContributionTypes = useCallback(() => {
    const allTypes = searchHistory.flatMap(entry => entry.contributionTypes);
    const typeCounts = allTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type]) => type);
  }, [searchHistory]);

  return {
    searchHistory,
    addToHistory,
    clearHistory,
    getRecentLanguages,
    getRecentContributionTypes,
  };
}

// Hook for debounced values
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  });

  return debouncedValue;
}