'use client';

import React from 'react';
import { 
  Star, 
  GitFork, 
  Eye, 
  Calendar, 
  ExternalLink, 
  Users, 
  AlertCircle,
  BookOpen,
  Globe,
  CheckCircle
} from 'lucide-react';
import { Repository } from '@/types';
import { useSettings } from '../hooks/useSettings';

interface RepositoryCardProps {
  repository: Repository;
  className?: string;
}

export default function RepositoryCard({ repository, className = '' }: RepositoryCardProps) {
  const { settings, isHydrated } = useSettings();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-blue-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreLabel = (score?: number) => {
    if (!score) return '점수 없음';
    if (score >= 0.8) return '매우 적합';
    if (score >= 0.6) return '적합';
    if (score >= 0.4) return '보통';
    return '부분적 일치';
  };

  const topLanguages = repository.languages 
    ? Object.entries(repository.languages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
    : [];

  const totalBytes = topLanguages.reduce((sum, [, bytes]) => sum + bytes, 0);

  return (
    <div className={`rounded-lg border hover:shadow-lg transition-all duration-300 group ${
      isHydrated && settings.theme === 'dark'
        ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
        : 'bg-white border-gray-200 hover:border-blue-300'
    } ${className}`}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <a
                href={repository.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors group-hover:underline"
              >
                {repository.name}
              </a>
              <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            
            <p className={`text-sm mb-1 ${
              isHydrated && settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              by <span className="font-medium">{repository.owner.login}</span>
            </p>
            
            {repository.description && (
              <p className={`text-sm leading-relaxed line-clamp-2 mb-4 ${
                isHydrated && settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {repository.description}
              </p>
            )}
          </div>

          {/* Score Badge */}
          {repository.score !== undefined && (
            <div className="flex flex-col items-end space-y-1 ml-4">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getScoreColor(repository.score)} bg-opacity-10`}
                style={{ backgroundColor: `${getScoreColor(repository.score).replace('text-', '').replace('-600', '')}20` }}>
                {Math.round((repository.score || 0) * 100)}%
              </div>
              <span className="text-xs text-gray-500">{getScoreLabel(repository.score)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Languages */}
      {topLanguages.length > 0 && (
        <div className="px-6 pb-4">
          <div className="flex items-center space-x-4">
            <span className={`text-sm font-medium ${
              isHydrated && settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>언어:</span>
            <div className="flex space-x-3">
              {topLanguages.map(([language, bytes]) => {
                const percentage = ((bytes / totalBytes) * 100).toFixed(1);
                return (
                  <div key={language} className="flex items-center space-x-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getLanguageColor(language) }}
                    />
                    <span className={`text-sm ${
                      isHydrated && settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {language} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="px-6 pb-4">
        <div className={`flex items-center space-x-6 text-sm ${
          isHydrated && settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <div className="flex items-center space-x-1">
            <Star size={16} className="text-yellow-500" />
            <span className="font-medium">{formatNumber(repository.stargazers_count)}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <GitFork size={16} className="text-blue-500" />
            <span className="font-medium">{formatNumber(repository.forks_count)}</span>
          </div>
          
          {repository.open_issues_count > 0 && (
            <div className="flex items-center space-x-1">
              <AlertCircle size={16} className="text-green-500" />
              <span className="font-medium">{formatNumber(repository.open_issues_count)} 이슈</span>
            </div>
          )}
          
          <div className="flex items-center space-x-1">
            <Calendar size={16} className="text-gray-400" />
            <span>{formatDate(repository.updated_at)}</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="px-6 pb-4">
        <div className="flex flex-wrap gap-2">
          {repository.has_contributing_guide && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs">
              <BookOpen size={12} />
              <span>기여 가이드</span>
            </div>
          )}
          
          {repository.good_first_issues_count && repository.good_first_issues_count > 0 && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs">
              <Star size={12} />
              <span>{repository.good_first_issues_count}개 초보자 이슈</span>
            </div>
          )}
          
          {repository.license && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
              <CheckCircle size={12} />
              <span>{repository.license.name}</span>
            </div>
          )}
          
          {repository.topics && repository.topics.length > 0 && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">
              <Globe size={12} />
              <span>{repository.topics.length}개 토픽</span>
            </div>
          )}
        </div>
      </div>

      {/* Topics */}
      {repository.topics && repository.topics.length > 0 && (
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-1">
            {repository.topics.slice(0, 5).map((topic) => (
              <span
                key={topic}
                className={`inline-block px-2 py-1 text-xs rounded ${
                  isHydrated && settings.theme === 'dark'
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {topic}
              </span>
            ))}
            {repository.topics.length > 5 && (
              <span className={`inline-block px-2 py-1 text-xs ${
                isHydrated && settings.theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                +{repository.topics.length - 5} 더보기
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className={`px-6 py-4 border-t rounded-b-lg ${
        isHydrated && settings.theme === 'dark'
          ? 'bg-gray-900 border-gray-600'
          : 'bg-gray-50 border-gray-100'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <a
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              저장소 보기
            </a>
            <a
              href={`${repository.html_url}/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-green-600 hover:text-green-800 transition-colors"
            >
              초보자 이슈
            </a>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={repository.owner.avatar_url}
              alt={repository.owner.login}
              className="w-6 h-6 rounded-full"
            />
            <span className={`text-sm ${
              isHydrated && settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>{repository.owner.login}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getLanguageColor(language: string): string {
  const colors: { [key: string]: string } = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Python': '#3572A5',
    'Java': '#b07219',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'C++': '#f34b7d',
    'C#': '#239120',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Swift': '#ffac45',
    'Kotlin': '#F18E33',
    'HTML': '#e34c26',
    'CSS': '#1572B6',
    'Vue': '#2c3e50',
    'React': '#61dafb',
  };
  
  return colors[language] || '#6B7280';
}