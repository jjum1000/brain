# 🖥️ YOLOSEUM 개발 환경 설정 (Environment Configuration)

**작성일**: 2025-11-02
**최종 업데이트**: 2025-11-02
**상태**: ✅ Production Ready (95%)
**목적**: 현재 개발 환경 설정 내용 및 도구 정보 통합 문서

---

## 📊 환경 요약

```
┌─────────────────────────────────────────────────┐
│ 개발 플랫폼: Windows 11 + WSL2 Ubuntu           │
│ 프로젝트 위치: d:\jjumV                         │
│ 활성 프로젝트: yoloseum-phase3-ui/              │
│ 배포 URL: https://yolosseum-3bebc.web.app       │
│ 상태: Phase 4 완료, Phase 5 준비 중             │
└─────────────────────────────────────────────────┘
```

---

## 🪟 Windows 환경

### 설치된 도구
| 도구 | 버전 | 경로 | 용도 |
|------|------|------|------|
| **Node.js** | 24.10.0 | `C:\Program Files\nodejs` | React, npm 패키지 관리 |
| **npm** | 11.6.1 | 내장 | 패키지 관리자 |
| **VSCode** | 최신 | `C:\Users\jjum100\AppData\Local\Programs\Windsurf\bin` | IDE |
| **Git** | 최신 | `C:\Program Files\Git\bin` | 버전 관리 |
| **Python** | 3.x | 설치됨 | 유틸리티 스크립트 |

### 프로젝트 경로
```
d:\jjumV\
├── yoloseum-phase3-ui/          ← 메인 프로젝트 (React + Firebase)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── context/
│   ├── dist/                     (빌드 결과)
│   ├── node_modules/             (457MB)
│   ├── .env.local                (개발 환경변수)
│   └── .env.production           (프로덕션 환경변수)
│
├── smart-contracts/              ← 스마트 컨트랙트 프로젝트
│   └── vault_program/            (Anchor 프로젝트)
│       ├── programs/
│       ├── tests/
│       ├── Anchor.toml
│       └── Cargo.toml
│
├── functions/                    (Firebase Cloud Functions)
├── Docs/                         (문서)
└── .claude/
    └── settings.local.json       (Claude Code 설정)
```

### 주요 패키지 버전 (package.json)
```json
{
  "react": "^19.1.1",
  "typescript": "~5.9.3",
  "firebase": "^12.4.0",
  "@solana/web3.js": "^1.98.4",
  "@solana/wallet-adapter-react": "^0.15.39",
  "@jup-ag/api": "^6.0.45",
  "vite": "^7.1.7",
  "vitest": "^4.0.6",
  "@playwright/test": "^1.56.1"
}
```

---

## 🐧 Ubuntu WSL2 환경

### 배포 정보
```
배포명: Ubuntu
상태: Running (필요시 자동 시작)
버전: WSL2
경로: /mnt/d/jjumV
```

### 설치된 도구
| 도구 | 버전 | 설치 위치 | 용도 |
|------|------|----------|------|
| **Rust** | 1.91.0 | `~/.cargo/bin` | 스마트 컨트랙트 개발 |
| **Cargo** | 1.91.0 | `~/.cargo/bin` | Rust 패키지 관리자 |
| **Solana CLI** | 2.3.13 | `~/.local/share/solana/install/active_release/bin` | 블록체인 도구 |
| **Anchor** | 0.32.1 | `~/.cargo/bin` (AVM 관리) | Solana 프레임워크 |
| **Node.js** | 24.10.0 | 설치됨 | TypeScript 테스트 |
| **npm** | 11.6.1 | 설치됨 | 패키지 관리 |

### PATH 설정
```bash
# ~/.bashrc에 자동 추가됨
export PATH="$HOME/.cargo/bin:$PATH"
source "$HOME/.cargo/env"
```

### 실행 방법
```bash
# Ubuntu bash 환경에서 실행 (login shell 필요)
wsl -d Ubuntu -e bash -l -c "command"

# 예시:
wsl -d Ubuntu -e bash -l -c "rustc --version"
wsl -d Ubuntu -e bash -l -c "cd /mnt/d/jjumV/smart-contracts/vault_program && cargo build"
```

---

## 🔐 Firebase 설정

### 프로젝트 정보
| 항목 | 값 |
|------|-----|
| **프로젝트 ID** | yolosseum-3bebc |
| **배포 URL** | https://yolosseum-3bebc.web.app |
| **리전** | us-central1 |
| **상태** | ✅ 배포 완료 |

### 환경 변수 (`.env.production`)
```env
# Firebase 설정 (공개 키)
VITE_FIREBASE_API_KEY=AIzaSyAkALLp4jADGlDyahDYMw8UXAXvfhB8yJI
VITE_FIREBASE_AUTH_DOMAIN=yolosseum-3bebc.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=yolosseum-3bebc
VITE_FIREBASE_STORAGE_BUCKET=yolosseum-3bebc.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=587811891515
VITE_FIREBASE_APP_ID=1:587811891515:web:446b7902d554ba9cd9af1e
VITE_FIREBASE_MEASUREMENT_ID=G-QPD38PGCPR
```

### Firestore 데이터베이스
```
위치: us-central1
보안 규칙: 배포됨 (firestore.rules)
인덱스: 자동 생성됨
```

---

## ⛓️ Solana 블록체인 설정

### 네트워크 설정
```bash
# 현재 설정값
Network: devnet
RPC URL: https://api.devnet.solana.com
Keypair: /home/ubuntu/.config/solana/id.json

# 설정 확인
solana config get

# 설정 변경
solana config set --url https://api.devnet.solana.com
```

### 지갑 설정
```bash
# 지갑 생성 (필요시)
solana-keygen new -o ~/.config/solana/id.json

# 지갑 확인
solana address

# 잔액 확인
solana balance
```

### SOL 받기 (Faucet)
```bash
# Devnet에서 2 SOL 받기
solana airdrop 2

# Testnet에서 받기
solana airdrop 2 --url https://api.testnet.solana.com
```

---

## 🔗 스마트 컨트랙트 (Anchor)

### 프로젝트 구조
```
vault_program/
├── Anchor.toml          # Anchor 설정
├── Cargo.toml          # Rust 의존성
├── Cargo.lock          # 락 파일
├── rust-toolchain.toml # Rust 버전
├── package.json        # Node 의존성
├── tsconfig.json       # TypeScript 설정
├── programs/
│   └── vault_program/
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs  (메인 스마트 컨트랙트)
├── tests/              # TypeScript 테스트
├── migrations/         # 마이그레이션 스크립트
└── target/             # 빌드 결과
```

### 빌드 및 테스트
```bash
# Rust 스마트 컨트랙트 빌드
cd vault_program
cargo build

# BPF (Solana 바이트코드) 컴파일
cargo build-sbf

# 테스트 실행
anchor test

# 로컬 네트워크에 배포
anchor deploy
```

### 프로그램 ID
```
8yekjcmafMDnEu8anD5gs4TwpbXTdqWcSrHnaH7BQ44X
```

---

## 📝 Claude Code 설정 (`.claude/settings.local.json`)

### 환경 정보
```json
{
  "env": {
    "PLATFORM": "Windows (WSL2 Ubuntu)",
    "WINDOWS_ACTIVE": true,
    "WINDOWS_PATH": "d:\\jjumV\\yoloseum-phase3-ui",
    "WINDOWS_PROJECT": "React 19 + TypeScript + Firebase + Solana",
    "UBUNTU_ACTIVE": true,
    "UBUNTU_HOSTNAME": "AD01769974",
    "UBUNTU_TOOLS": "Rust-1.91.0, Solana-CLI-2.3.13, Anchor-0.32.1, Node-24.10.0, npm-11.6.1",
    "SOLANA_NETWORK": "devnet",
    "SOLANA_RPC": "https://api.devnet.solana.com",
    "NODE_VERSION": "24.10.0",
    "NPM_VERSION": "11.6.1",
    "REFERENCE_DOCS": "Docs/00_Architecture/PROJECT_STRUCTURE_CLARIFICATION.md, ENVIRONMENT_STATUS.md"
  },
  "permissions": {
    "allow": [
      "Bash(git commit:*)",
      "Bash(npm:*)",
      "Bash(npm run build:*)",
      "Bash(npm test:*)",
      "Bash(wsl -d Ubuntu -e bash -l -c:*)",
      "Bash(anchor:*)",
      "Bash(cargo:*)"
    ]
  }
}
```

---

## 🚀 빠른 명령어 레퍼런스

### Windows 명령어
```bash
# React 프로젝트 개발 서버 시작
cd d:\jjumV\yoloseum-phase3-ui
npm run dev

# 프로덕션 빌드
npm run build

# 테스트 실행
npm test
npm run test:e2e

# Firebase 배포
firebase deploy
```

### Ubuntu 명령어
```bash
# Solana 네트워크 상태 확인
solana cluster-version

# 스마트 컨트랙트 빌드
cd /mnt/d/jjumV/smart-contracts/vault_program
cargo build

# Anchor 테스트
anchor test

# 배포
anchor deploy --provider.cluster devnet
```

### 혼합 명령어
```bash
# Windows에서 Ubuntu 명령어 실행
wsl -d Ubuntu -e bash -l -c "cd /mnt/d/jjumV/smart-contracts/vault_program && anchor build"

# 여러 명령어 체인
wsl -d Ubuntu -e bash -l -c "solana config get && solana balance"
```

---

## 🔄 개발 워크플로우

### 1. 로컬 개발
```bash
# 터미널 1: React 개발 서버
cd d:\jjumV\yoloseum-phase3-ui
npm run dev  # http://localhost:5173

# 터미널 2: 스마트 컨트랙트 (필요시)
wsl -d Ubuntu -e bash -l -c "cd /mnt/d/jjumV/smart-contracts/vault_program && anchor test"
```

### 2. 빌드 및 배포
```bash
# 1단계: 빌드 검증
npm run build
npm test

# 2단계: Firebase 배포
firebase deploy --only hosting

# 3단계: 스마트 컨트랙트 배포 (devnet)
wsl -d Ubuntu -e bash -l -c "anchor deploy --provider.cluster devnet"
```

### 3. 모니터링
```bash
# Firebase 배포 상태
firebase hosting:channel:list

# Solana 트랜잭션 확인
solana transaction <tx-signature>

# 에러 모니터링 (Sentry)
# https://sentry.io/organizations/your-org/
```

---

## 📋 체크리스트

### 환경 설정 검증
- [x] Node.js 24.10.0 설치
- [x] npm 11.6.1 설치
- [x] Git 설치
- [x] WSL2 Ubuntu 설치
- [x] Rust 1.91.0 설치
- [x] Solana CLI 2.3.13 설치
- [x] Anchor 0.32.1 설치

### 프로젝트 설정
- [x] Firebase 프로젝트 생성
- [x] yoloseum-phase3-ui 배포
- [x] Firestore 규칙 배포
- [x] smart-contracts/vault_program 생성
- [x] .env 파일 설정

### 개발 준비
- [x] npm 의존성 설치
- [x] 빌드 성공 (Vite)
- [x] 테스트 실행 가능
- [x] Solana devnet 연결 가능

---

## 🆘 문제 해결

### WSL Ubuntu 명령어가 실행되지 않음
```bash
# ❌ 잘못된 방법
wsl -d Ubuntu -e bash -c "anchor --version"

# ✅ 올바른 방법 (login shell 필수)
wsl -d Ubuntu -e bash -l -c "anchor --version"
```

### Yarn 권한 문제
```bash
# ❌ 문제: yarn install 실패
anchor init vault_program

# ✅ 해결: npm 지정
anchor init vault_program --package-manager npm
```

### 환경 변수 로드 안 됨
```bash
# ~/.bashrc 확인
cat ~/.bashrc | grep cargo

# 파일 다시 소싱
source ~/.bashrc
```

---

## 📚 참고 문서

| 문서 | 위치 | 설명 |
|------|------|------|
| **프로젝트 구조** | `PROJECT_STRUCTURE_CLARIFICATION.md` | 전체 프로젝트 역할 및 파일 구조 |
| **환경 상태** | `ENVIRONMENT_STATUS.md` | 설치된 도구 상태 |
| **Phase 4 완료 리포트** | `Docs/02_ToDo/done_PHASE_4_COMPLETE_FINAL_REPORT.md` | Phase 4 작업 완료 내용 |
| **시작 가이드** | `Docs/02_ToDo/00_START_HERE.md` | 프로젝트 빠른 시작 |

---

## 🔗 유용한 링크

- **Firebase Console**: https://console.firebase.google.com/project/yolosseum-3bebc
- **Solana Explorer**: https://explorer.solana.com/ (devnet 전환)
- **Anchor Docs**: https://docs.rs/anchor-lang/latest/anchor_lang/
- **React 19 Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev

---

**마지막 업데이트**: 2025-11-02
**작성자**: Claude AI
**상태**: 정기적으로 업데이트됨
