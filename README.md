# 🚀 오픈소스 기여 추천 시스템

GitHub 오픈소스 프로젝트에 기여하고 싶지만 어디서부터 시작해야 할지 모르는 개발자들을 위한 **AI 기반 맞춤형 저장소 추천 시스템**입니다.

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38B2AC?logo=tailwind-css)
![GitHub API](https://img.shields.io/badge/GitHub%20API-v4-181717?logo=github)

## ✨ 주요 기능

### 🎯 맞춤형 추천 시스템
- **언어별 필터링**: JavaScript, Python, TypeScript 등 24개 주요 언어 지원
- **기여 유형별 분류**: 첫 기여하기, 문서 작성, 번역, 버그 수정, 테스트, 디자인 등 8가지 유형
- **AI 기반 점수 시스템**: 언어 매칭, 기여 유형, 활성도, 초보자 친화도를 종합한 점수
- **고급 필터링**: 언어 포함/제외 모드로 정교한 검색 조건 설정

### 🔍 스마트 검색 & 필터링
- **실시간 GitHub API 연동**: 최신 저장소 정보와 이슈 데이터
- **초보자 친화도 분석**: Good First Issue, Contributing Guide 존재 여부 확인
- **프로젝트 활성도 평가**: 최근 업데이트, 커뮤니티 응답성 분석
- **README 분석**: AI를 활용한 기여 가능성 자동 평가

### 💫 사용자 경험
- **다크/라이트 모드**: 즉시 적용되는 테마 전환 (설정 저장 시 페이지 새로고침)
- **다국어 지원**: 한국어, 영어, 중국어를 포함한 12개 언어 지원 (i18n)
- **개인화된 설정**: GitHub 토큰, 언어 설정, 테마 저장 및 즉시 적용
- **설정 관리**: 통합 설정 모달로 모든 개인화 옵션 관리
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화
- **빠른 시작 프리셋**: 인기 언어/기여 유형 조합으로 즉시 검색
- **검색 기록 저장**: 로컬 스토리지를 통한 개인화된 추천

## 🛠️ 기술 스택

### Frontend
- **Next.js 15.5.2** - React 기반 풀스택 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **Lucide React** - 아이콘 라이브러리
- **React Hook Form** - 폼 상태 관리
- **TanStack Query** - 서버 상태 관리

### Backend
- **Next.js API Routes** - 서버리스 API 엔드포인트
- **GitHub API (Octokit)** - GitHub 데이터 연동
- **Zod** - 스키마 검증
- **Rate Limiting** - API 사용량 제한

### Development
- **ESLint** - 코드 품질 관리
- **Prettier** - 코드 포매팅
- **Jest** - 단위 테스트
- **Cypress** - E2E 테스트

## 🚀 빠른 시작

### 전제 조건
- Node.js 18.0 이상
- npm 또는 yarn
- GitHub Personal Access Token

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone https://github.com/starcat37/contribute-suggestion.git
   cd contribute-suggestion
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경변수 설정**
   ```bash
   cp .env.example .env.local
   ```
   
   `.env.local` 파일에 GitHub Personal Access Token 추가:
   ```env
   GITHUB_TOKEN=your_github_personal_access_token_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```

5. **브라우저에서 확인**
   ```
   http://localhost:3000
   ```

### GitHub Personal Access Token 발급

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token (classic)" 클릭
3. 다음 권한 선택:
   - `public_repo`: 공개 저장소 접근
   - `read:org`: 조직 정보 읽기
4. 생성된 토큰을 `.env.local`에 추가

## 📖 사용법

### 1. 초기 설정
- 우상단 ⚙️ 아이콘 클릭하여 설정 모달 열기
- **GitHub 토큰**: API 호출 한도 증가를 위한 Personal Access Token 설정
- **테마**: 라이트/다크 모드 선택
- **언어**: 12개 지원 언어 중 선택 (한국어, 영어, 중국어, 일본어 등)
- **설정 저장**: "설정 저장 및 적용" 버튼으로 모든 변경사항 즉시 적용

### 2. 언어 선택
- 관심 있는 프로그래밍 언어를 최대 5개까지 선택
- 인기 언어 칩을 클릭하거나 검색창에서 직접 입력

### 3. 기여 유형 선택
- 원하는 기여 유형을 최대 3개까지 선택:
  - ⭐ **첫 기여하기**: 처음 기여하기 좋은 이슈
  - 📝 **문서 작성**: README, API 문서, 주석 작성
  - 🌐 **번역**: 다국어 지원, 문서 번역
  - 🐛 **버그 수정**: 이슈 해결, 버그 리포트
  - 🧪 **테스트**: 단위 테스트, 통합 테스트 작성
  - 🎨 **디자인**: UI/UX 개선, 디자인 작업
  - ⚡ **기능 요청**: 새로운 기능 개발
  - 👀 **코드 리뷰**: 코드 검토 및 피드백

### 4. 고급 필터 옵션 (선택사항)
- **언어 필터 모드**:
  - **포함 모드**: 선택한 언어만 검색 결과에 포함
  - **제외 모드**: 선택한 언어를 검색 결과에서 제외
- **고급 언어 선택**: 최대 10개 언어까지 포함/제외 설정 가능

### 5. 결과 확인 및 관리
- **정렬 옵션**: 적합도, 스타 수, 포크 수, 업데이트 날짜별 정렬 가능
- **검색 필터**: 저장소 이름, 설명, 소유자 기준 실시간 검색
- **스타 수 필터**: 최소/최대 스타 수 범위 설정
- **보기 모드**: 그리드/리스트 보기 전환
- AI 점수 기반으로 정렬된 추천 저장소 목록
- 각 저장소의 상세 정보:
  - 적합도 점수 (0-100%)
  - 사용 언어 분포
  - 스타 수, 포크 수, 열린 이슈 수
  - 초보자 이슈 개수
  - 기여 가이드 존재 여부

## 📁 프로젝트 구조

```
contribute-suggestion/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   └── repositories/
│   │       ├── recommend/        # 추천 API
│   │       └── search/           # 검색 API
│   ├── components/               # React 컴포넌트
│   │   ├── LanguageSelector.tsx  # 언어 선택
│   │   ├── ContributionTypeSelector.tsx # 기여 유형 선택
│   │   ├── RepositoryCard.tsx    # 저장소 카드 (다크모드 지원)
│   │   ├── RepositoryList.tsx    # 저장소 목록 (정렬/필터링 지원)
│   │   ├── SearchForm.tsx        # 검색 폼 (고급 필터 포함)
│   │   ├── SettingsModal.tsx     # 설정 모달 (GitHub 토큰, 테마, 언어)
│   │   ├── ThemeProvider.tsx     # 테마 관리 프로바이더
│   │   └── LoadingSpinner.tsx    # 로딩 컴포넌트
│   ├── hooks/                    # Custom Hooks
│   │   ├── useRepositorySearch.ts # 검색 상태 관리
│   │   ├── useSettings.ts        # 설정 상태 관리
│   │   └── useTranslation.ts     # 다국어 지원
│   ├── lib/                      # 유틸리티 라이브러리
│   │   ├── github/               # GitHub API 관련
│   │   │   ├── client.ts         # GitHub 클라이언트
│   │   │   ├── search.ts         # 검색 서비스
│   │   │   └── filter.ts         # 필터링 로직
│   │   ├── ai/                   # AI 분석
│   │   │   └── readme-analyzer.ts # README 분석
│   │   └── i18n/                 # 다국어 지원
│   │       └── translations.ts   # 번역 데이터
│   ├── types/                    # TypeScript 타입 정의
│   │   └── index.ts
│   ├── globals.css               # 글로벌 스타일
│   ├── layout.tsx                # 루트 레이아웃
│   └── page.tsx                  # 메인 페이지
├── tests/                        # 테스트 파일
├── docs/                         # 문서
├── public/                       # 정적 파일
├── middleware.ts                 # Next.js 미들웨어
├── tailwind.config.ts           # Tailwind 설정
├── tsconfig.json                # TypeScript 설정
├── next.config.js               # Next.js 설정
└── package.json                 # 의존성 관리
```

## 🧪 테스트

### 단위 테스트 실행
```bash
npm run test
```

### 테스트 커버리지 확인
```bash
npm run test:coverage
```

### E2E 테스트 실행
```bash
npm run test:e2e
```

## 🔧 개발

### 코드 스타일 확인
```bash
npm run lint
```

### 타입 체크
```bash
npm run type-check
```

### 프로덕션 빌드
```bash
npm run build
npm run start
```

## 📊 성능 최적화

### 구현된 최적화
- **코드 스플리팅**: Next.js 자동 분할
- **이미지 최적화**: Next.js Image 컴포넌트
- **API 캐싱**: HTTP 캐시 헤더 설정
- **무한 스크롤**: 페이지네이션을 통한 점진적 로딩
- **디바운싱**: 검색 입력 최적화
- **메모이제이션**: React.memo 및 useMemo 활용

### 성능 지표
- Lighthouse 점수: 95+ (Performance)
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.0s

## 🔒 보안

### 구현된 보안 기능
- **Rate Limiting**: API 요청 수 제한 (시간당 100회)
- **CSRF 보호**: Next.js 내장 보호
- **XSS 방지**: React의 자동 이스케이핑
- **환경변수 분리**: 민감한 정보 보호
- **HTTPS 강제**: 프로덕션 환경에서 자동 적용

### 보안 헤더
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

## 🌐 배포

### Vercel 배포 (권장)

이 프로젝트는 이미 Vercel에 배포되어 있습니다:
- **URL**: https://contribute-suggestion-8ftl6o0pe-starcat37s-projects.vercel.app

직접 배포하려면:

1. **Vercel 계정 연결**
   ```bash
   npm i -g vercel
   vercel login
   ```

2. **프로젝트 배포**
   ```bash
   vercel --prod
   ```

3. **환경변수 설정**
   - Vercel Dashboard → 프로젝트 → Settings → Environment Variables
   - `GITHUB_TOKEN` 추가

### 기타 플랫폼
- **Netlify**: `npm run build` → `out` 폴더 배포
- **Railway**: GitHub 연동 자동 배포
- **AWS Amplify**: 저장소 연결 후 자동 배포

## 🤝 기여하기

이 프로젝트에 기여해주세요! 다음과 같은 방법으로 참여할 수 있습니다:

### 버그 리포트
- [Issues](https://github.com/starcat37/contribute-suggestion/issues)에서 버그 신고
- 재현 가능한 단계와 스크린샷 포함

### 기능 제안
- 새로운 기능 아이디어 제안
- 사용자 경험 개선 아이디어

### 코드 기여
1. Fork 저장소
2. Feature 브랜치 생성: `git checkout -b feature/amazing-feature`
3. 변경사항 커밋: `git commit -m 'Add amazing feature'`
4. 브랜치 푸시: `git push origin feature/amazing-feature`
5. Pull Request 생성

### 개발 가이드라인
- TypeScript 사용 필수
- ESLint 규칙 준수
- 테스트 코드 작성
- Conventional Commits 사용

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 확인하세요.

## 🙏 감사의 말

- **GitHub API**: 오픈소스 데이터 제공
- **Next.js Team**: 훌륭한 프레임워크
- **Tailwind CSS**: 빠른 UI 개발 지원
- **Vercel**: 무료 호스팅 서비스
- **오픈소스 커뮤니티**: 영감과 지원

## 📞 문의

- **이메일**: starcat37@korea.ac.kr
- **GitHub**: [@starcat37](https://github.com/starcat37)

---

⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!

📢 더 많은 개발자들이 오픈소스에 기여할 수 있도록 공유해주세요!