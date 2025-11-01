# 🔧 프로덕션 환경 변수 템플릿

**파일명**: `.env.production`
**위치**: `D:\jjumV\yoloseum-phase3-ui\.env.production`
**주의**: 절대 git에 커밋하지 마세요 (이미 .gitignore에 포함됨)

---

## 📋 전체 템플릿

```env
# ============================================================================
# 1. FIREBASE CONFIGURATION
# ============================================================================
# Firebase Console → Settings → Your apps → Web
# https://console.firebase.google.com/project/yoloseum-3bebc/settings/general

VITE_FIREBASE_API_KEY=AIzaSyAkALLp4jADGlDyahDYMw8UXAXvfhB8yJI
VITE_FIREBASE_AUTH_DOMAIN=yolosseum-3bebc.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=yolosseum-3bebc
VITE_FIREBASE_STORAGE_BUCKET=yolosseum-3bebc.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=587811891515
VITE_FIREBASE_APP_ID=1:587811891515:web:446b7902d554ba9cd9af1e
VITE_FIREBASE_MEASUREMENT_ID=G-QPD38PGCPR

# ============================================================================
# 2. SOLANA BLOCKCHAIN CONFIGURATION
# ============================================================================
# Phase 1: devnet (테스트)
# Phase 3: mainnet-beta (프로덕션)

# 현재 설정: Phase 1 (devnet)
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com

# Phase 3용 메인넷 설정 (주석 처리됨, 준비 후 활성화)
# VITE_SOLANA_NETWORK=mainnet-beta
# VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# ============================================================================
# 3. SMART CONTRACT ADDRESSES
# ============================================================================
# Phase 2에서 Testnet 배포 후 설정
# Phase 3에서 Mainnet 배포 후 업데이트

# Testnet 프로그램 ID (Phase 2 배포 후 설정)
# VITE_VAULT_PROGRAM_ID=<testnet_program_id>
# VITE_MOMENTUM_VAULT=<testnet_momentum_vault>
# VITE_CONTRARIAN_VAULT=<testnet_contrarian_vault>

# Mainnet 프로그램 ID (Phase 3 배포 후 설정)
# VITE_VAULT_PROGRAM_ID=<mainnet_program_id>
# VITE_MOMENTUM_VAULT=<mainnet_momentum_vault>
# VITE_CONTRARIAN_VAULT=<mainnet_contrarian_vault>

# ============================================================================
# 4. ERROR MONITORING & LOGGING (SENTRY)
# ============================================================================
# Phase 3에서 Sentry 설정 후 추가
# https://sentry.io

# VITE_SENTRY_DSN=https://your-key@sentry.io/your-project-id
# VITE_SENTRY_ENVIRONMENT=production
# VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
# VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1

# ============================================================================
# 5. APPLICATION CONFIGURATION
# ============================================================================

VITE_APP_URL=https://yoloseum.web.app
VITE_APP_NAME=YOLOSEUM
VITE_APP_VERSION=1.0.0

# ============================================================================
# 6. FEATURE FLAGS (선택사항)
# ============================================================================
# 기능 활성화/비활성화 제어

# VITE_ENABLE_TESTING_MODE=false
# VITE_ENABLE_MOCK_DATA=false
# VITE_ENABLE_ANALYTICS=true
# VITE_ENABLE_ERROR_REPORTING=true

# ============================================================================
# 7. PERFORMANCE MONITORING
# ============================================================================

# Google Analytics
# VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Performance Monitoring
# VITE_ENABLE_PERFORMANCE_MONITORING=true
```

---

## 🔄 배포 단계별 설정

### Phase 1: 프론트엔드 배포 (현재)

**필수 설정**:
```env
# Firebase (동일하게 유지)
VITE_FIREBASE_API_KEY=AIzaSyAkALLp4jADGlDyahDYMw8UXAXvfhB8yJI
VITE_FIREBASE_AUTH_DOMAIN=yolosseum-3bebc.firebaseapp.com
...

# Solana (Devnet)
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com

# App URL
VITE_APP_URL=https://yoloseum.web.app
```

**스마트 컨트랙트 주소**: 아직 설정하지 않음 (Phase 2 후)

---

### Phase 2: 스마트 컨트랙트 Testnet 배포

**추가 설정**:
```env
# Phase 1 설정 유지...

# 새로 추가: Testnet 프로그램 ID (Phase 2 배포 후)
VITE_VAULT_PROGRAM_ID=<YOUR_TESTNET_PROGRAM_ID>
VITE_MOMENTUM_VAULT=<YOUR_TESTNET_VAULT>
VITE_CONTRARIAN_VAULT=<YOUR_TESTNET_VAULT>

# Solana는 여전히 devnet
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
```

**프로그램 ID 찾기**:
```bash
# Phase 2 배포 후
cd vault_program
anchor keys list
# 출력: vault_program: 9k1YTmZvFfqDdUJdXXk8qYBzwZjCK7kjvVzF6dxX7Ugj
```

---

### Phase 3: 메인넷 프로덕션 배포

**업데이트 설정**:
```env
# Firebase (동일)
VITE_FIREBASE_API_KEY=AIzaSyAkALLp4jADGlDyahDYMw8UXAXvfhB8yJI
...

# Solana (Mainnet-beta로 변경!)
VITE_SOLANA_NETWORK=mainnet-beta
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# 스마트 컨트랙트 (메인넷 프로그램 ID로 업데이트)
VITE_VAULT_PROGRAM_ID=<YOUR_MAINNET_PROGRAM_ID>
VITE_MOMENTUM_VAULT=<YOUR_MAINNET_VAULT>
VITE_CONTRARIAN_VAULT=<YOUR_MAINNET_VAULT>

# Sentry (활성화)
VITE_SENTRY_DSN=https://your-key@sentry.io/your-project-id
VITE_SENTRY_ENVIRONMENT=production

# App URL (변경될 수 있음)
VITE_APP_URL=https://yoloseum.com
```

---

## ✅ 설정 확인 체크리스트

### Phase 1 배포 전

- [ ] Firebase API 키 확인
- [ ] Solana RPC URL devnet으로 설정
- [ ] App URL 설정
- [ ] .env.production 파일 생성 (git 커밋 안 함)

### Phase 2 배포 전

- [ ] 스마트 컨트랙트 Testnet 배포 완료
- [ ] 프로그램 ID 확인 (`anchor keys list`)
- [ ] .env.production 업데이트 (프로그램 ID 추가)
- [ ] 프론트엔드에서 테스트

### Phase 3 배포 전

- [ ] 스마트 컨트랙트 Mainnet 배포 완료
- [ ] Mainnet 프로그램 ID 확인
- [ ] Solana 설정을 mainnet-beta로 변경
- [ ] Sentry 설정 추가
- [ ] 모든 주소가 mainnet 주소인지 확인

---

## 🔒 보안 주의사항

### DO ✅

- ✅ .env.production을 로컬에만 유지
- ✅ .gitignore에 포함되었는지 확인
- ✅ 환경 변수를 GitHub Secrets에 저장 (CI/CD용)
- ✅ 정기적으로 Firebase 키 로테이션
- ✅ 스마트 컨트랙트 주소를 버전 관리

### DON'T ❌

- ❌ .env.production을 git에 커밋하지 마세요
- ❌ 환경 변수를 하드코딩하지 마세요
- ❌ API 키를 공개 저장소에 노출하지 마세요
- ❌ 테스트 키를 프로덕션에 사용하지 마세요
- ❌ 개발 환경 변수를 프로덕션에 복사하지 마세요

---

## 🔄 CI/CD에서 환경 변수 사용

### GitHub Secrets 설정

1. Repository → Settings → Secrets and variables → Actions
2. New repository secret
3. 각 변수별로 추가

```
VITE_FIREBASE_API_KEY=AIzaSyAkALLp4jADGlDyahDYMw8UXAXvfhB8yJI
VITE_FIREBASE_PROJECT_ID=yolosseum-3bebc
...
```

### GitHub Actions에서 사용

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
      VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
      ...
    steps:
      - uses: actions/checkout@v3
      - run: npm run build
      - run: firebase deploy --token ${{ secrets.FIREBASE_TOKEN }}
```

---

## 📝 예시 파일

### 개발용 (.env.local)

```env
VITE_FIREBASE_API_KEY=AIzaSyAkALLp4jADGlDyahDYMw8UXAXvfhB8yJI
VITE_FIREBASE_AUTH_DOMAIN=yolosseum-3bebc.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=yolosseum-3bebc
VITE_FIREBASE_STORAGE_BUCKET=yolosseum-3bebc.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=587811891515
VITE_FIREBASE_APP_ID=1:587811891515:web:446b7902d554ba9cd9af1e

VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com

VITE_APP_URL=http://localhost:5173
```

### 프로덕션용 (.env.production)

위의 "전체 템플릿" 참조

---

## 📞 도움말

### 변수를 모르는 경우

```
Firebase: https://console.firebase.google.com → Settings
Solana: https://docs.solana.com
Sentry: https://sentry.io
```

### 변수 암호화

민감한 정보는:
- GitHub Secrets 사용
- Firebase Cloud Functions 환경 변수 사용
- 환경 변수로 관리 (코드에 하드코딩 금지)

---

**중요**: 이 파일은 템플릿입니다. 실제 값으로 채워서 사용하세요.

---

**작성**: Claude AI
**최종 업데이트**: 2025-11-01
