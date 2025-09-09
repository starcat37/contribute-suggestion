# API 문서

오픈소스 기여 추천 시스템의 REST API 문서입니다.

## 개요

- **Base URL**: `http://localhost:3000/api` (개발), `https://your-domain.com/api` (프로덕션)
- **Content-Type**: `application/json`
- **Rate Limit**: 시간당 100회 요청 제한 (IP 기반)

## 인증

현재 버전에서는 클라이언트 인증이 필요하지 않습니다. 서버는 내부적으로 GitHub Personal Access Token을 사용합니다.

## 공통 응답 구조

### 성공 응답
```json
{
  "repositories": [...],
  "totalCount": 1234,
  "page": 1
}
```

### 오류 응답
```json
{
  "error": "오류 타입",
  "message": "사용자 친화적 오류 메시지",
  "details": [
    {
      "field": "필드명",
      "message": "필드별 오류 메시지"
    }
  ]
}
```

## 엔드포인트

### 1. 저장소 추천 API

#### `POST /api/repositories/recommend`

사용자의 선호 언어와 기여 유형을 기반으로 맞춤형 저장소를 추천합니다.

##### 요청 파라미터

```json
{
  "languages": ["JavaScript", "TypeScript"],
  "contributionTypes": ["documentation", "good-first-issue"],
  "page": 1,
  "limit": 30
}
```

| 필드 | 타입 | 필수 | 설명 | 기본값 |
|------|------|------|------|--------|
| `languages` | `string[]` | ✅ | 선호 언어 목록 (최소 1개) | - |
| `contributionTypes` | `string[]` | ✅ | 기여 유형 목록 (최소 1개) | - |
| `page` | `number` | ❌ | 페이지 번호 (1부터 시작) | 1 |
| `limit` | `number` | ❌ | 페이지당 결과 수 (1-100) | 30 |

##### 사용 가능한 언어
- `JavaScript`, `TypeScript`, `Python`, `Java`, `Go`, `Rust`, `C++`, `C#`
- `PHP`, `Ruby`, `Swift`, `Kotlin`, `HTML`, `CSS`, `Vue`, `React`

##### 사용 가능한 기여 유형
- `documentation`: 문서 개선
- `translation`: 번역
- `bug-fix`: 버그 수정
- `feature`: 기능 구현
- `testing`: 테스트 작성
- `refactoring`: 코드 리팩토링
- `good-first-issue`: 초보자 이슈

##### 응답 예시

**성공 (200 OK)**
```json
{
  "repositories": [
    {
      "id": 12345,
      "name": "awesome-project",
      "full_name": "user/awesome-project",
      "description": "An awesome open source project",
      "html_url": "https://github.com/user/awesome-project",
      "language": "JavaScript",
      "stargazers_count": 1234,
      "forks_count": 567,
      "open_issues_count": 89,
      "topics": ["javascript", "react", "opensource"],
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "license": {
        "key": "mit",
        "name": "MIT License"
      },
      "owner": {
        "login": "user",
        "avatar_url": "https://avatars.githubusercontent.com/u/12345",
        "html_url": "https://github.com/user"
      },
      "languages": {
        "JavaScript": 12345,
        "CSS": 2345,
        "HTML": 1234
      },
      "has_contributing_guide": true,
      "good_first_issues_count": 5,
      "score": 0.85
    }
  ],
  "totalCount": 1234,
  "page": 1
}
```

**오류 응답**

**400 Bad Request** - 잘못된 요청 데이터
```json
{
  "error": "Invalid request data",
  "details": [
    {
      "field": "languages",
      "message": "At least one language must be selected"
    }
  ]
}
```

**429 Too Many Requests** - 요청 제한 초과
```json
{
  "error": "API rate limit exceeded",
  "message": "Please try again later. The GitHub API rate limit has been exceeded."
}
```

**500 Internal Server Error** - 서버 오류
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred. Please try again."
}
```

##### cURL 예시
```bash
curl -X POST http://localhost:3000/api/repositories/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "languages": ["JavaScript", "TypeScript"],
    "contributionTypes": ["documentation", "good-first-issue"],
    "page": 1,
    "limit": 30
  }'
```

### 2. 저장소 검색 API

#### `GET /api/repositories/search`

GitHub 검색 API를 직접 활용하여 저장소를 검색합니다.

##### 쿼리 파라미터

| 파라미터 | 타입 | 필수 | 설명 | 기본값 |
|----------|------|------|------|--------|
| `q` | `string` | ✅ | GitHub 검색 쿼리 | - |
| `sort` | `string` | ❌ | 정렬 기준 | `stars` |
| `order` | `string` | ❌ | 정렬 순서 | `desc` |
| `per_page` | `number` | ❌ | 페이지당 결과 수 (1-100) | 30 |
| `page` | `number` | ❌ | 페이지 번호 | 1 |

##### 정렬 옵션
- `stars`: 스타 수
- `forks`: 포크 수  
- `help-wanted-issues`: 도움 요청 이슈 수
- `updated`: 최근 업데이트

##### 요청 예시
```
GET /api/repositories/search?q=language:javascript+stars:>100&sort=stars&order=desc&per_page=10&page=1
```

##### 응답 예시

**성공 (200 OK)**
```json
{
  "total_count": 12345,
  "incomplete_results": false,
  "items": [
    {
      "id": 12345,
      "name": "awesome-project",
      "full_name": "user/awesome-project",
      "description": "An awesome project",
      "html_url": "https://github.com/user/awesome-project",
      "stargazers_count": 1234,
      "forks_count": 567,
      "language": "JavaScript",
      "topics": ["javascript", "react"],
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "license": {
        "key": "mit",
        "name": "MIT License"
      },
      "owner": {
        "login": "user",
        "avatar_url": "https://avatars.githubusercontent.com/u/12345",
        "html_url": "https://github.com/user"
      }
    }
  ]
}
```

##### cURL 예시
```bash
curl "http://localhost:3000/api/repositories/search?q=language:javascript+stars:>100&sort=stars&per_page=10"
```

## 응답 헤더

모든 API 응답에는 다음 보안 헤더가 포함됩니다:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY  
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Cache-Control: s-maxage=300, stale-while-revalidate=3600
```

### Rate Limiting 헤더
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 오류 코드

| HTTP 상태 | 의미 | 설명 |
|-----------|------|------|
| 200 | OK | 요청 성공 |
| 400 | Bad Request | 잘못된 요청 파라미터 |
| 405 | Method Not Allowed | 지원하지 않는 HTTP 메서드 |
| 429 | Too Many Requests | Rate limit 초과 |
| 500 | Internal Server Error | 서버 내부 오류 |
| 502 | Bad Gateway | GitHub API 오류 |

## GitHub API 제한사항

### Rate Limiting
- **인증된 요청**: 시간당 5,000회
- **인증되지 않은 요청**: 시간당 60회

### 검색 API 제한
- 분당 30회 검색 요청
- 최대 1,000개 결과 반환 (페이지네이션 포함)

## 개발자 가이드

### 로컬 개발 설정

1. GitHub Personal Access Token 발급:
   ```
   Settings → Developer settings → Personal access tokens → Generate new token
   ```

2. 필요한 권한:
   - `public_repo`: 공개 저장소 접근
   - `read:org`: 조직 정보 읽기

3. 환경변수 설정:
   ```bash
   echo "GITHUB_TOKEN=your_token_here" >> .env.local
   ```

### API 테스트

#### Postman 컬렉션
```json
{
  "info": {
    "name": "오픈소스 기여 추천 API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "저장소 추천",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/repositories/recommend",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"languages\": [\"JavaScript\", \"TypeScript\"],\n  \"contributionTypes\": [\"documentation\", \"good-first-issue\"]\n}"
        }
      }
    }
  ]
}
```

#### 점수 계산 알고리즘

저장소 적합도 점수는 다음 요소들의 가중평균으로 계산됩니다:

```javascript
score = (
  language_match_score * 0.3 +      // 언어 매칭 점수
  contribution_type_score * 0.3 +   // 기여 유형 점수  
  activity_score * 0.2 +            // 프로젝트 활성도
  beginner_friendly_score * 0.2     // 초보자 친화도
)
```

**언어 매칭 점수 (0-1)**
- 선택한 언어가 저장소의 주 언어와 일치: 1.0
- 선택한 언어가 저장소에서 사용됨: 0.8
- 일치하지 않음: 0.0

**기여 유형 점수 (0-1)**
- 각 선택한 기여 유형당 키워드 매칭 확인
- Good First Issue 라벨이 있는 경우 보너스 점수

**활성도 점수 (0-1)**
- 최근 업데이트: 7일 이내 (1.0), 30일 이내 (0.8), 90일 이내 (0.6)
- 스타 수에 따른 인기도 보너스

**초보자 친화도 점수 (0-1)**
- CONTRIBUTING.md 존재: +0.4
- Good First Issue 보유: +0.4  
- 문서화 토픽 보유: +0.2

## 문제 해결

### 자주 발생하는 오류

1. **"GitHub API token not configured"**
   ```bash
   # .env.local 파일에 토큰 추가
   GITHUB_TOKEN=your_github_token_here
   ```

2. **"API rate limit exceeded"**
   - GitHub API 제한 확인
   - 더 제한적인 검색 쿼리 사용
   - 캐시된 결과 활용

3. **"Invalid request data"**
   - 요청 JSON 형식 확인
   - 필수 필드 누락 확인
   - 배열 최소/최대 길이 확인

### 디버깅

개발 모드에서 자세한 로그를 확인할 수 있습니다:

```bash
DEBUG=contribute-suggestion:* npm run dev
```

### 성능 최적화

1. **캐싱 활용**
   ```javascript
   // API 응답 캐시 헤더 설정
   'Cache-Control': 's-maxage=300, stale-while-revalidate=3600'
   ```

2. **요청 최적화**
   - 불필요한 필드 제외
   - 페이지 크기 조정 (권장: 30개)
   - 병렬 요청 제한

## 업데이트 히스토리

### v1.0.0 (2024-01-01)
- 초기 API 릴리스
- 저장소 추천 기능
- 기본 검색 기능

### v1.1.0 (계획됨)
- 사용자 인증 추가
- 개인화된 추천
- 북마크 기능