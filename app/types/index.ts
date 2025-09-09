export interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  topics: string[]
  updated_at: string
  created_at: string
  has_issues: boolean
  open_issues_count: number
  license: {
    key: string
    name: string
  } | null
  owner: {
    login: string
    avatar_url: string
    html_url: string
  }
  languages?: { [key: string]: number }
  contributing_url?: string
  has_contributing_guide?: boolean
  good_first_issues_count?: number
  readme_analysis?: ReadmeAnalysis | null
  score?: number
}

export interface SearchFilters {
  languages: string[]
  contributionTypes: string[]
  page?: number
  limit?: number
}

export interface SearchResponse {
  repositories: Repository[]
  totalCount: number
  page: number
}

export interface ContributionType {
  id: string
  label: string
  description: string
  keywords: string[]
}

export interface Language {
  name: string
  color?: string
  popularity?: number
}

export interface RepositoryScore {
  languageMatch: number
  contributionTypeMatch: number
  activity: number
  beginnerFriendly: number
  total: number
}

export interface ReadmeAnalysis {
  isContributionFriendly: boolean
  contributionScore: number
  reasons: string[]
  contributionTypes: string[]
  hasContributingSection: boolean
  hasIssuesSection: boolean
  hasLicense: boolean
}

export const CONTRIBUTION_TYPES: ContributionType[] = [
  {
    id: 'documentation',
    label: '문서 개선',
    description: '문서화, README 개선, 주석 추가',
    keywords: ['documentation', 'docs', 'readme', 'wiki']
  },
  {
    id: 'translation',
    label: '번역',
    description: '다국어 지원, 문서 번역',
    keywords: ['translation', 'i18n', 'localization', 'locale']
  },
  {
    id: 'bug-fix',
    label: '버그 수정',
    description: '버그 리포트 및 수정',
    keywords: ['bug', 'fix', 'issue', 'error']
  },
  {
    id: 'feature',
    label: '기능 구현',
    description: '새로운 기능 개발',
    keywords: ['feature', 'enhancement', 'improvement']
  },
  {
    id: 'testing',
    label: '테스트 작성',
    description: '단위 테스트, 통합 테스트 작성',
    keywords: ['test', 'testing', 'spec', 'coverage']
  },
  {
    id: 'refactoring',
    label: '코드 리팩토링',
    description: '코드 구조 개선, 성능 최적화',
    keywords: ['refactor', 'cleanup', 'optimization', 'performance']
  },
  {
    id: 'good-first-issue',
    label: '초보자 이슈',
    description: '처음 기여하기 좋은 이슈',
    keywords: ['good-first-issue', 'beginner', 'easy', 'starter']
  }
]

export const POPULAR_LANGUAGES: Language[] = [
  { name: 'JavaScript', color: '#f1e05a' },
  { name: 'TypeScript', color: '#2b7489' },
  { name: 'Python', color: '#3572A5' },
  { name: 'Java', color: '#b07219' },
  { name: 'Go', color: '#00ADD8' },
  { name: 'Rust', color: '#dea584' },
  { name: 'C++', color: '#f34b7d' },
  { name: 'C#', color: '#239120' },
  { name: 'PHP', color: '#4F5D95' },
  { name: 'Ruby', color: '#701516' },
  { name: 'Swift', color: '#ffac45' },
  { name: 'Kotlin', color: '#F18E33' },
  { name: 'HTML', color: '#e34c26' },
  { name: 'CSS', color: '#1572B6' },
  { name: 'Vue', color: '#2c3e50' },
  { name: 'React', color: '#61dafb' }
]