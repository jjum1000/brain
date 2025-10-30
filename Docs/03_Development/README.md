# Phase 3 Week 4 - 작업 지시서 완성 가이드

**작성일**: 2025-10-30
**목표**: 구조 파악 및 각 태스크별 상세 작업 지시서 제공
**기간**: 6일 (Day 1-6)

---

## 📚 문서 구조

이 폴더(`Docs/03_Development/`)에는 다음 문서들이 있습니다:

### 1️⃣ **메인 문서**

#### [PHASE3_WEEK4_DETAILED_INSTRUCTION.md](PHASE3_WEEK4_DETAILED_INSTRUCTION.md)
- **목적**: 전체 Project 구조 파악 및 일별 작업 개요
- **포함 내용**:
  - 현재 프로젝트 상태 (완료, 진행중, 미구현)
  - 의존성 및 프로젝트 구조
  - 15개 Task 개요
  - 각 Task별 성공 기준

### 2️⃣ **실행 지시서**

#### [TASK_IMPLEMENTATIONS_DAY1-2.md](TASK_IMPLEMENTATIONS_DAY1-2.md) ✅ **DONE**
- **기간**: Day 1-2 (8-10시간) - **완료됨**
- **포함 Task**: Task 1, Task 2, Task 3
- **완료 상황**:
  - ✅ Task 1: usePortfolio 훅 구현 (src/hooks/usePortfolio.ts 생성)
  - ✅ Task 2: Portfolio 페이지 데이터 연동 (통계 카드 & 투자 목록 추가)
  - ✅ Task 3: Profile 페이지 사용자 정보 동기화 (프로필 정보 확장 & 관심 트레이더 추가)
  - ✅ npm run build 성공 (타입 에러 0)
  - ✅ Git 커밋 완료 (Commit: 302d2cb)

#### [TASK_IMPLEMENTATIONS_DAY3.md](TASK_IMPLEMENTATIONS_DAY3.md) ✅ **DONE**
- **기간**: Day 3 (8-10시간) - **완료됨**
- **포함 Task**: Task 4, Task 5, Task 6
- **완료 상황**:
  - ✅ Task 4: Toast 알림 시스템 구현 (ToastProvider.tsx)
  - ✅ Task 5: 로딩 상태 UI 개선 (Skeletons.tsx)
  - ✅ Task 6: 에러 처리 개선 (errorHandler.ts)
  - ✅ 통합 방법 및 사용 예시 제공
  - ✅ npm run build 성공 (타입 에러 0)
  - ✅ Git 커밋 완료 (Commit: 483d9d3)

#### [TASK_IMPLEMENTATIONS_DAY4_5_6.md](TASK_IMPLEMENTATIONS_DAY4_5_6.md)
- **기간**: Day 4-6 (12-15시간)
- **포함 Task**: Task 7-15
- **현재 상황**: ⏳ **Day 4 진행중**
- **완료된 Task**:
  - ✅ Task 7: 번들 크기 최적화 (코드 스플리팅, Vite 최적화)
  - ✅ Task 8: 이미지 최적화 (OptimizedImage 컴포넌트, SVG 플레이스홀더)
  - ✅ Task 9: Firestore 쿼리 최적화 (limit 50→20 감소)
  - ✅ Git 커밋 완료 (Commit: 825a55b)
- **남은 Task**:
  - ⏳ Task 10: 모바일 반응형 테스트
  - ⏳ Task 11: Lighthouse 성능 검사
  - ⏳ Task 12: 접근성(a11y) 검사
  - ⏳ Task 13: 전체 기능 테스트
  - ⏳ Task 14: Git 최종 커밋
  - ⏳ Task 15: 배포 준비 문서

---

## 🎯 빠른 시작 가이드

### 1단계: 구조 이해하기
```
1. 이 문서 읽기 (README.md)
2. PHASE3_WEEK4_DETAILED_INSTRUCTION.md 읽기
   - 현재 상태 파악
   - Task별 요구사항 이해
```

### 2단계: Day별 구현하기
```
Day 1-2: Task 1-3 구현 ✅ COMPLETED
  → TASK_IMPLEMENTATIONS_DAY1-2.md (참고용)
  → 코드 작성 완료 (Commit: 302d2cb)
  → usePortfolio, Portfolio, Profile 모두 구현됨

Day 3: Task 4-6 구현 (다음 단계)
  → TASK_IMPLEMENTATIONS_DAY3.md 참고
  → Toast 알림 시스템
  → Skeleton 로딩 UI
  → 에러 처리 개선

Day 4-6: Task 7-15 구현
  → TASK_IMPLEMENTATIONS_DAY4_5_6.md 참고
  → 최적화 및 테스트/배포 준비
```

### 3단계: 테스트 및 배포
```
각 Task 완료 후:
1. npm run build - 타입 확인
2. npm run dev - 기능 테스트
3. Lighthouse 검사
4. Git 커밋
```

---

## 📋 각 문서의 사용 방법

### PHASE3_WEEK4_DETAILED_INSTRUCTION.md 사용법

**언제 읽을까?**
- 프로젝트 전체 구조를 이해하고 싶을 때
- Task의 전체 개요를 알고 싶을 때
- 어떤 파일을 수정해야 하는지 알고 싶을 때

**구성**:
```
1. 프로젝트 현황 분석
   - 완료된 항목
   - 부분 완료 항목
   - 미구현 항목

2. 의존성 및 구조
   - 핵심 의존성
   - 파일 구조

3. 일별 작업 계획
   - Day 1-2: 실시간 데이터 동기화 (Task 1-3)
   - Day 3: 사용자 피드백 시스템 (Task 4-6)
   - Day 4: 성능 최적화 (Task 7-9)
   - Day 5: 모바일 테스트 (Task 10-12)
   - Day 6: 최종 점검 (Task 13-15)
```

### TASK_IMPLEMENTATIONS_DAY1-2.md 사용법

**언제 읽을까?**
- Day 1-2에 작업 시작할 때
- Task 1, 2, 3을 직접 구현할 때

**특징**:
- ✅ 전체 코드 포함 (copy-paste 가능)
- ✅ 단계별 설명
- ✅ 주요 구현 포인트
- ✅ 테스트 체크리스트

**구성**:
```
Task 1: usePortfolio 훅
  - 전체 구현 코드
  - 타입 정의
  - Firestore 쿼리
  - 테스트 방법

Task 2: Portfolio 페이지
  - 기존 상태 분석
  - 수정 사항 (Hook 통합)
  - 새로운 카드/테이블 추가
  - 테스트 방법

Task 3: Profile 페이지
  - 사용자 정보 섹션 확장
  - 통계 카드 추가
  - 지갑 주소 기능
  - Form 동기화
```

### TASK_IMPLEMENTATIONS_DAY3.md 사용법

**언제 읽을까?**
- Day 3에 Task 4-6 구현할 때
- Toast, Skeleton, 에러처리 시스템 구축할 때

**특징**:
- ✅ 3개의 완전한 파일 구현
- ✅ 통합 방법 제시
- ✅ 사용 예시 많음
- ✅ 테스트 시나리오

**구성**:
```
Task 4: Toast 알림 시스템
  - ToastProvider 컴포넌트
  - useToast 훅
  - App.tsx 통합
  - 사용 예시

Task 5: Skeleton 로딩 UI
  - Skeletons.tsx (재사용 가능)
  - 각 페이지별 적용
  - 스타일링

Task 6: 에러 처리 개선
  - errorHandler.ts 유틸
  - 에러 메시지 매핑
  - 훅 통합
  - 페이지 사용법
```

### TASK_IMPLEMENTATIONS_DAY4_5_6.md 사용법

**언제 읽을까?**
- Day 4-6에 최적화 및 테스트 진행할 때
- 배포 전 확인사항 확인할 때

**특징**:
- ✅ 성능 최적화 방법론
- ✅ 테스트 프로세스
- ✅ 배포 체크리스트
- ✅ 참고 자료 많음

**구성**:
```
Task 7-9: 성능 최적화
  - 번들 최적화
  - 이미지 최적화
  - 쿼리 최적화

Task 10-12: 모바일/성능/접근성
  - 반응형 테스트
  - Lighthouse 검사
  - a11y 기준

Task 13-15: 최종 점검/배포
  - 전체 기능 테스트
  - Git 커밋 방법
  - 배포 문서 작성
```

---

## ⚡ 빠른 참고

### 파일 위치 매핑

| Task | 파일 | 작업 유형 |
|------|------|---------|
| 1 | `src/hooks/usePortfolio.ts` | 🆕 NEW |
| 2 | `src/components/pages/Portfolio.tsx` | 🔄 UPDATE |
| 3 | `src/components/pages/Profile.tsx` | 🔄 UPDATE |
| 4 | `src/components/Toast/ToastProvider.tsx` | 🆕 NEW |
| 4 | `src/hooks/useToast.ts` | 🔄 UPDATE |
| 4 | `src/App.tsx` | 🔄 UPDATE |
| 5 | `src/components/common/Skeletons.tsx` | 🆕 NEW |
| 6 | `src/lib/errorHandler.ts` | 🆕 NEW |
| 7-9 | `vite.config.ts` 등 | 🔄 UPDATE |
| 10-12 | 테스트 (DevTools) | ✅ TEST |
| 13-15 | `.git`, `Docs/` | 📝 DOC |

### 핵심 개념

#### usePortfolio 훅
- 목적: `/supporters` 컬렉션 실시간 구독
- 반환: investments[], statistics, loading, error
- 계산: totalInvested, activeInvestments, totalROI, 등

#### Toast 시스템
- 목적: 글로벌 알림 관리
- 사용: `const { addToast } = useToast()`
- 타입: success, error, warning, info

#### Skeleton UI
- 목적: 로딩 중 플레이스홀더 표시
- 컴포넌트: StatsSkeleton, TableSkeleton, CardGridSkeleton
- 적용: 모든 페이지의 로딩 상태

#### 에러 처리
- 목적: Firebase 에러 → 사용자 친화적 메시지
- 함수: `getErrorMessage(error)`
- 메시지: 한국화된 40+ 에러 메시지

---

## 🎯 성공 기준

### Day 1-2 완료 기준 ✅ **ALL DONE**
```
✅ usePortfolio 훅 구현 및 테스트 (src/hooks/usePortfolio.ts)
✅ Portfolio 페이지 데이터 실시간 표시 (투자 목록 & 통계 카드)
✅ Profile 페이지 사용자 정보 동기화 (프로필 정보 확장)
✅ npm run build 성공 (타입 에러 0)
✅ npm run dev 정상 작동
✅ Git 커밋 완료 (Commit: 302d2cb)

완료 날짜: 2025-10-31 06:07:16 (금요일 오전)
```

### Day 3 완료 기준
```
✅ Toast 알림 시스템 모든 페이지에서 작동
✅ Skeleton 로딩 UI 표시됨
✅ 에러 메시지 사용자 친화적
✅ 통합 테스트 완료
```

### Day 4 완료 기준
```
✅ 번들 크기 < 800KB (↓ 25%)
✅ 이미지 lazy loading 작동
✅ Firestore 쿼리 최적화
✅ npm run build 시간 단축
```

### Day 5 완료 기준
```
✅ 모든 기기에서 반응형 레이아웃
✅ Lighthouse 모든 페이지 > 80점
✅ 접근성 WCAG AA 준수
✅ 모바일 테스트 통과
```

### Day 6 완료 기준
```
✅ 모든 사용자 플로우 테스트 완료
✅ 엣지 케이스 처리 완료
✅ Git 커밋 완료
✅ 배포 문서 작성 완료
```

---

## 📝 작업 프로세스

### 각 Task별 작업 프로세스

```
1. 문서 읽기 (10분)
   └─ 해당 Task 섹션 정독

2. 코드 구현 (1-2시간)
   └─ 문서의 코드 참고하여 구현
   └─ 또는 문서의 코드를 직접 복사

3. 빌드 확인 (5분)
   └─ npm run build
   └─ 타입 에러 확인

4. 개발 서버 실행 (5분)
   └─ npm run dev
   └─ 기능 테스트

5. 체크리스트 확인 (10분)
   └─ Task별 테스트 항목 확인
   └─ 모두 체크되면 완료

6. Git 커밋 (5분)
   └─ 변경사항 추가
   └─ 메시지 작성 및 커밋
```

### 일일 스케줄 예시 (8시간 기준)

**Day 1 오전 (4시간)**
- 08:00-09:00: 문서 읽기 (PHASE3_WEEK4_DETAILED_INSTRUCTION.md)
- 09:00-12:00: Task 1 구현 (usePortfolio.ts)
- 12:00-13:00: 점심

**Day 1 오후 (4시간)**
- 13:00-16:00: Task 2 구현 (Portfolio.tsx 수정)
- 16:00-17:00: Task 3 구현 (Profile.tsx 수정)
- 17:00-18:00: 통합 테스트 및 커밋

**Day 2 (전체)**
- 위와 동일한 진행
- 또는 추가 테스트 및 버그 수정

---

## 🛠️ 개발 도구

### 필수 도구
- Node.js (v18+)
- npm
- VS Code
- Chrome DevTools

### 추천 확장 프로그램
- TypeScript Vue Plugin
- ESLint
- Prettier
- axe DevTools (접근성)
- Lighthouse (성능)

### 명령어 레퍼런스

```bash
# 개발 서버 실행
npm run dev

# 타입 확인
npx tsc -b

# 린트 확인
npm run lint

# 프로덕션 빌드
npm run build

# Lighthouse 검사
npx lighthouse http://localhost:5173/dashboard --view
```

---

## 📚 추가 참고 자료

### Firebase 문서
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

### React 최적화
- [React Docs](https://react.dev)
- [React Performance](https://react.dev/learn/render-and-commit)

### 접근성
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### 성능
- [Web.dev](https://web.dev)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

## ❓ FAQ

### Q: 코드를 처음부터 작성해야 하나요?
**A**: 문서에 전체 코드가 포함되어 있으므로 copy-paste 가능합니다. 이해한 후 수정하며 진행하면 됩니다.

### Q: Task를 건너뛸 수 있나요?
**A**: Task 1-3은 순서대로 진행해야 합니다. Task 4-6도 마찬가지입니다. Task 7-9는 병렬로 진행 가능합니다.

### Q: 빌드 에러가 나면?
**A**: `npm run build` 또는 `npx tsc -b`로 타입 에러를 확인하고 문서의 예시 코드와 비교해주세요.

### Q: 테스트는 어떻게 하나요?
**A**: 각 Task별로 체크리스트가 제공됩니다. `npm run dev`로 개발 서버를 실행한 후 인터랙션을 테스트하면 됩니다.

### Q: Git 커밋은 언제 하나요?
**A**: 각 Task 또는 각 Day별로 커밋하는 것을 권장합니다. Day 6에 최종 커밋 가이드가 제공됩니다.

---

## 🎉 완료 후

### Phase 3 완료 시
- ✅ 모든 15개 Task 완료
- ✅ 번들 크기 최적화 완료
- ✅ 모든 페이지 실시간 동기화
- ✅ Lighthouse 점수 > 80
- ✅ 배포 준비 완료

### 다음 단계 (Phase 4)
- WebSocket 실시간 기능 (3주)
- 테스트 & CI/CD (Phase 5)
- 프로덕션 배포

---

## 📞 문서 요약

| 문서 | 기간 | Task | 시간 | 상태 |
|------|------|------|------|------|
| [PHASE3_WEEK4_DETAILED_INSTRUCTION.md](PHASE3_WEEK4_DETAILED_INSTRUCTION.md) | 전체 | 개요 | 참고용 | 📖 참고 |
| [TASK_IMPLEMENTATIONS_DAY1-2.md](TASK_IMPLEMENTATIONS_DAY1-2.md) | Day 1-2 | 1-3 | 8-10h | ✅ **DONE** |
| [TASK_IMPLEMENTATIONS_DAY3.md](TASK_IMPLEMENTATIONS_DAY3.md) | Day 3 | 4-6 | 8-10h | 📋 예정 |
| [TASK_IMPLEMENTATIONS_DAY4_5_6.md](TASK_IMPLEMENTATIONS_DAY4_5_6.md) | Day 4-6 | 7-15 | 12-15h | 📋 예정 |

---

**작성**: Claude AI
**최종 업데이트**: 2025-10-31 (Day 1-4 진행중)
🎯 **Day 1-4 진행중! 현재 진행 상황: 9/15 Tasks Done**

### 📊 Progress
- ✅ **완료됨**: Task 1-9 (Day 1-4)
  - Day 1-2: 실시간 데이터 동기화 (Task 1-3) ✅
  - Day 3: 사용자 피드백 시스템 (Task 4-6) ✅
  - Day 4: 성능 최적화 (Task 7-9) ✅
- ⏳ **진행중**: Task 10-15 (Day 5-6)
  - Day 5: 모바일/성능/접근성 테스트 (Task 10-12)
  - Day 6: 최종 테스트 및 배포 준비 (Task 13-15)

