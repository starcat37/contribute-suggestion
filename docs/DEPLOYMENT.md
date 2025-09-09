# 배포 가이드

오픈소스 기여 추천 시스템을 다양한 플랫폼에 배포하는 방법을 안내합니다.

## 목차

- [사전 준비](#사전-준비)
- [Vercel 배포 (권장)](#vercel-배포-권장)
- [Netlify 배포](#netlify-배포)
- [Railway 배포](#railway-배포)
- [AWS Amplify 배포](#aws-amplify-배포)
- [Docker 컨테이너 배포](#docker-컨테이너-배포)
- [자체 호스팅](#자체-호스팅)
- [환경변수 설정](#환경변수-설정)
- [도메인 연결](#도메인-연결)
- [모니터링 설정](#모니터링-설정)

## 사전 준비

### 1. GitHub Personal Access Token 발급

1. **GitHub 계정 로그인** → Settings → Developer settings
2. **Personal access tokens** → **Tokens (classic)** → **Generate new token**
3. **권한 선택**:
   - `public_repo`: 공개 저장소 접근
   - `read:org`: 조직 정보 읽기 (선택사항)
4. **토큰 복사** 및 안전한 곳에 저장

### 2. 프로젝트 준비

```bash
# 프로젝트 클론
git clone https://github.com/yourusername/contribute-suggestion.git
cd contribute-suggestion

# 의존성 설치
npm install

# 프로덕션 빌드 테스트
npm run build
```

### 3. 환경변수 파일 준비

```bash
# .env.example을 복사하여 .env.local 생성
cp .env.example .env.local

# GitHub 토큰 설정
echo "GITHUB_TOKEN=your_github_token_here" >> .env.local
```

---

## Vercel 배포 (권장)

Next.js와 완벽하게 호환되는 Vercel을 사용한 배포 방법입니다.

### 방법 1: Vercel 웹 인터페이스

1. **Vercel 계정 생성**: [vercel.com](https://vercel.com) 가입
2. **프로젝트 Import**:
   - "New Project" 클릭
   - GitHub 저장소 연결
   - `contribute-suggestion` 저장소 선택
3. **환경변수 설정**:
   - "Environment Variables" 섹션에서 추가:
     ```
     Name: GITHUB_TOKEN
     Value: your_github_personal_access_token
     ```
   - "Add another" 클릭하여 추가:
     ```
     Name: NEXT_PUBLIC_APP_URL
     Value: https://your-app-name.vercel.app
     ```
4. **Deploy 버튼 클릭**

### 방법 2: Vercel CLI

```bash
# Vercel CLI 설치
npm install -g vercel

# Vercel 로그인
vercel login

# 프로젝트 배포
vercel

# 환경변수 설정
vercel env add GITHUB_TOKEN production
vercel env add NEXT_PUBLIC_APP_URL production

# 프로덕션 배포
vercel --prod
```

### Vercel 설정 파일

**vercel.json** (선택사항):

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["icn1", "hnd1", "pdx1"],
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=300, stale-while-revalidate=3600"
        }
      ]
    }
  ]
}
```

### 장점
- ✅ 무료 Hobby 플랜 제공
- ✅ 자동 HTTPS
- ✅ Global CDN
- ✅ GitHub 통합으로 자동 배포
- ✅ Serverless Functions 지원
- ✅ 실시간 로그 및 분석

---

## Netlify 배포

정적 사이트 생성을 지원하는 Netlify 배포 방법입니다.

### Next.js Static Export 설정

**next.config.js** 수정:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // API routes는 static export에서 지원되지 않음
  // Netlify Functions로 별도 구현 필요
}

module.exports = nextConfig
```

### Netlify 배포 과정

1. **Netlify 계정 생성**: [netlify.com](https://netlify.com) 가입
2. **사이트 생성**:
   - "New site from Git" 클릭
   - GitHub 저장소 연결
   - 브랜치: `main`
   - 빌드 명령: `npm run build`
   - 배포 디렉토리: `out`
3. **환경변수 설정**:
   - Site settings → Environment variables
   - `GITHUB_TOKEN` 추가
4. **Netlify Functions 설정** (API 경로용):

```bash
# netlify/functions 디렉토리 생성
mkdir -p netlify/functions

# API 함수 구현 (예시)
# netlify/functions/recommend.js
exports.handler = async (event, context) => {
  // API 로직 구현
}
```

### 제한사항
- ❌ API Routes 미지원 (Netlify Functions로 대체 필요)
- ❌ ISR (Incremental Static Regeneration) 미지원
- ✅ 정적 콘텐츠 호스팅 우수
- ✅ Form 처리 기능 내장

---

## Railway 배포

컨테이너 기반의 Railway 플랫폼 배포 방법입니다.

### Railway 배포 과정

1. **Railway 계정 생성**: [railway.app](https://railway.app) 가입
2. **프로젝트 생성**:
   - "New Project" → "Deploy from GitHub repo"
   - 저장소 선택
3. **환경변수 설정**:
   - Variables 탭에서 추가:
     ```
     GITHUB_TOKEN=your_token
     NEXT_PUBLIC_APP_URL=https://your-app.railway.app
     ```
4. **빌드 설정** (railway.json):

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health"
  }
}
```

### 장점
- ✅ 완전한 Node.js 서버 지원
- ✅ 데이터베이스 통합 쉬움
- ✅ 자동 스케일링
- ✅ 로그 모니터링 내장

---

## AWS Amplify 배포

AWS 클라우드 서비스를 활용한 배포 방법입니다.

### Amplify 배포 과정

1. **AWS 계정 생성** 및 Amplify 콘솔 접속
2. **앱 생성**:
   - "New app" → "Host web app"
   - GitHub 연결 및 저장소 선택
3. **빌드 설정** (amplify.yml):

```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm install
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
      buildSettings:
        commands: []
        baseDirectory: /
```

4. **환경변수 설정**:
   - App settings → Environment variables
   - `GITHUB_TOKEN` 추가

### 고급 기능
- ✅ AWS 서비스 통합 (Lambda, DynamoDB 등)
- ✅ Custom domains 지원
- ✅ A/B 테스팅 기능
- ✅ 브랜치별 배포

---

## Docker 컨테이너 배포

Docker를 사용한 컨테이너화 배포 방법입니다.

### Dockerfile

```dockerfile
# 멀티스테이지 빌드
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runner
WORKDIR /app

# 보안을 위한 사용자 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 필요한 파일만 복사
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs . .

# Next.js 빌드
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  contribute-suggestion:
    build: .
    ports:
      - "3000:3000"
    environment:
      - GITHUB_TOKEN=${GITHUB_TOKEN}
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 5
```

### 배포 명령

```bash
# Docker 이미지 빌드
docker build -t contribute-suggestion .

# 컨테이너 실행
docker run -p 3000:3000 \
  -e GITHUB_TOKEN=your_token \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  contribute-suggestion

# Docker Compose 사용
docker-compose up -d
```

---

## 자체 호스팅

VPS 또는 전용 서버에서 직접 호스팅하는 방법입니다.

### 서버 설정 (Ubuntu 22.04)

```bash
# Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 프로세스 관리자 설치
sudo npm install -g pm2

# 애플리케이션 배포
git clone https://github.com/yourusername/contribute-suggestion.git
cd contribute-suggestion
npm install
npm run build

# 환경변수 설정
echo "GITHUB_TOKEN=your_token" > .env.production
echo "NEXT_PUBLIC_APP_URL=https://yourdomain.com" >> .env.production

# PM2로 애플리케이션 시작
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### PM2 설정 파일

**ecosystem.config.js**:

```javascript
module.exports = {
  apps: [{
    name: 'contribute-suggestion',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/contribute-suggestion',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      GITHUB_TOKEN: 'your_token',
      NEXT_PUBLIC_APP_URL: 'https://yourdomain.com'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

### Nginx 리버스 프록시 설정

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/ssl/certs/yourdomain.com.pem;
    ssl_certificate_key /etc/ssl/private/yourdomain.com.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 환경변수 설정

### 필수 환경변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `GITHUB_TOKEN` | GitHub Personal Access Token | `ghp_xxxxxxxxxxxx` |
| `NEXT_PUBLIC_APP_URL` | 애플리케이션 URL | `https://your-app.vercel.app` |

### 선택적 환경변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `NODE_ENV` | 실행 환경 | `production` |
| `PORT` | 서버 포트 | `3000` |
| `VERCEL_KV_URL` | Redis 캐시 URL | - |
| `VERCEL_KV_REST_API_URL` | Redis REST API URL | - |

### 플랫폼별 환경변수 설정

**Vercel**:
```bash
vercel env add GITHUB_TOKEN production
vercel env add NEXT_PUBLIC_APP_URL production
```

**Netlify**:
Site settings → Environment variables → Add variable

**Railway**:
Variables 탭에서 직접 입력

**Docker**:
```bash
docker run -e GITHUB_TOKEN=xxx -e NEXT_PUBLIC_APP_URL=xxx app
```

---

## 도메인 연결

### Vercel 커스텀 도메인

1. **프로젝트 설정** → **Domains** 섹션
2. **도메인 추가**: `yourdomain.com` 입력
3. **DNS 설정**: 도메인 레지스트라에서 다음 레코드 추가
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

### Netlify 커스텀 도메인

1. **Site settings** → **Domain management**
2. **Add custom domain**: 도메인 입력
3. **DNS 설정**: Netlify Name Servers 사용 또는 CNAME 레코드 설정

### Cloudflare DNS (권장)

```bash
# Cloudflare DNS 설정 예시
Type: CNAME
Name: @
Content: your-app.vercel.app
Proxy status: Proxied (orange cloud)
```

**장점**:
- ✅ 무료 SSL 인증서
- ✅ DDoS 보호
- ✅ CDN 가속
- ✅ 분석 도구

---

## 모니터링 설정

### 애플리케이션 성능 모니터링

**Vercel Analytics 설정**:

```bash
npm install @vercel/analytics
```

```jsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 에러 추적

**Sentry 설정**:

```bash
npm install @sentry/nextjs
```

**sentry.client.config.js**:
```javascript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

### 업타임 모니터링

**Uptime Robot 설정**:
1. [uptimerobot.com](https://uptimerobot.com) 가입
2. 새 모니터 추가: `https://yourdomain.com`
3. 체크 간격: 5분
4. 알림 설정: 이메일, 슬랙 등

### 로그 관리

**Vercel 로그**:
```bash
# 실시간 로그 확인
vercel logs --follow

# 특정 함수 로그
vercel logs --limit=100 --since=1h
```

**자체 호스팅 로그**:
```bash
# PM2 로그
pm2 logs contribute-suggestion

# 로그 파일 확인
tail -f logs/combined.log
```

---

## 성능 최적화

### 빌드 최적화

**next.config.js** 성능 설정:

```javascript
const nextConfig = {
  // 번들 분석
  bundleAnalyzer: {
    enabled: process.env.ANALYZE === 'true',
  },
  
  // 이미지 최적화
  images: {
    domains: ['avatars.githubusercontent.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // 컴파일러 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 실험적 기능
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  }
}
```

### 캐싱 전략

```javascript
// API 응답 캐싱
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 's-maxage=300, stale-while-revalidate=3600'
    }
  })
}
```

### CDN 설정

**Cloudflare 캐시 규칙**:
```
Page Rule: *.yourdomain.com/api/*
Settings: Cache Level = Cache Everything, Edge TTL = 5 minutes
```

---

## 보안 설정

### 보안 헤더 설정

**next.config.js**:
```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

### 환경변수 보안

```bash
# GitHub Secrets 설정 (GitHub Actions 용)
GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
NEXT_PUBLIC_APP_URL: ${{ secrets.APP_URL }}

# 민감한 정보는 절대 클라이언트에 노출하지 않기
# ❌ NEXT_PUBLIC_GITHUB_TOKEN (잘못된 예)
# ✅ GITHUB_TOKEN (올바른 예)
```

---

## 문제 해결

### 일반적인 배포 오류

1. **빌드 실패**:
   ```bash
   # 종속성 충돌 해결
   rm -rf node_modules package-lock.json
   npm install
   
   # TypeScript 오류 확인
   npm run type-check
   ```

2. **환경변수 누락**:
   ```bash
   # 환경변수 확인
   echo $GITHUB_TOKEN
   
   # .env 파일 검증
   cat .env.local
   ```

3. **API 요청 실패**:
   ```javascript
   // CORS 오류 해결 (middleware.ts)
   response.headers.set('Access-Control-Allow-Origin', '*')
   response.headers.set('Access-Control-Allow-Methods', 'GET, POST')
   ```

### 성능 문제 해결

1. **느린 로딩**:
   ```bash
   # 번들 크기 분석
   npm install -g @next/bundle-analyzer
   ANALYZE=true npm run build
   ```

2. **API 응답 지연**:
   ```javascript
   // 병렬 처리로 최적화
   const [languages, issues] = await Promise.all([
     getLanguages(repo),
     getIssues(repo)
   ])
   ```

### 모니터링 및 디버깅

```bash
# Vercel 함수 로그
vercel logs --limit=50

# 로컬 디버깅
DEBUG=contribute-suggestion:* npm run dev

# 성능 프로파일링
NODE_ENV=production npm run build
npm run start
```

---

## 체크리스트

배포 전 확인사항:

### 기본 설정
- [ ] GitHub Personal Access Token 발급
- [ ] 환경변수 설정 완료
- [ ] 프로덕션 빌드 테스트 (`npm run build`)
- [ ] 테스트 실행 (`npm test`)
- [ ] 린팅 통과 (`npm run lint`)

### 보안 점검
- [ ] 민감한 정보 환경변수 분리
- [ ] HTTPS 설정
- [ ] 보안 헤더 적용
- [ ] Rate limiting 구현

### 성능 최적화
- [ ] 이미지 최적화 설정
- [ ] 캐싱 전략 구현
- [ ] 번들 크기 최적화
- [ ] CDN 설정

### 모니터링
- [ ] 에러 추적 도구 설정
- [ ] 성능 모니터링 도구 설정
- [ ] 로그 관리 시스템 구축
- [ ] 백업 전략 수립

---

이 가이드를 따라하면 안정적이고 확장 가능한 프로덕션 환경에 애플리케이션을 배포할 수 있습니다. 추가 질문이나 문제가 있다면 [이슈](https://github.com/yourusername/contribute-suggestion/issues)를 생성해주세요.