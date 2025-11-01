# 🔧 배포 트러블슈팅 가이드

**목적**: 배포 중 발생하는 문제 해결
**대상**: Firebase, Solana, 일반 에러

---

## 🚨 일반적인 에러 및 해결책

### 에러 1: "Cannot find module"

```
Error: Cannot find module '@sentry/react'
```

**원인**: 의존성 미설치

**해결책**:
```bash
npm install
npm install @sentry/react
npm run build
```

### 에러 2: "Firebase CLI not found"

```
firebase: command not found
```

**해결책**:
```bash
npm install -g firebase-tools
firebase --version
```

### 에러 3: "Permission denied"

```
Error: EACCES: permission denied
```

**해결책** (Windows):
```bash
# 관리자 권한으로 명령 프롬프트 실행
# 또는 PowerShell로 다시 시도
```

### 에러 4: "Network timeout"

```
Error: Network request failed
```

**해결책**:
```bash
# 인터넷 연결 확인
# 방화벽/프록시 설정 확인
# 재시도
firebase deploy --force
```

---

## 🔴 Firebase 배포 에러

### "No such file or directory: dist"

**원인**: 빌드 파일이 없음

**해결책**:
```bash
npm run build
firebase deploy --only hosting
```

### "Insufficient permissions"

**원인**: Firebase 권한 부족

**해결책**:
```bash
# Firebase 재로그인
firebase logout
firebase login
firebase deploy
```

### "Project not set"

**원인**: Firebase 프로젝트 미설정

**해결책**:
```bash
firebase use yoloseum-3bebc
firebase deploy
```

---

## ⛓️ Solana 배포 에러

### "Insufficient SOL to pay for transaction"

**원인**: 지갑에 SOL 부족

**해결책**:
```bash
# Testnet SOL 요청
solana airdrop 2

# 잔액 확인
solana balance
```

### "RPC request failed"

**원인**: RPC 노드 오류

**해결책**:
```bash
# 다른 RPC 사용
solana config set --url https://api.devnet.solana.com
# 또는
solana config set --url https://rpc.mainnet.solana.com
```

### "Program not found"

**원인**: 프로그램이 배포되지 않음

**해결책**:
```bash
# 프로그램 배포
anchor deploy

# 또는 프로그램 ID 확인
solana account <program_id>
```

---

## 🌐 웹사이트 에러

### 페이지가 로드되지 않음

```
ERR_CONNECTION_REFUSED
```

**해결책**:
```bash
# 배포 확인
firebase hosting:releases:list

# 캐시 삭제
# Chrome: Ctrl+Shift+Delete

# 시크릿 모드에서 확인
# Ctrl+Shift+N
```

### 404 Not Found

**원인**: 페이지 경로 오류

**해결책**:
```bash
# firebase.json의 rewrites 확인
# 모든 요청을 index.html로 리다이렉트해야 함
```

### 데이터가 로드되지 않음

```
Firestore connection error
```

**해결책**:
```bash
# 1. Firestore 규칙 확인
firebase firestore:rules:get

# 2. 보안 규칙이 너무 제한적이지 않은지 확인
# 3. 사용자 인증 확인

# 4. 네트워크 탭에서 요청 확인
# Chrome DevTools → Network → Firestore 요청 확인
```

---

## 📊 성능 문제

### 페이지가 느림

**해결책**:
```bash
# 1. Lighthouse 성능 검사
# Chrome DevTools → Lighthouse

# 2. 번들 크기 확인
# npm run build를 보면 크기 표시됨

# 3. 이미지 최적화
# WebP 형식 사용, 적절한 크기 설정

# 4. 코드 분할 확인
# vite.config.ts의 manualChunks 설정 확인
```

### 메모리 누수

**해결책**:
```bash
# 1. Chrome DevTools → Performance
# 2. 녹화 시작 → 사용 → 녹화 중지
# 3. 메모리 그래프 확인
# 4. 증가하는 메모리 원인 찾기
```

---

## 🔐 보안 문제

### "Unauthorized" 에러

**원인**: 권한 부족

**해결책**:
```bash
# 1. Firestore 규칙 확인
firebase firestore:rules:get

# 2. 사용자 인증 상태 확인
# 브라우저 콘솔에서
firebase.auth().currentUser

# 3. 필요한 권한 추가
```

### API 키 노출

**원인**: 환경 변수 실수로 공개

**해결책**:
```bash
# 1. 즉시 git 히스토리 정리
git filter-branch --tree-filter 'rm -f .env.local'

# 2. Firebase 키 재생성
# Firebase Console → Settings → API Keys

# 3. 새로 배포
firebase deploy
```

---

## 💬 디버깅 팁

### 콘솔 로그 확인

```javascript
// 프론트엔드 로그
console.log('Debug:', variable);

// Firebase 함수 로그
console.log('Function:', message);
firebase functions:log
```

### DevTools 사용

```javascript
// Elements 탭: DOM 구조 확인
// Network 탭: API 요청/응답 확인
// Console 탭: 에러 확인
// Performance 탭: 성능 측정
// Application 탭: 로컬스토리지 확인
```

### 에러 로그 추적

```bash
# Firebase 함수 로그 실시간 모니터링
firebase functions:log --follow

# Sentry 에러 확인
# https://sentry.io
```

---

## 📞 외부 지원

### 공식 문서

- [Firebase 문서](https://firebase.google.com/docs)
- [Solana 문서](https://docs.solana.com)
- [Anchor 문서](https://www.anchor-lang.com)
- [React 문서](https://react.dev)

### 커뮤니티

- [Solana Discord](https://discord.gg/solana)
- [Firebase Google Groups](https://groups.google.com/g/firebase-talk)
- [Stack Overflow](https://stackoverflow.com)

---

**문제 해결 후**: 근본 원인 분석 및 향후 예방 조치 수립

---

**작성**: Claude AI
**최종 업데이트**: 2025-11-01
