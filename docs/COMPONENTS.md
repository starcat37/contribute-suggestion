# 컴포넌트 문서

이 문서는 오픈소스 기여 추천 시스템에서 사용되는 React 컴포넌트들의 상세 가이드입니다.

## 목차

- [LanguageSelector](#languageselector)
- [ContributionTypeSelector](#contributiontypeselector)
- [SearchForm](#searchform)
- [RepositoryCard](#repositorycard)
- [RepositoryList](#repositorylist)
- [SettingsModal](#settingsmodal)
- [LoadingSpinner](#loadingspinner)

---

## LanguageSelector

프로그래밍 언어를 선택할 수 있는 컴포넌트입니다.

### Props

```typescript
interface LanguageSelectorProps {
  selectedLanguages: string[];
  onLanguageChange: (languages: string[]) => void;
  maxSelections?: number;
  placeholder?: string;
}
```

| Prop | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `selectedLanguages` | `string[]` | ✅ | - | 선택된 언어 목록 |
| `onLanguageChange` | `(languages: string[]) => void` | ✅ | - | 언어 선택 변경 콜백 |
| `maxSelections` | `number` | ❌ | `5` | 최대 선택 가능한 언어 수 |
| `placeholder` | `string` | ❌ | `"언어를 선택하세요"` | 플레이스홀더 텍스트 |

### 기능

- **인기 언어 칩**: 클릭으로 빠른 선택
- **검색 기능**: 언어명으로 실시간 검색
- **다중 선택**: 여러 언어 동시 선택 가능
- **시각적 피드백**: 선택된 언어는 색상으로 구분
- **제한 관리**: 최대 선택 수 제한 및 안내
- **다크 모드 지원**: 테마에 따른 색상 자동 변경

### 사용 예시

```tsx
import LanguageSelector from '@/components/LanguageSelector'

function MyComponent() {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])

  return (
    <LanguageSelector
      selectedLanguages={selectedLanguages}
      onLanguageChange={setSelectedLanguages}
      maxSelections={3}
      placeholder="검색할 언어를 선택하세요"
    />
  )
}
```

### 지원 언어

다음 24개 언어를 지원합니다:

- JavaScript, TypeScript, Python, Java, C++, C#, Go, Rust
- PHP, Ruby, Swift, Kotlin, Scala, R, MATLAB, Perl
- Haskell, Erlang, Clojure, F#, Dart, Elixir, Lua, Shell

---

## ContributionTypeSelector

기여 유형을 선택할 수 있는 컴포넌트입니다.

### Props

```typescript
interface ContributionTypeSelectorProps {
  selectedTypes: string[];
  onTypeChange: (types: string[]) => void;
  maxSelections?: number;
}
```

| Prop | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `selectedTypes` | `string[]` | ✅ | - | 선택된 기여 유형 목록 |
| `onTypeChange` | `(types: string[]) => void` | ✅ | - | 기여 유형 변경 콜백 |
| `maxSelections` | `number` | ❌ | `3` | 최대 선택 가능한 유형 수 |

### 기여 유형

| ID | 라벨 | 설명 | 키워드 |
|----|------|------|--------|
| `good-first-issue` | 첫 기여하기 | 처음 기여하기 좋은 이슈 | good-first-issue, beginner, newcomer |
| `documentation` | 문서 작성 | README, API 문서, 주석 작성 | docs, readme, wiki, documentation |
| `translation` | 번역 | 다국어 지원, 문서 번역 | i18n, locale, translation, internationalization |
| `bug-fix` | 버그 수정 | 버그 리포트 및 수정 | bug, fix, issue |
| `testing` | 테스트 | 단위/통합 테스트 작성 | test, spec, coverage |
| `design` | 디자인 | UI/UX 개선, 디자인 작업 | design, ui, ux, style |
| `feature-request` | 기능 요청 | 새로운 기능 개발 | feature, enhancement, improvement |
| `code-review` | 코드 리뷰 | 코드 검토 및 피드백 | review, feedback, pull-request |

### 특징

- **카드 형태 UI**: 각 유형을 직관적인 카드로 표시
- **아이콘 지원**: 각 유형에 맞는 Lucide 아이콘
- **키워드 표시**: 관련 키워드 미리보기
- **선택 가이드**: 사용자를 위한 도움말 제공
- **다국어 지원**: i18n으로 다국어 라벨 지원

---

## SearchForm

언어와 기여 유형을 선택하여 검색할 수 있는 종합 폼 컴포넌트입니다.

### Props

```typescript
interface SearchFormProps {
  onSearch: (
    filters: {
      languages: string[];
      contributionTypes: string[];
    },
    advancedFilters?: {
      searchMode: 'include' | 'exclude';
      includedLanguages: string[];
      excludedLanguages: string[];
    }
  ) => void;
  isLoading?: boolean;
  error?: string | null;
}
```

### 주요 기능

- **기본 검색**: 언어와 기여 유형 선택
- **고급 필터**: 언어 포함/제외 모드
- **빠른 시작**: 사전 정의된 프리셋으로 즉시 검색
- **유효성 검사**: 필수 선택 사항 확인
- **오류 표시**: 검색 오류 시 사용자 친화적 메시지
- **다크 모드 지원**: 테마에 따른 UI 변경

### 고급 필터 옵션

```typescript
interface AdvancedFilters {
  searchMode: 'include' | 'exclude';
  includedLanguages: string[];   // 포함할 언어 (최대 10개)
  excludedLanguages: string[];   // 제외할 언어 (최대 10개)
}
```

- **포함 모드**: 선택한 언어만 검색 결과에 포함
- **제외 모드**: 선택한 언어를 검색 결과에서 제외

### 빠른 시작 프리셋

```typescript
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
  // ... 더 많은 프리셋
]
```

### 사용 예시

```tsx
import SearchForm from '@/components/SearchForm'

function MyComponent() {
  const handleSearch = async (filters, advancedFilters) => {
    console.log('Basic filters:', filters)
    console.log('Advanced filters:', advancedFilters)
    // 검색 로직 구현
  }

  return (
    <SearchForm
      onSearch={handleSearch}
      isLoading={false}
      error={null}
    />
  )
}
```

---

## SettingsModal

사용자 설정을 관리하는 모달 컴포넌트입니다.

### Props

```typescript
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

### 설정 항목

#### 1. GitHub 토큰
- **기능**: GitHub Personal Access Token 설정
- **실시간 검증**: 토큰 유효성 자동 확인
- **보안**: 패스워드 입력 타입으로 숨김 처리

#### 2. 테마 설정
- **라이트 모드**: 밝은 테마
- **다크 모드**: 어두운 테마
- **즉시 적용**: 선택 시 바로 전체 UI에 반영

#### 3. 언어 설정
- **한국어**: 기본 언어
- **English**: 영어 지원
- **中文**: 중국어 지원

### 사용 예시

```tsx
import { useState } from 'react'
import SettingsModal from '@/components/SettingsModal'

function MyComponent() {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      <button onClick={() => setShowSettings(true)}>
        설정
      </button>
      
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </>
  )
}
```

### 설정 데이터

```typescript
interface Settings {
  githubToken?: string;
  theme: 'light' | 'dark';
  language: 'ko' | 'en' | 'zh';
}
```

---

## RepositoryCard

개별 저장소 정보를 카드 형태로 표시하는 컴포넌트입니다.

### Props

```typescript
interface RepositoryCardProps {
  repository: Repository;
  className?: string;
}
```

### Repository 타입

```typescript
interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  score?: number;
  languages?: { [key: string]: number };
  has_contributing_guide?: boolean;
  good_first_issues_count?: number;
  readme_analysis?: ReadmeAnalysis;
}
```

### 표시 정보

- **기본 정보**: 이름, 설명, 소유자
- **통계**: 스타, 포크, 이슈 수
- **언어 분포**: 사용 언어 비율 시각화  
- **적합도 점수**: AI 기반 매칭 점수 (0-100%)
- **특징 배지**: 기여 가이드, Good First Issue 등
- **토픽 태그**: 프로젝트 관련 토픽들
- **README 분석**: AI 기반 기여 가능성 평가

### 점수 색상 분류

```typescript
const getScoreColor = (score?: number) => {
  if (!score) return 'text-gray-500'
  if (score >= 0.8) return 'text-green-600'  // 매우 적합 (80-100%)
  if (score >= 0.6) return 'text-blue-600'   // 적합 (60-79%)
  if (score >= 0.4) return 'text-yellow-600' // 보통 (40-59%)
  return 'text-orange-600'                   // 부분적 일치 (0-39%)
}
```

---

## RepositoryList

저장소 목록을 관리하고 표시하는 컴포넌트입니다.

### Props

```typescript
interface RepositoryListProps {
  repositories: Repository[];
  totalCount: number;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}
```

### 기능

- **다중 정렬**: 점수, 스타, 포크, 업데이트 날짜별 정렬
- **검색 필터**: 저장소명, 설명, 소유자로 실시간 검색
- **고급 필터**: 최소/최대 스타 수 설정
- **뷰 모드**: 그리드/리스트 뷰 전환
- **무한 스크롤**: 점진적 콘텐츠 로딩
- **다국어 지원**: 모든 UI 텍스트 i18n 지원

### 정렬 옵션

```typescript
type SortOption = 'score' | 'stars' | 'forks' | 'updated' | 'created'
type SortOrder = 'asc' | 'desc'
```

---

## LoadingSpinner

로딩 상태를 표시하는 컴포넌트입니다.

### Props

```typescript
interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  type?: 'search' | 'general';
}
```

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `message` | `string` | `"로딩 중..."` | 표시할 메시지 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 크기 |
| `type` | `'search' \| 'general'` | `'general'` | 로딩 유형 |

### 로딩 타입

- **general**: 기본 스피너 (Loader2 아이콘)
- **search**: 검색 전용 (GitHub + Search 아이콘 조합)

### 보조 컴포넌트

#### RepositoryCardSkeleton

```tsx
import { RepositoryCardSkeleton } from '@/components/LoadingSpinner'

<RepositoryCardSkeleton />
```

#### RepositoryListSkeleton

```tsx
import { RepositoryListSkeleton } from '@/components/LoadingSpinner'

<RepositoryListSkeleton count={6} />
```

## Hooks 문서

### useSettings

사용자 설정을 관리하는 Hook입니다.

```typescript
const {
  settings,           // 현재 설정
  setGithubToken,     // GitHub 토큰 설정
  removeGithubToken,  // GitHub 토큰 제거
  setTheme,           // 테마 설정
  setLanguage,        // 언어 설정
  resetSettings,      // 설정 초기화
  isTokenValid,       // 토큰 유효성 상태
  isValidating,       // 토큰 검증 중 상태
  isHydrated,         // SSR 하이드레이션 완료 상태
} = useSettings()
```

### useTranslation

다국어 지원을 위한 Hook입니다.

```typescript
const { t, language } = useTranslation()

// 사용 예시
<h1>{t.appTitle}</h1>
<p>{t.searchResults}</p>
<button>{t.loadMore}</button>
```

### useRepositorySearch

저장소 검색 상태를 관리하는 Hook입니다.

```typescript
const {
  repositories,       // 검색된 저장소 목록
  totalCount,         // 전체 결과 수
  currentPage,        // 현재 페이지
  isLoading,          // 로딩 상태
  error,              // 에러 메시지
  hasMore,            // 더 많은 결과 존재 여부
  search,             // 검색 함수
  loadMore,           // 더 많은 결과 로드
  reset,              // 검색 상태 초기화
} = useRepositorySearch()
```

## API 연동

### GitHub API Integration

```typescript
// 검색 API 호출
const response = await fetch('/api/repositories/recommend', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    languages: ['JavaScript', 'TypeScript'],
    contributionTypes: ['good-first-issue', 'documentation'],
    page: 1,
    limit: 30,
    githubToken: userToken, // 선택사항
    // 고급 필터
    searchMode: 'include',
    includedLanguages: ['Python', 'Go'],
    excludedLanguages: [],
  })
})
```

### 응답 데이터 구조

```typescript
interface SearchResponse {
  repositories: Repository[];
  totalCount: number;
  page: number;
}
```

## 성능 최적화

### React.memo 사용

```tsx
import { memo } from 'react'

const RepositoryCard = memo(({ repository, className }) => {
  return (
    // 컴포넌트 JSX
  )
})
```

### useMemo 활용

```tsx
const filteredRepositories = useMemo(() => {
  return repositories.filter(repo => {
    const matchesSearch = !searchTerm || 
      repo.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })
}, [repositories, searchTerm])
```

## 접근성 가이드

### 키보드 내비게이션

```tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleLanguageToggle(language)
  }
}

<button
  onKeyDown={handleKeyDown}
  aria-pressed={isSelected}
  role="button"
  tabIndex={0}
>
  {language}
</button>
```

### ARIA 라벨

```tsx
<input
  aria-label="프로그래밍 언어 검색"
  aria-describedby="language-help"
  role="searchbox"
/>

<div id="language-help" role="status" aria-live="polite">
  {selectedLanguages.length}/{maxSelections}개 선택됨
</div>
```

## 테스팅

### 단위 테스트 예시

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import LanguageSelector from '../LanguageSelector'

test('handles language selection', async () => {
  const mockOnChange = jest.fn()
  
  render(
    <LanguageSelector
      selectedLanguages={[]}
      onLanguageChange={mockOnChange}
    />
  )

  const jsChip = screen.getByText('JavaScript')
  fireEvent.click(jsChip)

  expect(mockOnChange).toHaveBeenCalledWith(['JavaScript'])
})
```

---

이 문서는 최신 기능을 반영하여 업데이트되었습니다. 추가적인 도움이 필요하다면 [이슈](https://github.com/yourusername/contribute-suggestion/issues)를 생성해주세요.