# 오픈소스 기여 추천 시스템 구현 계획

## 프로젝트 개요
GitHub 오픈소스 프로젝트에 기여하고 싶지만 어디서부터 시작해야 할지 모르는 개발자들을 위한 맞춤형 저장소 추천 시스템

## 기술 스택

### 풀스택 프레임워크
- **Next.js 14 + TypeScript**: 풀스택 React 프레임워크 (App Router)
- **Tailwind CSS**: 빠른 UI 개발과 반응형 디자인
- **React Query (TanStack Query)**: 서버 상태 관리 및 캐싱
- **React Hook Form**: 폼 상태 관리
- **Lucide React**: 아이콘 라이브러리

### API 및 백엔드
- **Next.js API Routes**: 서버리스 API 엔드포인트
- **GitHub API (Octokit)**: GitHub 저장소 정보 조회
- **Vercel KV** (선택사항): Redis 기반 캐싱
- **Iron Session**: 세션 관리 (필요시)

### 배포
- **Vercel**: 단일 배포 (프론트엔드 + API)
- **환경변수**: Vercel 환경변수로 GitHub API 토큰 관리

### Next.js 선택 이유
- **보안**: 내장된 CSRF 보호, XSS 방지, 환경변수 분리
- **성능**: 자동 코드 스플리팅, 이미지 최적화, Edge Runtime
- **개발 경험**: 단일 프로젝트로 풀스택 개발
- **배포**: Vercel과의 완벽한 통합, Zero-config 배포

## 디렉토리 구조

```
contribute-suggestion/
├── app/
│   ├── api/
│   │   └── repositories/
│   │       ├── recommend/
│   │       │   └── route.ts
│   │       └── search/
│   │           └── route.ts
│   ├── components/
│   │   ├── LanguageSelector.tsx
│   │   ├── ContributionTypeSelector.tsx
│   │   ├── RepositoryList.tsx
│   │   ├── RepositoryCard.tsx
│   │   ├── SearchForm.tsx
│   │   └── LoadingSpinner.tsx
│   ├── lib/
│   │   ├── github/
│   │   │   ├── client.ts
│   │   │   ├── search.ts
│   │   │   └── filter.ts
│   │   ├── cache/
│   │   │   └── redis.ts
│   │   └── utils/
│   │       ├── constants.ts
│   │       └── licenseChecker.ts
│   ├── hooks/
│   │   └── useRepositorySearch.ts
│   ├── types/
│   │   └── index.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── public/
│   └── favicon.ico
├── .env.local
├── .env.example
├── next.config.js
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── middleware.ts
└── README.md
```

## 상세 구현 계획

### 1단계: Next.js API Routes 구축

#### 1.1 GitHub API 클라이언트 설정
```typescript
// app/lib/github/client.ts
export const githubClient = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  throttle: {
    onRateLimit: (retryAfter, options) => {
      // Rate limit 처리
      return true;
    },
    onSecondaryRateLimit: (retryAfter, options) => {
      // Secondary rate limit 처리
      return false;
    },
  },
});
```

#### 1.2 API Route Handlers
```typescript
// app/api/repositories/recommend/route.ts
export async function POST(request: Request) {
  // CSRF 토큰 검증 (Next.js 내장)
  // Request body validation
  // GitHub API 호출
  // 캐싱 처리
  // Response 반환
}

// 주요 기능:
- searchRepositories(): 저장소 검색
- getRepositoryDetails(): README 및 상세 정보 조회
- filterByLanguages(): 언어 매칭
- scoreRepository(): 적합도 점수 계산
```

#### 1.3 보안 미들웨어
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Rate limiting
  // API 키 검증
  // CORS 설정
  // Request logging
}

export const config = {
  matcher: '/api/:path*',
};
```

#### 1.4 API 엔드포인트 스펙
```typescript
// POST /api/repositories/recommend
{
  languages: string[],
  contributionTypes: string[],
  page?: number,
  limit?: number
}

// Response with Next.js Response helpers
return NextResponse.json({
  repositories: Repository[],
  totalCount: number,
  page: number
}, { 
  status: 200,
  headers: {
    'Cache-Control': 's-maxage=300, stale-while-revalidate'
  }
});
```

### 2단계: 프론트엔드 구현

#### 2.1 언어 선택 컴포넌트
```typescript
// LanguageSelector.tsx 기능
- 인기 언어 칩 버튼 (HTML, CSS, JavaScript, TypeScript, Python 등)
- 자동완성 검색 입력창
- 선택된 언어 태그 표시
- 언어 제거 기능
```

#### 2.2 기여 유형 선택 컴포넌트
```typescript
// ContributionTypeSelector.tsx 기능
- 체크박스 리스트:
  * 문서 개선 (Documentation)
  * 번역 (Translation)
  * 버그 수정 (Bug Fix)
  * 기능 구현 (Feature)
  * 테스트 작성 (Testing)
  * 코드 리팩토링 (Refactoring)
  * 초보자 이슈 (Good First Issue)
```

#### 2.3 결과 표시 컴포넌트
```typescript
// RepositoryList.tsx 기능
- 카드 형태의 저장소 정보 표시
- 언어 구성 비율 시각화
- GitHub 링크 및 이슈 페이지 바로가기
- 적합도 점수 표시
- 무한 스크롤 또는 페이지네이션
```

### 3단계: 검색 및 필터링 알고리즘

#### 3.1 저장소 검색 전략
1. **초기 검색 쿼리 생성**
   - 선택된 언어로 GitHub Search API 쿼리 구성
   - `language:javascript stars:>100 topics:good-first-issues`

2. **README 분석**
   - CONTRIBUTING.md 파일 존재 여부 확인
   - 라이센스 정보 추출 (MIT, Apache, GPL 등)
   - 기여 가이드라인 키워드 검색

3. **적합도 점수 계산**
   ```
   score = (
     언어_매칭_점수 * 0.3 +
     기여_유형_매칭_점수 * 0.3 +
     활성도_점수 * 0.2 +
     초보자_친화도_점수 * 0.2
   )
   ```

#### 3.2 캐싱 전략
- 검색 결과 15분 캐싱
- 저장소 상세 정보 1시간 캐싱
- 사용자별 검색 히스토리 로컬 스토리지 저장

### 4단계: UI/UX 디자인

#### 4.1 페이지 레이아웃
```
┌─────────────────────────────────────┐
│         헤더 (로고, 제목)            │
├─────────────────────────────────────┤
│                                     │
│     1. 언어 선택                    │
│     [JS] [Python] [+검색...]        │
│                                     │
│     2. 기여 유형 선택               │
│     □ 문서 □ 번역 □ 버그 수정      │
│                                     │
│     [검색하기 버튼]                 │
│                                     │
├─────────────────────────────────────┤
│                                     │
│     검색 결과                       │
│     ┌───────────────┐               │
│     │ 저장소 카드 1  │              │
│     └───────────────┘               │
│     ┌───────────────┐               │
│     │ 저장소 카드 2  │              │
│     └───────────────┘               │
│                                     │
└─────────────────────────────────────┘
```

#### 4.2 반응형 디자인
- 모바일: 단일 컬럼 레이아웃
- 태블릿: 2컬럼 그리드
- 데스크톱: 3컬럼 그리드

### 5단계: 성능 최적화

1. **API 호출 최적화**
   - Debouncing으로 검색 입력 최적화
   - 병렬 API 호출로 응답 시간 단축
   - 결과 페이지네이션

2. **프론트엔드 최적화**
   - React.memo로 불필요한 리렌더링 방지
   - 이미지 lazy loading
   - 코드 스플리팅

### 6단계: 배포 계획

#### 6.1 환경 설정
```bash
# .env.local (개발 환경)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Vercel 환경변수 (프로덕션)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=https://contribute-suggestion.vercel.app
VERCEL_KV_URL=redis://...
VERCEL_KV_REST_API_URL=https://...
VERCEL_KV_REST_API_TOKEN=...
VERCEL_KV_REST_API_READ_ONLY_TOKEN=...
```

#### 6.2 배포 프로세스 (Vercel 단일 배포)
1. GitHub 리포지토리 생성
2. Vercel 계정 연결
3. 프로젝트 Import (자동 감지)
4. 환경변수 설정 (Vercel Dashboard)
5. Deploy 클릭
6. 자동 CI/CD 설정 완료
7. 커스텀 도메인 연결 (선택사항)

**Vercel의 보안 기능**
- 자동 HTTPS
- DDoS 보호
- Edge Network를 통한 WAF
- 환경변수 암호화
- Secure Headers 자동 설정

### 7단계: MVP 기능 목록

#### 필수 기능 (MVP)
- [x] 언어 선택 (5개 주요 언어)
- [x] 기여 유형 선택 (4개 주요 유형)
- [x] GitHub API 연동
- [x] 기본 필터링
- [x] 결과 표시

#### 추가 기능 (Post-MVP)
- [ ] 사용자 GitHub 프로필 연동
- [ ] 저장소 북마크 기능
- [ ] 기여 난이도 레벨 표시
- [ ] 프로젝트 활성도 지표
- [ ] 다국어 지원
- [ ] 추천 알고리즘 개선

### 8단계: 개발 일정

#### Week 1: Next.js 풀스택 개발
- Day 1: Next.js 프로젝트 셋업 및 환경 구성
- Day 2-3: API Routes 및 GitHub API 연동
- Day 4-5: 필터링 로직 및 캐싱 구현
- Day 6-7: 보안 미들웨어 및 Rate Limiting

#### Week 2: UI 개발 및 통합
- Day 8-9: 컴포넌트 개발 (언어/기여 유형 선택)
- Day 10-11: 검색 결과 UI 및 상태 관리
- Day 12-13: API 통합 및 에러 처리
- Day 14: 반응형 디자인 완성

#### Week 3: 최적화 및 배포
- Day 15-16: 성능 최적화 (ISR, 이미지 최적화)
- Day 17: Vercel 배포 및 환경변수 설정
- Day 18-19: 프로덕션 테스트
- Day 20-21: 버그 수정 및 모니터링 설정

## 주요 고려사항

### API Rate Limiting
- GitHub API는 인증 없이 시간당 60회, 인증 시 5000회 제한
- 반드시 GitHub Personal Access Token 사용
- 캐싱으로 API 호출 최소화

### 라이센스 확인
- 오픈소스 라이센스 목록:
  * MIT, Apache 2.0, GPL, BSD, ISC, Mozilla Public License

### 초보자 친화도 지표
- `good-first-issue` 라벨 확인
- CONTRIBUTING.md 파일 존재 여부
- 최근 이슈 응답 시간
- 프로젝트 활성도 (최근 커밋, PR 머지율)

## 개발 시작 명령어

```bash
# Next.js 프로젝트 생성
npx create-next-app@latest contribute-suggestion \
  --typescript \
  --tailwind \
  --app \
  --eslint

cd contribute-suggestion

# 필요한 패키지 설치
npm install @octokit/rest
npm install @tanstack/react-query
npm install react-hook-form
npm install lucide-react
npm install @vercel/kv  # 선택사항: Redis 캐싱
npm install zod  # API validation
npm install iron-session  # 세션 관리 (선택사항)

# 개발 타입 패키지
npm install -D @types/node

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm run start
```

## 다음 단계
1. 이 계획서를 기반으로 Claude Code에서 실제 구현 시작
2. GitHub 리포지토리 생성
3. GitHub Personal Access Token 발급 (환경변수로 관리)
4. 단계별 구현 진행