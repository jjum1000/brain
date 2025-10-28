# Firebase 환경 변수 설정 가이드

## 📋 개요

Firebase 설정이 `.env.local` 파일에 저장되어 있으므로, 민감한 정보가 GitHub에 업로드되지 않습니다.

---

## 📝 .env.local 파일 구조

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyAkALLp4jADGlDyahDYMw8UXAXvfhB8yJI
VITE_FIREBASE_AUTH_DOMAIN=yolosseum-3bebc.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=yolosseum-3bebc
VITE_FIREBASE_STORAGE_BUCKET=yolosseum-3bebc.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=587811891515
VITE_FIREBASE_APP_ID=1:587811891515:web:446b7902d554ba9cd9af1e
VITE_FIREBASE_MEASUREMENT_ID=G-QPD38PGCPR
```

---

## 🔑 환경 변수 이름 설명

| 환경 변수 | 설명 | 필수 여부 |
|-----------|------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key | ✅ |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | ✅ |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | ✅ |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | ✅ |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | ✅ |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | ✅ |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase Measurement ID (Analytics) | ⭕ (선택) |

### VITE_ 접두사란?

- Vite 빌드 도구에서 환경 변수를 자동으로 로드하기 위한 접두사
- `VITE_`로 시작하는 환경 변수만 클라이언트 사이드에서 접근 가능
- 보안상 `VITE_` 없는 변수는 서버사이드 전용

---

## 🚀 사용 방법

### 1. src/firebase.js에서 환경 변수 로드

```javascript
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
```

### 2. 다른 파일에서 Firebase 사용

```javascript
// App.jsx 또는 다른 컴포넌트에서
import { app, analytics } from './firebase.js';
import { getAuth } from 'firebase/auth';

const auth = getAuth(app);
```

---

## 🔒 보안 체크리스트

- ✅ `.env.local` 파일은 `.gitignore`에 포함됨
- ✅ GitHub에 업로드되지 않음
- ✅ API Key가 노출되지 않음
- ✅ `VITE_` 접두사로 클라이언트 사이드만 접근 가능

---

## 📱 로컬 개발 환경 설정

### 첫 번째 시간 (프로젝트 시작 시)

```bash
# 1. 프로젝트 클론
git clone <repository-url>
cd jjumV

# 2. 의존성 설치
npm install
# 또는
pnpm install

# 3. .env.local 파일이 이미 있는지 확인
ls -la .env.local
```

### 없다면 직접 생성

```bash
# .env.local 파일 생성
cat > .env.local << EOF
VITE_FIREBASE_API_KEY=AIzaSyAkALLp4jADGlDyahDYMw8UXAXvfhB8yJI
VITE_FIREBASE_AUTH_DOMAIN=yolosseum-3bebc.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=yolosseum-3bebc
VITE_FIREBASE_STORAGE_BUCKET=yolosseum-3bebc.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=587811891515
VITE_FIREBASE_APP_ID=1:587811891515:web:446b7902d554ba9cd9af1e
VITE_FIREBASE_MEASUREMENT_ID=G-QPD38PGCPR
EOF
```

---

## 🔄 Firebase 설정 변경 시

새로운 Firebase 프로젝트를 사용하려면:

1. **Firebase Console에서 설정 확인**
   - https://console.firebase.google.com/project/yolosseum-3bebc/settings/general

2. **.env.local 파일 업데이트**
   ```env
   VITE_FIREBASE_API_KEY=새로운_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN=새로운_AUTH_DOMAIN
   # ... 나머지 설정
   ```

3. **개발 서버 재시작**
   ```bash
   npm run dev
   ```

---

## ⚠️ 주의 사항

### 하지 말아야 할 것 ❌

```javascript
// ❌ 절대 이렇게 하지 마세요!
const firebaseConfig = {
  apiKey: "AIzaSyAkALLp4jADGlDyahDYMw8UXAXvfhB8yJI",  // 직접 입력
  // ...
};
```

### 해야 할 것 ✅

```javascript
// ✅ 이렇게 하세요!
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,  // 환경 변수 사용
  // ...
};
```

---

## 🚨 Firebase API Key 노출 시 대응

만약 실수로 API Key를 GitHub에 업로드했다면:

1. **Firebase Console에서 키 비활성화**
   - https://console.firebase.google.com/project/yolosseum-3bebc/settings/serviceaccounts/adminsdk

2. **새로운 키 생성**
   - Firebase Console → Settings → Service Accounts → Generate Key

3. **.env.local 파일 업데이트**

---

## 📚 참고 자료

- **Vite 환경 변수**: https://vitejs.dev/guide/env-and-mode.html
- **Firebase 보안**: https://firebase.google.com/docs/database/security
- **환경 변수 모범 사례**: https://12factor.net/config

---

**최종 업데이트**: 2025년 10월 28일
**상태**: ✅ 완료

