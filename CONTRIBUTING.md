# 기여 가이드

오픈소스 기여 추천 시스템에 기여해주셔서 감사합니다! 이 가이드는 프로젝트에 효과적으로 기여하는 방법을 안내합니다.

## 🚀 시작하기

### 개발 환경 설정

1. **저장소 포크 및 클론**
   ```bash
   git clone https://github.com/YOUR_USERNAME/contribute-suggestion.git
   cd contribute-suggestion
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경변수 설정**
   ```bash
   cp .env.example .env.local
   # .env.local에 GitHub Personal Access Token 추가
   ```

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```

## 📋 기여 유형

### 🐛 버그 리포트

버그를 발견하셨나요? 다음 정보를 포함하여 이슈를 생성해주세요:

- **버그 설명**: 무엇이 잘못되었는지 명확히 설명
- **재현 단계**: 버그를 재현할 수 있는 단계별 설명
- **예상 동작**: 어떻게 동작해야 하는지
- **실제 동작**: 실제로 어떻게 동작하는지
- **환경 정보**: OS, 브라우저, Node.js 버전 등
- **스크린샷**: 가능하다면 스크린샷 첨부

**버그 리포트 템플릿**:
```markdown
## 🐛 버그 설명
간단명료한 버그 설명

## 🔄 재현 단계
1. '...' 이동
2. '...' 클릭
3. '...' 스크롤
4. 오류 확인

## ✅ 예상 동작
예상했던 동작 설명

## ❌ 실제 동작
실제 발생한 동작 설명

## 🖼️ 스크린샷
가능하다면 스크린샷 첨부

## 🔧 환경 정보
- OS: [예: Windows 10]
- 브라우저: [예: Chrome 91.0]
- Node.js: [예: 18.17.0]
- 프로젝트 버전: [예: v1.0.0]

## 📝 추가 컨텍스트
기타 관련 정보
```

### 💡 기능 제안

새로운 기능을 제안하고 싶으신가요?

- **기능 설명**: 원하는 기능을 명확히 설명
- **문제점**: 현재 어떤 문제가 있는지
- **해결 방안**: 제안하는 기능이 어떻게 문제를 해결하는지
- **대안**: 고려해본 다른 해결책들
- **구현 아이디어**: 가능한 구현 방법 (선택사항)

### 🔧 코드 기여

코드 기여는 언제나 환영합니다! 다음 과정을 따라주세요:

1. **이슈 확인**: 기존 이슈를 확인하거나 새로운 이슈 생성
2. **브랜치 생성**: 기능별 브랜치 생성
3. **코드 작성**: 스타일 가이드 준수
4. **테스트**: 변경사항에 대한 테스트 작성
5. **Pull Request**: 자세한 설명과 함께 PR 생성

## 🎯 개발 가이드라인

### 브랜치 전략

```bash
# 새로운 기능 개발
git checkout -b feature/amazing-feature

# 버그 수정
git checkout -b bugfix/fix-search-issue

# 문서 업데이트
git checkout -b docs/update-api-docs

# 성능 개선
git checkout -b perf/optimize-search-algorithm
```

### 커밋 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/) 규칙을 따릅니다:

```bash
# 새로운 기능
git commit -m "feat: add language filter to search form"

# 버그 수정
git commit -m "fix: resolve repository card layout issue"

# 문서 업데이트
git commit -m "docs: update API documentation"

# 리팩토링
git commit -m "refactor: optimize repository search algorithm"

# 테스트 추가
git commit -m "test: add unit tests for LanguageSelector"

# 성능 개선
git commit -m "perf: improve repository loading speed"

# 스타일 수정 (코드 의미 변경 없음)
git commit -m "style: fix eslint warnings"

# 빌드 관련
git commit -m "build: update dependencies"
```

### 코드 스타일

프로젝트는 다음 스타일 가이드를 따릅니다:

- **ESLint**: JavaScript/TypeScript 린팅
- **Prettier**: 코드 포매팅
- **TypeScript**: 타입 안전성

```bash
# 코드 스타일 확인
npm run lint

# 자동 수정
npm run lint:fix

# 타입 체크
npm run type-check
```

#### TypeScript 가이드라인

```typescript
// ✅ 올바른 예시
interface RepositoryProps {
  repository: Repository
  className?: string
}

const RepositoryCard: React.FC<RepositoryProps> = ({ repository, className }) => {
  // 컴포넌트 로직
}

// ❌ 잘못된 예시
const RepositoryCard = (props: any) => {
  // any 타입 사용 금지
}
```

#### React 컴포넌트 가이드라인

```tsx
// ✅ 올바른 예시
import { useState, useCallback, memo } from 'react'

interface Props {
  onSearch: (query: string) => void
  isLoading: boolean
}

const SearchForm = memo<Props>(({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('')

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }, [query, onSearch])

  return (
    <form onSubmit={handleSubmit}>
      {/* JSX */}
    </form>
  )
})

SearchForm.displayName = 'SearchForm'
export default SearchForm
```

### 테스팅

모든 새로운 기능과 버그 수정에는 적절한 테스트가 포함되어야 합니다:

```bash
# 모든 테스트 실행
npm test

# 테스트 모니터링
npm run test:watch

# 커버리지 확인
npm run test:coverage
```

#### 테스트 작성 가이드

```typescript
// 컴포넌트 테스트 예시
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LanguageSelector from '../LanguageSelector'

describe('LanguageSelector', () => {
  const mockOnChange = jest.fn()
  
  beforeEach(() => {
    mockOnChange.mockClear()
  })

  test('renders language options', () => {
    render(
      <LanguageSelector 
        selectedLanguages={[]} 
        onLanguageChange={mockOnChange} 
      />
    )
    
    expect(screen.getByText('JavaScript')).toBeInTheDocument()
  })

  test('handles language selection', async () => {
    const user = userEvent.setup()
    
    render(
      <LanguageSelector 
        selectedLanguages={[]} 
        onLanguageChange={mockOnChange} 
      />
    )
    
    await user.click(screen.getByText('JavaScript'))
    
    expect(mockOnChange).toHaveBeenCalledWith(['JavaScript'])
  })
})
```

## 📝 Pull Request 프로세스

### PR 생성 전 체크리스트

- [ ] 최신 `main` 브랜치에서 시작
- [ ] 기능별로 하나의 PR (여러 기능을 한 번에 하지 않기)
- [ ] 코드 스타일 가이드 준수
- [ ] 테스트 작성 및 통과
- [ ] 문서 업데이트 (필요시)
- [ ] 자세한 PR 설명 작성

### PR 템플릿

```markdown
## 📝 변경사항 요약
이 PR이 무엇을 변경하는지 간단히 설명

## 🎯 관련 이슈
- Closes #123
- Related to #456

## 🔄 변경 유형
- [ ] 버그 수정 (기존 기능 수정)
- [ ] 새로운 기능 (새로운 기능 추가)
- [ ] 깨는 변경 (기존 기능에 영향을 주는 수정)
- [ ] 문서 업데이트 (문서만 변경)
- [ ] 성능 개선 (기능 변경 없는 성능 향상)
- [ ] 리팩토링 (기능 변경 없는 코드 개선)

## 🧪 테스트
- [ ] 기존 테스트 통과
- [ ] 새로운 테스트 추가
- [ ] 수동 테스트 완료

## 📸 스크린샷 (UI 변경시)
변경 전후 스크린샷

## 📋 체크리스트
- [ ] 코드가 스타일 가이드를 준수함
- [ ] 자체 리뷰 완료
- [ ] 주석이 복잡한 부분에 추가됨
- [ ] 문서 업데이트 (필요시)
- [ ] 테스트 추가/수정
- [ ] 깨는 변경사항이 문서화됨
```

### 코드 리뷰

- 모든 PR은 최소 1명의 리뷰어 승인이 필요합니다
- 리뷰어는 코드 품질, 테스트, 문서화를 확인합니다
- 건설적인 피드백을 환영하며, 학습 기회로 활용합니다

## 🏗️ 프로젝트 구조

```
contribute-suggestion/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   └── repositories/         
│   │       ├── recommend/        # 추천 API
│   │       └── search/           # 검색 API
│   ├── components/               # React 컴포넌트
│   │   ├── LanguageSelector.tsx  
│   │   ├── ContributionTypeSelector.tsx
│   │   ├── RepositoryCard.tsx    
│   │   ├── RepositoryList.tsx    
│   │   └── SearchForm.tsx        
│   ├── hooks/                    # Custom Hooks
│   │   └── useRepositorySearch.ts
│   ├── lib/                      # 유틸리티 라이브러리
│   │   └── github/               # GitHub API 관련
│   │       ├── client.ts         
│   │       ├── search.ts         
│   │       └── filter.ts         
│   ├── types/                    # TypeScript 타입
│   │   └── index.ts
│   ├── __tests__/                # 테스트 파일
│   ├── globals.css               
│   ├── layout.tsx                
│   └── page.tsx                  
├── docs/                         # 문서
│   ├── API.md                    
│   ├── COMPONENTS.md             
│   └── DEPLOYMENT.md             
├── public/                       # 정적 파일
├── middleware.ts                 # Next.js 미들웨어
└── README.md
```

## 🎨 디자인 시스템

### 색상 팔레트

```css
/* Primary Colors */
--blue-50: #eff6ff;
--blue-500: #3b82f6;
--blue-600: #2563eb;

/* Success Colors */
--green-500: #22c55e;
--green-600: #16a34a;

/* Warning Colors */
--amber-500: #f59e0b;
--amber-600: #d97706;

/* Error Colors */
--red-500: #ef4444;
--red-600: #dc2626;
```

### 타이포그래피

- **Headings**: `font-bold` 또는 `font-semibold`
- **Body Text**: `text-base` (16px)
- **Small Text**: `text-sm` (14px)
- **Captions**: `text-xs` (12px)

### 간격 시스템

- **Section**: `py-16` (64px)
- **Component**: `py-8` (32px)  
- **Element**: `py-4` (16px)
- **Tight**: `py-2` (8px)

## 🔍 이슈 라벨

프로젝트에서 사용하는 라벨들:

| 라벨 | 설명 | 색상 |
|------|------|------|
| `bug` | 버그 리포트 | `#d73a4a` |
| `enhancement` | 새로운 기능 제안 | `#a2eeef` |
| `good first issue` | 초보자에게 좋은 이슈 | `#7057ff` |
| `help wanted` | 도움이 필요한 이슈 | `#008672` |
| `documentation` | 문서 관련 | `#0075ca` |
| `question` | 질문 | `#d876e3` |
| `wontfix` | 수정하지 않을 이슈 | `#ffffff` |
| `duplicate` | 중복 이슈 | `#cfd3d7` |
| `invalid` | 유효하지 않은 이슈 | `#e4e669` |

## 🏆 기여자 인정

모든 기여는 소중하며 다음과 같이 인정됩니다:

- **README 기여자 섹션**에 이름 추가
- **릴리스 노트**에 기여 내용 언급
- **All Contributors** 봇을 통한 자동 인정

### 기여 유형

- 💻 코드 기여
- 📖 문서 작성
- 🐛 버그 리포트
- 💡 아이디어 제안
- 🤔 질문 답변
- 📋 프로젝트 관리
- 🎨 디자인
- 🚇 인프라 구축

## 📞 커뮤니티 및 지원

### 소통 채널

- **GitHub Issues**: 버그 리포트, 기능 제안
- **GitHub Discussions**: 일반적인 질문, 아이디어 토론
- **Email**: your.email@example.com

### 질문하기

질문이 있으시면 언제든 연락해주세요:

1. **GitHub Discussions** 검색하여 유사한 질문이 있는지 확인
2. 새로운 Discussion 생성
3. 명확하고 구체적인 제목 사용
4. 충분한 컨텍스트 제공

### 행동 강령

우리는 포용적이고 존중하는 커뮤니티를 만들기 위해 노력합니다:

- 서로 존중하고 배려하기
- 건설적인 피드백 제공
- 다양성 인정하고 포용하기
- 초보자를 도와주고 격려하기
- 정치적, 종교적 토론 지양하기

## 🎉 시작해보세요!

기여할 준비가 되셨나요? 다음 단계를 따라해보세요:

1. **저장소 포크**하기
2. **good first issue** 라벨이 붙은 이슈 찾기
3. **개발 환경 설정**하기
4. **첫 번째 PR** 만들기

궁금한 점이 있거나 도움이 필요하시면 언제든 연락해주세요. 여러분의 기여를 기다리고 있습니다! 🚀

---

**즐거운 코딩 되세요!** ✨