# 📋 Day 5: 모바일 테스트 및 반응형 완성 - 작업 지시서

**작업 기간**: 2025년 11월 4일
**상태**: 📌 준비 완료
**목표**: 모든 기기에서 완벽한 반응형 디자인 및 접근성 달성

---

## 🎯 Day 5 목표

```
✅ 모바일 반응형 테스트 (3개 기기 유형)
✅ Lighthouse 성능 점수 > 80 달성
✅ WCAG 접근성(a11y) 기준 충족
✅ 최종 성능 메트릭 문서화
```

---

## 📌 Task 10: 모바일 반응형 테스트

### 작업 위치
```
모든 페이지: Dashboard, Leaderboard, Traders, Strategies, Portfolio, Profile
상태: TESTING
```

### 작업 세부사항

#### 10-1. 테스트 기기 및 해상도

```
✅ Task 10-1: 테스트할 기기 해상도

1. 모바일 (320px ~ 480px)
   ├─ iPhone 12 Pro: 390 x 844px
   ├─ iPhone 14: 390 x 932px
   └─ Samsung Galaxy S21: 360 x 800px

2. 태블릿 (481px ~ 768px)
   ├─ iPad (7세대): 768 x 1024px
   └─ Surface Go: 600 x 800px

3. 데스크톱 (769px 이상)
   ├─ Laptop: 1366 x 768px
   └─ Desktop: 1920 x 1080px
```

#### 10-2. Chrome DevTools 모바일 에뮬레이션

```bash
# ✅ Task 10-2-A: Chrome DevTools 열기
1. 브라우저에서 F12 또는 Ctrl+Shift+I
2. Device Toolbar 클릭 (또는 Ctrl+Shift+M)
3. 기기 선택: iPhone 12 Pro, Galaxy S21, iPad

# ✅ Task 10-2-B: 각 페이지 테스트
```

#### 10-3. 반응형 체크리스트

```typescript
// 각 페이지에서 다음 항목 확인

✅ Task 10-3: 모바일 반응형 테스트 항목

[ ] 레이아웃
    [ ] 화면 너비에 맞는 레이아웃 (스크롤 없음)
    [ ] 텍스트 오버플로우 없음
    [ ] 이미지 적절한 크기로 표시

[ ] 텍스트 & 가독성
    [ ] 최소 16px 이상의 폰트 크기
    [ ] 줄 간격 적절 (1.5 이상)
    [ ] 컬러 대비 충분 (WCAG AA)

[ ] 버튼 & 터치 영역
    [ ] 터치 영역 최소 44x44px
    [ ] 버튼 간 충분한 공간 (최소 8px)
    [ ] 터치 타겟이 겹치지 않음

[ ] 네비게이션
    [ ] 모바일 네비게이션 메뉴 표시
    [ ] 햄버거 메뉴 작동 확인
    [ ] 탭 또는 링크 클릭 가능

[ ] 입력 필드
    [ ] 모바일 키보드 타입 적절 (email, number, tel)
    [ ] 입력 필드 크기 적절
    [ ] 포커스 표시 명확

[ ] 모달 & 드롭다운
    [ ] 모달이 화면에 맞음
    [ ] 드롭다운 위치 적절
    [ ] 닫기 버튼 접근 가능

[ ] 스크롤 & 성능
    [ ] 부드러운 스크롤
    [ ] 무한 스크롤 작동
    [ ] 렉 없는 인터랙션
```

#### 10-4. 페이지별 테스트 상세

```typescript
// Dashboard 페이지
[ ] 통계 카드 세로 정렬 (320px)
[ ] 그래프 화면 너비에 맞음
[ ] 네비게이션 모바일 메뉴로 표시

// Leaderboard 페이지
[ ] 테이블이 스크롤 가능한 카드로 변환 (또는 수평 스크롤)
[ ] 순위, 이름, ROI 모두 표시됨
[ ] 필터 UI 모바일 친화적

// Traders 페이지
[ ] 카드가 세로로 1개 열로 표시
[ ] 각 카드 폭이 화면에 맞음
[ ] 프로필 이미지 비율 유지

// Strategies 페이지
[ ] 전략 카드 1-2개 열로 표시
[ ] 퍼포먼스 차트 화면에 맞음
[ ] 상세 정보 모달 화면에 맞음

// Portfolio 페이지
[ ] 통계 카드 세로 정렬
[ ] 투자 목록 테이블 스크롤 가능
[ ] 추가/삭제 버튼 접근 가능

// Profile 페이지
[ ] 프로필 헤더 세로 정렬
[ ] 통계 카드 세로 정렬
[ ] 팔로우 트레이더 목록 세로 정렬
```

### 체크리스트 - Task 10

- [ ] Chrome DevTools에서 3개 이상 모바일 기기 테스트
- [ ] 모든 페이지 레이아웃 확인
- [ ] 모든 텍스트 가독성 확인
- [ ] 모든 버튼/링크 터치 영역 44x44px 이상 확인
- [ ] 모든 네비게이션 모바일 호환성 확인
- [ ] 모든 입력 필드 모바일 호환성 확인
- [ ] 모든 모달/드롭다운 위치 확인
- [ ] 스크롤 및 성능 확인
- [ ] 문제점 발견 시 수정

---

## 📌 Task 11: Lighthouse 성능 검사

### 작업 위치
```
모든 주요 페이지: Dashboard, Leaderboard, Traders, Portfolio
상태: TESTING & OPTIMIZATION
```

### 작업 세부사항

#### 11-1. Lighthouse 실행 방법

```bash
# ✅ Task 11-1: Chrome DevTools Lighthouse 실행

1. 개발 서버 실행
   npm run dev

2. Chrome 열기 → http://localhost:5173

3. DevTools 열기 (F12)

4. Lighthouse 탭 클릭
   - Device: Mobile (모바일 테스트 권장)
   - Categories: 모두 선택
   - Run Lighthouse 클릭

5. 결과 대기 (2-3분)

6. 점수 확인:
   Performance:     > 80
   Accessibility:   > 90
   Best Practices:  > 90
   SEO:            > 80
```

#### 11-2. 성능 메트릭 해석

```
✅ Task 11-2: Lighthouse 핵심 메트릭

1. Core Web Vitals
   ├─ LCP (Largest Contentful Paint) < 2.5s
   │  (가장 큰 콘텐츠 칠하기 시간)
   │  → 이미지, 텍스트 블록 로드 시간
   │
   ├─ FID (First Input Delay) < 100ms
   │  (첫 입력 지연 시간)
   │  → 사용자가 버튼 클릭 후 반응까지 시간
   │
   └─ CLS (Cumulative Layout Shift) < 0.1
      (누적 레이아웃 이동)
      → 페이지 로드 중 요소 이동 정도
```

#### 11-3. Lighthouse 개선 전략

```typescript
// ✅ Task 11-3-A: LCP (Largest Contentful Paint) 개선

// 1. 이미지 최적화
<img src="image.webp" loading="lazy" />

// 2. 폰트 최적화
@font-face {
  font-display: swap; // FOIT 방지
}

// 3. 코드 스플리팅
const Dashboard = React.lazy(() => import('./Dashboard'));

// 4. 서버 응답 시간 개선
// - Firestore 쿼리 최적화
// - 필요한 필드만 로드
```

```typescript
// ✅ Task 11-3-B: FID (First Input Delay) 개선

// 1. Long Tasks 분해
// ❌ 나쁜 예
function handleClick() {
  // 500ms 걸리는 작업
  heavyCalculation();
}

// ✅ 좋은 예
function handleClick() {
  // 메인 스레드 블로킹 방지
  setTimeout(() => heavyCalculation(), 0);
}

// 2. 이벤트 위임
// ✅ 좋은 예 (리스너 수 최소화)
<ul onClick={handleItemClick}>
  {items.map(item => <li key={item.id}>{item.name}</li>)}
</ul>
```

```typescript
// ✅ Task 11-3-C: CLS (Cumulative Layout Shift) 개선

// 1. 레이아웃 안정화
// ❌ 나쁜 예 (로드 후 크기 변함)
<img src="image.jpg" />

// ✅ 좋은 예 (크기 사전 설정)
<img src="image.jpg" width="200" height="200" />

// 2. 동적 콘텐츠
// ❌ 나쁜 예 (로드 후 레이아웃 변함)
{isLoading && <Skeleton />}
{!isLoading && <Content />}

// ✅ 좋은 예 (높이 사전 설정)
<div style={{ minHeight: '200px' }}>
  {isLoading ? <Skeleton /> : <Content />}
</div>
```

#### 11-4. 페이지별 Lighthouse 검사

```bash
# ✅ Task 11-4: 각 페이지 Lighthouse 점수 기록

Dashboard:
- Performance: [점수]
- Accessibility: [점수]
- Best Practices: [점수]
- SEO: [점수]

Leaderboard:
- Performance: [점수]
- Accessibility: [점수]
- Best Practices: [점수]
- SEO: [점수]

Traders:
- Performance: [점수]
- Accessibility: [점수]
- Best Practices: [점수]
- SEO: [점수]

Portfolio:
- Performance: [점수]
- Accessibility: [점수]
- Best Practices: [점수]
- SEO: [점수]
```

### 체크리스트 - Task 11

- [ ] 각 주요 페이지 Lighthouse 검사 실행
- [ ] Performance 점수 > 80 달성
- [ ] Accessibility 점수 > 90 달성
- [ ] Best Practices 점수 > 90 달성
- [ ] SEO 점수 > 80 달성
- [ ] Core Web Vitals 메트릭 확인
- [ ] 성능 문제 발견 시 개선
- [ ] 성능 결과 스크린샷 저장

---

## 📌 Task 12: 접근성(a11y) 검사

### 작업 위치
```
모든 페이지
상태: TESTING & OPTIMIZATION
```

### 작업 세부사항

#### 12-1. 색상 대비 검사 (WCAG AA)

```bash
# ✅ Task 12-1: Lighthouse 접근성 탭 확인

1. DevTools > Lighthouse > Accessibility
2. "Color and contrast" 섹션 확인
3. WCAG AA 이상 달성 (비율 4.5:1 이상)

도구:
- https://webaim.org/resources/contrastchecker/
- Chrome DevTools Inspector (color picker)
```

#### 12-2. 키보드 네비게이션

```typescript
// ✅ Task 12-2: 키보드로 모든 기능 접근 가능 확인

테스트 항목:
[ ] Tab 키로 모든 버튼 이동
[ ] Enter 키로 버튼 클릭
[ ] Escape 키로 모달 닫기
[ ] 포커스 순서 논리적
[ ] Tab 순환 (마지막 요소 다음 첫 요소로 이동)

테스트 방법:
1. 페이지 열기
2. Tab 키 반복 누르기
3. 포커스 이동 확인
4. Enter로 버튼 클릭 가능 확인
5. 모든 기능이 마우스 없이 작동하는지 확인
```

#### 12-3. 스크린 리더 지원

```typescript
// ✅ Task 12-3: ARIA 라벨 및 시맨틱 HTML

// 1. 적절한 heading 레벨
<h1>트레이더 목록</h1>
<h2>인기 트레이더</h2>
<h3>상세 정보</h3>

// 2. 의미 있는 링크 텍스트
// ❌ 나쁜 예
<a href="/traders">여기</a>를 클릭하세요

// ✅ 좋은 예
<a href="/traders">인기 트레이더 목록 보기</a>

// 3. 버튼 라벨
// ❌ 나쁜 예
<button>+</button>

// ✅ 좋은 예
<button aria-label="전략 추가">+</button>

// 4. 폼 라벨
// ❌ 나쁜 예
<input type="email" />

// ✅ 좋은 예
<label htmlFor="email">이메일</label>
<input id="email" type="email" />

// 5. 아이콘 버튼
// ❌ 나쁜 예
<button><IconSearch /></button>

// ✅ 좋은 예
<button aria-label="검색">
  <IconSearch />
</button>

// 6. 대체 텍스트 (alt text)
<img src="trader.jpg" alt="트레이더 프로필 사진: John Doe" />
```

#### 12-4. 스크린 리더 도구 사용

```bash
# ✅ Task 12-4: 스크린 리더로 테스트

도구 (Windows):
- NVDA (무료): https://www.nvaccess.org/

도구 (macOS):
- VoiceOver (기본): Cmd + F5

도구 (모든 OS):
- Chrome DevTools Accessibility audit

테스트 방법:
1. NVDA 설치 및 실행
2. 페이지 방문
3. 음성 출력 확인
4. 모든 콘텐츠가 음성으로 읽혀지는지 확인
5. 네비게이션 순서가 논리적인지 확인
```

#### 12-5. 포커스 가시성

```typescript
// ✅ Task 12-5: 포커스 표시 개선

// tailwind.css
@layer base {
  @layer utilities {
    .focus-ring {
      @apply outline-none ring-2 ring-blue-500 ring-offset-2;
    }
  }
}

// 모든 인터랙티브 요소
<button className="focus-ring">버튼</button>
<a href="#" className="focus-ring">링크</a>
<input className="focus-ring" />

// 포커스 상태 확인
// Tab 키로 이동할 때 파란색 테두리 표시되어야 함
```

### 체크리스트 - Task 12

- [ ] 모든 텍스트 색상 대비 WCAG AA 이상 달성
- [ ] Tab 키로 모든 버튼 이동 가능 확인
- [ ] 모든 버튼에 ARIA 라벨 추가
- [ ] 모든 이미지에 alt 텍스트 추가
- [ ] 모든 입력 필드에 label 연결
- [ ] 포커스 표시 명확함
- [ ] heading 레벨 논리적 (h1 > h2 > h3)
- [ ] 스크린 리더 Lighthouse 점수 > 90
- [ ] 실제 스크린 리더(NVDA)로 테스트

---

## 📊 최종 성능 메트릭 문서화

### PERFORMANCE_REPORT.md 작성

```markdown
# 성능 최적화 보고서

## 최적화 전/후 비교

### 1. 번들 크기
- 최적화 전: 889 KB (gzipped: 235 KB)
- 최적화 후: [측정값] KB (gzipped: [측정값] KB)
- 개선율: [%]

### 2. 로딩 시간
| 페이지 | 최적화 전 | 최적화 후 | 개선율 |
|--------|---------|---------|-------|
| Dashboard | - | - | - |
| Leaderboard | - | - | - |
| Traders | - | - | - |
| Portfolio | - | - | - |

### 3. Lighthouse 점수
| 페이지 | Performance | Accessibility | Best Practices | SEO |
|--------|-------------|----------------|----------------|-----|
| Dashboard | - | - | - | - |
| Leaderboard | - | - | - | - |
| Traders | - | - | - | - |
| Portfolio | - | - | - | - |

### 4. Core Web Vitals
| 메트릭 | 값 | 상태 |
|--------|-----|------|
| LCP (2.5s 이하) | - | ✅/❌ |
| FID (100ms 이하) | - | ✅/❌ |
| CLS (0.1 이하) | - | ✅/❌ |

### 5. 모바일 반응형
- ✅ iPhone (390px)
- ✅ Galaxy S21 (360px)
- ✅ iPad (768px)
- ✅ Desktop (1920px)

### 6. 접근성 (a11y)
- ✅ 색상 대비: WCAG AA
- ✅ 키보드 네비게이션: 완벽
- ✅ 스크린 리더: 지원
- ✅ Lighthouse a11y: > 90
```

### 체크리스트 - 성능 메트릭

- [ ] 모든 번들 크기 측정
- [ ] 모든 페이지 Lighthouse 점수 기록
- [ ] Core Web Vitals 메트릭 측정
- [ ] 모바일 기기별 테스트 기록
- [ ] 접근성 테스트 결과 기록
- [ ] PERFORMANCE_REPORT.md 작성

---

## 🧪 최종 테스트 체크리스트 - Day 5

### 모바일 반응형 테스트 ✅
- [ ] iPhone 12 Pro (390px) - 모든 페이지 테스트
- [ ] Galaxy S21 (360px) - 모든 페이지 테스트
- [ ] iPad (768px) - 모든 페이지 테스트
- [ ] 이미지 표시 확인
- [ ] 텍스트 가독성 확인
- [ ] 버튼 터치 영역 충분함
- [ ] 스크롤 부드러움
- [ ] 성능 양호 (렉 없음)

### Lighthouse 성능 검사 ✅
- [ ] Dashboard: Performance > 80
- [ ] Dashboard: Accessibility > 90
- [ ] Leaderboard: Performance > 80
- [ ] Leaderboard: Accessibility > 90
- [ ] Traders: Performance > 80
- [ ] Traders: Accessibility > 90
- [ ] Portfolio: Performance > 80
- [ ] Portfolio: Accessibility > 90

### 접근성 (a11y) 검사 ✅
- [ ] 색상 대비: WCAG AA 이상
- [ ] Tab 키 네비게이션: 모든 요소 접근 가능
- [ ] ARIA 라벨: 모든 버튼 설정
- [ ] Alt 텍스트: 모든 이미지 설정
- [ ] Label: 모든 입력 필드 연결
- [ ] 포커스: 표시 명확함
- [ ] Heading: 순서 논리적
- [ ] 스크린 리더: 모든 콘텐츠 읽혀짐

---

## 📝 완료 체크리스트 - Day 5

### Task 10 완료 시
- [ ] 3개 이상 모바일 기기에서 테스트
- [ ] 모든 페이지 레이아웃 확인
- [ ] 모든 텍스트 가독성 확인
- [ ] 모든 버튼 터치 영역 확인
- [ ] 네비게이션 모바일 호환성 확인
- [ ] 스크롤 및 성능 확인

### Task 11 완료 시
- [ ] 각 주요 페이지 Lighthouse 검사
- [ ] Performance > 80
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] SEO > 80
- [ ] Core Web Vitals 측정

### Task 12 완료 시
- [ ] 색상 대비 검사 완료
- [ ] 키보드 네비게이션 테스트 완료
- [ ] ARIA 라벨 추가
- [ ] Alt 텍스트 추가
- [ ] 포커스 가시성 개선
- [ ] 스크린 리더 호환성 확인

### Day 5 최종 완료
- [ ] 모든 기기에서 완벽한 반응형
- [ ] Lighthouse 모든 점수 > 80
- [ ] WCAG 접근성 기준 충족
- [ ] PERFORMANCE_REPORT.md 작성
- [ ] TypeScript 컴파일 에러 0개
- [ ] Git 커밋 완료

---

## 💡 개발 팁

### Chrome DevTools 모바일 에뮬레이션 단축키
```
Ctrl+Shift+M (또는 Cmd+Shift+M on Mac)
```

### 빠른 Lighthouse 검사
```
F12 → Lighthouse → Run Lighthouse
(Mobile 선택 권장)
```

### 접근성 확인 팁
```bash
# Lighthouse 접근성 탭 확인 (자동 감사)
# 수동 테스트: Tab 키 반복 누르기
# 스크린 리더: NVDA (무료) 또는 VoiceOver (Mac)
```

---

## 🎯 다음 단계

Day 5 완료 후:
1. ✅ Task 10-12 모두 완료 및 테스트
2. ➡️ Day 6으로 진행: 최종 점검 및 배포 준비
3. 📌 커밋 메시지: `test: Complete Day 5 mobile responsive & a11y testing (Lighthouse > 80, WCAG AA)`

---

**작성일**: 2025년 10월 30일
**예상 완료**: 2025년 11월 4일
**담당자**: 개발팀

🚀 **Day 5를 성공적으로 완료하자!**
