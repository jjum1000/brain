# 📚 Phase 3 Week 4 - 태스크 지시서 전체 인덱스

**작성일**: 2025년 10월 30일
**범위**: Phase 3 Week 4 완전 가이드
**상태**: 📌 모든 지시서 준비 완료

---

## 🎯 개요

Phase 3 Week 4는 **최종 완성 및 최적화** 단계입니다.
6일 동안 15개의 태스크를 완료하여 프로덕션 배포 준비를 마칩니다.

### 주요 목표
```
✅ 실시간 데이터 동기화 완벽화
✅ 사용자 피드백 시스템 구현
✅ 성능 최적화 (번들, 이미지, 쿼리)
✅ 모바일 & 접근성 완성
✅ 전체 기능 테스트 및 배포 준비
```

### 성공 기준
```
✅ TypeScript 에러: 0개
✅ 번들 크기: < 800KB
✅ Lighthouse: > 80 (모든 페이지)
✅ 모바일 반응형: 100%
✅ 접근성(a11y): WCAG AA
```

---

## 📋 전체 태스크 구조

```
Phase 3 Week 4 (6일)
│
├─ Day 1-2: 실시간 데이터 동기화 완성
│  ├─ Task 1: usePortfolio 훅 구현
│  ├─ Task 2: Portfolio 페이지 데이터 연동
│  └─ Task 3: Profile 페이지 사용자 정보 동기화
│
├─ Day 3: 사용자 피드백 시스템 구현
│  ├─ Task 4: Toast 알림 시스템
│  ├─ Task 5: 로딩 상태 UI 개선
│  └─ Task 6: 에러 처리 개선
│
├─ Day 4: 성능 최적화
│  ├─ Task 7: 번들 크기 최적화
│  ├─ Task 8: 이미지 최적화
│  └─ Task 9: 쿼리 최적화
│
├─ Day 5: 모바일 & 접근성 완성
│  ├─ Task 10: 모바일 반응형 테스트
│  ├─ Task 11: Lighthouse 성능 검사
│  └─ Task 12: 접근성(a11y) 검사
│
└─ Day 6: 최종 점검 및 배포 준비
   ├─ Task 13: 전체 기능 테스트
   ├─ Task 14: Git 커밋 및 정리
   └─ Task 15: 배포 준비 문서화
```

---

## 📄 지시서 파일 목록

### 1️⃣ Day 1-2 실시간 데이터 동기화
📌 **파일**: `TASK_INSTRUCTIONS_DAY1-2.md`

**작업 내용**:
- usePortfolio 훅 구현 (신규)
- Portfolio 페이지 실시간 데이터 연동
- Profile 페이지 사용자 정보 동기화

**예상 시간**: 2일
**난이도**: ⭐⭐⭐
**필수 파일**:
- `src/hooks/usePortfolio.ts` (NEW)
- `src/components/pages/Portfolio.tsx` (UPDATE)
- `src/components/pages/Profile.tsx` (UPDATE)

**주요 체크리스트**:
- [ ] usePortfolio 훅 구현 완료
- [ ] Firestore onSnapshot 구독 작동
- [ ] Portfolio 페이지 실시간 업데이트
- [ ] Profile 페이지 사용자 정보 표시
- [ ] 로딩/에러 상태 처리
- [ ] TypeScript 에러 0개

---

### 2️⃣ Day 3 사용자 피드백 시스템
📌 **파일**: `TASK_INSTRUCTIONS_DAY3.md`

**작업 내용**:
- Toast 알림 시스템 (Context API)
- 로딩 상태 UI (Skeleton)
- 에러 처리 개선 (사용자 친화적)

**예상 시간**: 1일
**난이도**: ⭐⭐⭐
**필수 파일**:
- `src/contexts/ToastContext.tsx` (NEW)
- `src/hooks/useToast.ts` (NEW)
- `src/components/Toast/Toast.tsx` (NEW)
- `src/components/Toast/ToastContainer.tsx` (NEW)
- `src/utils/errorHandler.ts` (NEW)
- `src/components/common/ErrorBoundary.tsx` (NEW)
- 모든 페이지 (UPDATE - 로딩/에러 UI)

**주요 체크리스트**:
- [ ] Toast 알림 시스템 완성
- [ ] 4가지 타입 스타일 적용 (success, error, warning, info)
- [ ] 자동 닫기 기능 (3초)
- [ ] 모든 페이지에 Skeleton 적용
- [ ] 에러 핸들러 완성
- [ ] 모든 에러 메시지 한국화

---

### 3️⃣ Day 4 성능 최적화
📌 **파일**: `TASK_INSTRUCTIONS_DAY4.md`

**작업 내용**:
- 번들 크기 최적화 (< 800KB)
- 이미지 최적화 (WebP, Lazy Loading)
- 쿼리 최적화 (Firestore 인덱싱)

**예상 시간**: 1일
**난이도**: ⭐⭐⭐⭐
**필수 파일**:
- `vite.config.ts` (UPDATE)
- `src/components/common/OptimizedImage.tsx` (NEW)
- `src/hooks/useTraders.ts` (OPTIMIZE)
- `src/hooks/useStrategies.ts` (OPTIMIZE)

**주요 체크리스트**:
- [ ] 번들 크기 < 800KB 달성
- [ ] Tree shaking 설정 완료
- [ ] 동적 import (코드 스플리팅) 적용
- [ ] WebP 이미지 변환 완료
- [ ] Firestore 인덱싱 설정 (4개)
- [ ] 페이지네이션 구현
- [ ] 메모리 누수 제거

---

### 4️⃣ Day 5 모바일 & 접근성 완성
📌 **파일**: `TASK_INSTRUCTIONS_DAY5.md`

**작업 내용**:
- 모바일 반응형 테스트 (3개 기기)
- Lighthouse 성능 검사 (> 80점)
- 접근성(a11y) 검사 (WCAG AA)

**예상 시간**: 1일
**난이도**: ⭐⭐⭐
**테스트 도구**:
- Chrome DevTools (Device Toolbar)
- Lighthouse
- NVDA (스크린 리더)
- axe DevTools

**주요 체크리스트**:
- [ ] 3개 이상 모바일 기기에서 테스트
- [ ] 모든 페이지 Lighthouse > 80
- [ ] 모든 페이지 Accessibility > 90
- [ ] 색상 대비 WCAG AA
- [ ] 키보드 네비게이션 완벽
- [ ] 포커스 가시성 명확

---

### 5️⃣ Day 6 최종 점검 및 배포 준비
📌 **파일**: `TASK_INSTRUCTIONS_DAY6.md`

**작업 내용**:
- 전체 기능 엔드-투-엔드 테스트
- 엣지 케이스 처리 및 버그 수정
- Git 커밋 및 배포 문서 작성

**예상 시간**: 2일
**난이도**: ⭐⭐⭐
**생성할 문서**:
- `DEPLOYMENT_CHECKLIST.md`
- `USER_MANUAL.md`
- `TROUBLESHOOTING.md`
- `CHANGELOG.md`

**주요 체크리스트**:
- [ ] 5개 주요 사용자 플로우 테스트
- [ ] 10개 엣지 케이스 테스트
- [ ] 모든 발견 버그 수정
- [ ] Git 커밋 완료
- [ ] 배포 문서 4개 작성

---

## 🗺️ 빠른 참조 가이드

### 파일별 작업 목록

```
usePortfolio 구현
↓
TASK_INSTRUCTIONS_DAY1-2.md → src/hooks/usePortfolio.ts
                          → src/components/pages/Portfolio.tsx
                          → src/components/pages/Profile.tsx

Toast 시스템 구현
↓
TASK_INSTRUCTIONS_DAY3.md → src/contexts/ToastContext.tsx
                        → src/hooks/useToast.ts
                        → src/components/Toast/
                        → src/utils/errorHandler.ts

성능 최적화
↓
TASK_INSTRUCTIONS_DAY4.md → vite.config.ts
                        → src/components/common/OptimizedImage.tsx
                        → src/hooks/useTraders.ts
                        → src/hooks/useStrategies.ts

모바일 & 접근성
↓
TASK_INSTRUCTIONS_DAY5.md → Chrome DevTools 테스트
                        → Lighthouse 검사
                        → ARIA 라벨 추가
                        → PERFORMANCE_REPORT.md 작성

최종 점검 & 배포
↓
TASK_INSTRUCTIONS_DAY6.md → 전체 기능 테스트
                        → Git 커밋
                        → 배포 문서 4개 작성
```

---

## ⚙️ 개발 환경 준비

### 필수 도구
```bash
# Node.js & npm 확인
node --version  # v18.0.0 이상
npm --version   # 8.0.0 이상

# 필수 패키지 확인
npm list react firebase react-router-dom

# 개발 서버 실행
npm run dev

# 빌드 테스트
npm run build

# TypeScript 체크
npx tsc --noEmit
```

### 브라우저 확장 (권장)
- React Developer Tools
- Firebase Extension
- Lighthouse
- axe DevTools

### 서비스 설정
```
✅ Google Cloud Project 설정
✅ Firebase Project 설정
✅ Firestore 데이터베이스 설정
✅ Authentication (Google 로그인) 설정
✅ Hosting 설정
```

---

## 📊 진도 추적 시트

각 지시서를 진행하면서 아래 체크리스트를 업데이트하세요:

```markdown
## Phase 3 Week 4 진도 추적

### Day 1-2: 실시간 데이터 동기화
- [ ] Task 1: usePortfolio 훅 (0% → 100%)
- [ ] Task 2: Portfolio 페이지 (0% → 100%)
- [ ] Task 3: Profile 페이지 (0% → 100%)
- [ ] 테스트 완료
- [ ] Git 커밋

### Day 3: 사용자 피드백
- [ ] Task 4: Toast 시스템 (0% → 100%)
- [ ] Task 5: 로딩 UI (0% → 100%)
- [ ] Task 6: 에러 처리 (0% → 100%)
- [ ] 테스트 완료
- [ ] Git 커밋

### Day 4: 성능 최적화
- [ ] Task 7: 번들 최적화 (0% → 100%)
- [ ] Task 8: 이미지 최적화 (0% → 100%)
- [ ] Task 9: 쿼리 최적화 (0% → 100%)
- [ ] 성능 측정
- [ ] Git 커밋

### Day 5: 모바일 & 접근성
- [ ] Task 10: 모바일 테스트 (0% → 100%)
- [ ] Task 11: Lighthouse (0% → 100%)
- [ ] Task 12: 접근성 (0% → 100%)
- [ ] 성능 리포트 작성
- [ ] Git 커밋

### Day 6: 최종 점검 & 배포
- [ ] Task 13: 기능 테스트 (0% → 100%)
- [ ] Task 14: Git 커밋 (0% → 100%)
- [ ] Task 15: 배포 문서 (0% → 100%)
- [ ] 배포 준비 완료

### 최종 통계
- [ ] TypeScript 에러: 0개
- [ ] 번들 크기: < 800KB
- [ ] Lighthouse: > 80점
- [ ] 모바일: 완벽
- [ ] 접근성: WCAG AA
```

---

## 🔗 관련 문서

### Week 4 메인 계획
- `todo_PHASE3_WEEK4_ACTION_PLAN.md` - 전체 Week 4 계획

### 완료된 Phase 3 부분
- `done_PHASE3_DETAILED_PLAN_UPDATE.md` - Week 1-3 상세 계획
- `done_PHASE3_QUICK_START.md` - Phase 3 빠른 시작

### Firebase 관련
- `archived_FIREBASE_PHASE2_COMPLETION.md` - Firebase Phase 2 상태

---

## 💡 핵심 팁

### Task 선택 기준
```
❌ 처음부터 모든 Task를 동시에 하지 마세요
✅ Day 1-2부터 순차적으로 진행하세요
✅ 각 Task 완료 후 테스트를 거쳐야 합니다
✅ 문제가 생기면 그 Task에 집중해서 해결하세요
```

### 빠른 개발 팁
```bash
# 1. 개발 서버 켜두기
npm run dev

# 2. 다른 터미널에서 빌드 모니터링
npm run build  # 또는 watch mode

# 3. TypeScript 에러 실시간 확인
npx tsc --noEmit --watch

# 4. 변경 저장 시 브라우저 자동 새로고침 (Vite)
```

### 문제 해결
```
문제 발생 → 해당 Task 지시서 확인
          → 체크리스트 재검토
          → DevTools Console 에러 확인
          → 로컬 수정 후 테스트
          → 문제 해결 후 다음 Task로 진행
```

---

## 🚀 배포 후 순서

1. **Day 6 완료**: 모든 Task 완료 및 Git 커밋
2. **빌드**: `npm run build`
3. **배포**: `firebase deploy --only hosting`
4. **검증**: 배포된 사이트 확인
5. **모니터링**: Firebase Analytics/Crashlytics 설정

---

## 📞 필요한 경우

### 리소스 확인
- `README.md` - 프로젝트 개요
- `package.json` - 패키지 정보
- `.env.example` - 환경 변수 템플릿

### 외부 문서
- [React 공식 문서](https://react.dev)
- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Tailwind CSS 문서](https://tailwindcss.com)
- [shadcn/ui 문서](https://ui.shadcn.com)

---

## ✅ 최종 체크리스트

```
📋 지시서 확인
├─ [✅] TASK_INSTRUCTIONS_DAY1-2.md
├─ [✅] TASK_INSTRUCTIONS_DAY3.md
├─ [✅] TASK_INSTRUCTIONS_DAY4.md
├─ [✅] TASK_INSTRUCTIONS_DAY5.md
├─ [✅] TASK_INSTRUCTIONS_DAY6.md
└─ [✅] TASK_INSTRUCTIONS_INDEX.md (이 파일)

🎯 준비 완료
├─ [✅] 개발 환경 설정
├─ [✅] Git 저장소 준비
├─ [✅] Firebase 설정
└─ [✅] 브라우저 확장 설치

🚀 시작할 준비됨
├─ [✅] Day 1-2 지시서 읽음
├─ [✅] 환경 확인
├─ [✅] 개발 서버 준비
└─ [✅] Task 1부터 시작 가능
```

---

## 🎉 마지막 말씀

이 지시서들은 Phase 3 Week 4를 체계적으로 완료하기 위해 상세하게 작성되었습니다.

**핵심 원칙:**
1. **순차적 진행**: Day 1 → Day 6 순서대로
2. **완벽한 완료**: 각 Task 100% 완료 후 다음으로
3. **테스트**: 각 Task마다 체크리스트 확인
4. **문서화**: 과정 중간중간 진도 기록
5. **품질**: TypeScript 에러 0, 성능 최적화 완벽

**성공의 열쇠:**
- ⏰ 일정 준수
- ✅ 체크리스트 정확히 따르기
- 🧪 충분한 테스트
- 📝 진행 상황 기록
- 💬 문제 발생 시 즉시 해결

**목표:**
```
2025년 11월 6일 Phase 3 완벽 완성
↓
배포 준비 100% 완료
↓
프로덕션 배포 성공! 🚀
```

---

**작성 완료**: 2025년 10월 30일
**버전**: 1.0 (완성)
**상태**: 📌 모든 지시서 준비 완료

🎯 **Phase 3 Week 4를 성공적으로 완료하자!**

---

## 📞 지시서 사용 방법

### 처음 시작할 때
1. 이 파일(`TASK_INSTRUCTIONS_INDEX.md`)을 먼저 읽으세요
2. 개발 환경이 준비되어 있는지 확인하세요
3. `TASK_INSTRUCTIONS_DAY1-2.md`를 열고 Task 1부터 시작하세요

### 매일 시작할 때
1. 해당 Day 지시서를 엽니다
2. 완료할 Task를 확인합니다
3. 각 Task의 체크리스트를 따릅니다
4. 완료 후 다음 Task로 넘어갑니다

### 진행 중 참고할 때
1. 명확하지 않은 부분은 지시서의 "💡 개발 팁" 섹션 확인
2. 에러 발생 시 해당 Task의 "🧪 테스트 체크리스트" 확인
3. 문제 해결 후 다시 진행

### 완료 후
1. Git 커밋하기
2. 다음 Day 지시서로 진행
3. 진도를 이 파일의 "📊 진도 추적 시트"에 기록

---

**준비 완료! Day 1-2를 시작하세요! 🚀**
