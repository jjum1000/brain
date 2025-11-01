# 📋 DEPLOYMENT PHASE 3: 프로덕션 배포 및 모니터링

**단계**: Phase 3
**기간**: 2-3일
**목표**: Mainnet 배포 및 CI/CD 자동화
**난이도**: ⭐⭐⭐⭐⭐ (매우 어려움)

---

## 🔄 작업 절차

### 1단계: Mainnet 배포 (1일)

```bash
# Mainnet RPC로 전환
solana config set --url https://api.mainnet-beta.solana.com

# 메인넷 지갑 생성 (안전하게 보관!)
solana-keygen new --outfile ~/mainnet-wallet.json

# 지갑 설정
solana config set --keypair ~/mainnet-wallet.json

# 배포 (충분한 SOL 필요 - ~3-5 SOL)
anchor deploy --provider.cluster mainnet

# 프로그램 ID 저장
echo "프로그램 ID: $(solana address -k target/deploy/vault_program-keypair.json)" > mainnet_id.txt
```

**환경 변수 업데이트** (.env.production):
```env
VITE_SOLANA_NETWORK=mainnet-beta
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_VAULT_PROGRAM_ID=<mainnet_program_id>
```

### 2단계: CI/CD 파이프라인 구축 (1일)

**.github/workflows/deploy.yml**:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Type check
        run: npx tsc --noEmit

  deploy:
    needs: test-and-build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

**GitHub Secrets 설정**:

1. GitHub Repository → Settings → Secrets and variables → Actions
2. New repository secret
3. 이름: `FIREBASE_TOKEN`, 값: Firebase 토큰

```bash
# Firebase 토큰 생성
firebase login:ci
# CI 토큰을 GitHub Secrets에 등록
```

### 3단계: 모니터링 설정 (6시간)

#### 3.1 Sentry 설정

```bash
# Sentry 설치
npm install @sentry/react @sentry/tracing

# .env.production에 추가
VITE_SENTRY_DSN=https://your-key@sentry.io/your-project-id
```

#### 3.2 Google Analytics 확인

```bash
# Firebase Console에서 Google Analytics 활성화
# Analytics → 대시보드 → 실시간 사용자 모니터링
```

#### 3.3 성능 모니터링

```bash
# Firebase Performance Monitoring
# 자동으로 수집되는 메트릭:
# - 페이지 로드 시간
# - 네트워크 요청 시간
# - 사용자 상호작용
```

---

## 🔍 배포 후 검증

### 1단계: 기본 기능 테스트

```bash
# Mainnet에서 지갑 연결 테스트
# 1. Phantom 지갑으로 로그인
# 2. 자산 조회
# 3. 거래 실행 (테스트 금액)
```

### 2단계: 성능 모니터링

```bash
# Firebase Console
# - Real-time 사용자 수 확인
# - 세션 지속 시간
# - 이탈률

# Lighthouse CI
npm run lighthouse:ci
```

### 3단계: 에러 모니터링

```bash
# Sentry Dashboard
# - 에러율 확인
# - 성능 이상 감지
# - 알림 설정
```

---

## 📊 프로덕션 모니터링 대시보드

### Firebase Console

```
https://console.firebase.google.com/project/yoloseum-3bebc

1. Analytics
   - 실시간 사용자 수
   - 세션 지속 시간
   - 전환율

2. Performance
   - 페이지 로드 시간
   - 네트워크 지연
   - 앱 성능 점수

3. Hosting
   - 배포 히스토리
   - 트래픽 분석
   - CDN 성능
```

### Google Analytics

```
https://analytics.google.com

Dashboard 주요 지표:
- DAU (Daily Active Users)
- 세션당 페이지 수
- 평균 세션 지속 시간
- 이탈률
```

### Sentry

```
https://sentry.io/organizations/your-org

Dashboard 주요 지표:
- 에러율
- 성능 이상
- 사용자 피드백
- 릴리스 상태
```

---

## ✅ Phase 3 완료 체크리스트

- [ ] Mainnet 스마트 컨트랙트 배포
- [ ] Mainnet 프로그램 ID 저장
- [ ] .env.production 메인넷 설정
- [ ] CI/CD 파이프라인 구축
- [ ] GitHub Secrets 설정
- [ ] Sentry 설정
- [ ] Google Analytics 활성화
- [ ] Firebase Performance 모니터링
- [ ] 기본 기능 테스트 완료
- [ ] 성능 모니터링 확인
- [ ] 에러 모니터링 확인

---

## 🎯 프로덕션 운영 체크리스트

### 일일 점검 (Daily)

```
- [ ] Sentry 에러 확인
- [ ] Firebase Real-time 사용자 수 확인
- [ ] 성능 메트릭 정상 범위 확인
- [ ] 배포된 함수 로그 확인
```

### 주간 점검 (Weekly)

```
- [ ] Analytics 리포트 검토
- [ ] 성능 추세 분석
- [ ] 사용자 피드백 검토
- [ ] 에러 패턴 분석
```

### 월간 점검 (Monthly)

```
- [ ] 데이터 백업 확인
- [ ] 보안 감사
- [ ] 성능 최적화
- [ ] 비용 분석
```

---

**다음**: 완전한 프로덕션 서비스 운영

---

**작성**: Claude AI
**최종 업데이트**: 2025-11-01
