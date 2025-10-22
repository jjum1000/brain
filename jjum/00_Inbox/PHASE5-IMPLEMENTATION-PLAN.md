# Phase 5 구현 계획: Integration & Trigger System

## 📋 개요

설계 논의 요약 문서(`system-design-discussion-summary.md`)의 내용을 구현하는 Phase 5 계획입니다.

**목표:**
- Glossary 자동 관리 시스템 구축
- 참조 횟수 기반 생명주기 관리
- 용어 변경 자동 감지 및 처리
- 인덱스 일관성 보장

**예상 완성일:** 2025-10-25
**담당:** AI Agent System

---

## 🎯 핵심 원칙 (설계 문서에서)

### 1. 역할 분리
- **인간:** `00_Inbox`, `1_Projects` (콘텐츠 생성)
- **LLM:** `5_Glossary` (개념 추출 & 관리)

### 2. Glossary = LLM의 정원
- LLM이 씨앗 심기 (개념 발견 → 파일 생성)
- LLM이 물주기 (참조 발견 → 내용 보강)
- LLM이 잡초 제거 (참조 0 → 삭제/아카이브)

### 3. 생명력 = 참조 횟수
- ripgrep으로 계산 (실시간, 정확)
- `reference_count` 자동 업데이트
- 0회 참조 시 자동 정리

### 4. 파일 시스템 = 진실
- Index는 캐시일 뿐
- Glossary 파일이 진실
- 불일치 발견 시 자동 재빌드

### 5. 간결성 > 완벽성
- 복잡한 동기화 로직 ❌
- 느슨한 일관성 허용 ✅
- 문제 발생 시 재빌드로 해결

---

## 📊 현재 상태 vs 필요한 상태

### 현재 (Phase 4 완료)
```
✅ Glossary Builder (기본 인덱싱)
✅ Glossary 5개 항목
✅ 기본 검색/조회 기능
✅ Filing Rules Engine
❌ Glossary 생성 자동화 (LLM 미사용)
❌ 참조 횟수 계산
❌ 자동 정리 시스템
❌ 용어 변경 감지
❌ Alias 기반 하위 호환성
```

### 필요한 상태 (Phase 5 목표)
```
✅ Glossary Creation Agent (LLM 기반 자동 생성)
✅ Glossary Update Agent (내용 자동 보강)
✅ Reference Counting System (ripgrep 기반)
✅ Glossary Cleanup System (자동 정리)
✅ Term Change Detection (파일 감시)
✅ Alias Support (하위 호환성)
✅ Index Synchronization (파일 검증)
```

---

## 🔧 구현 목록

### Phase 5-1: 참조 횟수 계산 시스템

**파일:** `.obsidian/scripts/glossary-reference-counter.js`

**기능:**
1. ripgrep으로 `[[term]]` 패턴 검색
2. 각 용어별 참조 횟수 계산
3. Glossary 파일의 `reference_count` 업데이트
4. `source_documents` 필드 갱신

**CLI 명령어:**
```bash
node cli.js glossary-usage              # 모든 용어의 참조 횟수 표시
node cli.js glossary-usage --sort-asc   # 참조 횟수 오름차순
node cli.js glossary-usage --zero       # 0회 참조 항목만
```

**출력 예시:**
```
┌─────────────────────────────┬────────────┐
│ Term                        │ References │
├─────────────────────────────┼────────────┤
│ React                       │         15 │
│ Zustand                     │          8 │
│ Closures                    │          3 │
│ JavaScript                  │          5 │
│ Server Components           │          2 │
└─────────────────────────────┴────────────┘
```

**구현 방식:**
```javascript
// Glossary 파일 읽기
// 각 용어(파일명)에 대해 ripgrep 실행
// rg --count "[[Term]]" --type md
// 결과 파일의 frontmatter 업데이트
```

---

### Phase 5-2: Glossary Creation Agent

**파일:** `.obsidian/scripts/agent-modules/glossary-creation-agent.js`

**기능:**
1. 새로운 문서에서 중요 개념 추출 (keyword-extraction-agent 활용)
2. 기존 Glossary와 비교
3. 새로운 개념이면 Glossary 파일 자동 생성
4. LLM을 사용하여 개념 설명 생성

**실행 시점:**
- 새 문서 처리 시 (Pipeline에 추가)
- 또는 정기 스캔 (하루 1회)

**생성되는 파일 구조:**
```yaml
---
title: [개념명]
aliases: []
ai_generated: true
ai_generated_at: 2025-10-23T10:00:00Z
reference_count: 1
source_documents:
  - 00_Inbox/some-file.md
tags: []
related_concepts: []
---

# [개념명]

[LLM이 생성한 정의와 설명]

## 발견된 문맥

[원본 문서에서 추출한 인용구]

## 사용 예시

[LLM이 수집/생성한 코드 예시 (있으면)]
```

**CLI 명령어:**
```bash
node cli.js glossary-create-from <file>    # 특정 파일에서 개념 추출 및 생성
node cli.js glossary-create-batch          # 모든 미처리 파일에서 개념 추출
```

---

### Phase 5-3: Glossary Update Agent

**파일:** `.obsidian/scripts/agent-modules/glossary-update-agent.js`

**기능:**
1. 기존 Glossary 항목 감시
2. 새로운 참조 발견 시 내용 보강
3. `source_documents` 업데이트
4. `reference_count` 갱신

**실행 시점:**
- 참조 횟수 계산 후 (Phase 5-1)
- 새 문서 처리 후

**업데이트 항목:**
```yaml
---
ai_updated_at: 2025-10-23T15:00:00Z
reference_count: [새로운 수]
source_documents: [새로운 참조 문서들]
---
```

---

### Phase 5-4: Glossary Cleanup System

**파일:** `.obsidian/scripts/glossary-cleanup.js`

**기능:**
1. 참조 횟수 0인 항목 감지
2. AI 생성 항목이면 아카이브 (4_Archives/unused-glossary/)
3. 수동 작성 항목이면 사용자 확인 요청
4. 정리 이력 기록

**CLI 명령어:**
```bash
node cli.js glossary-archive-unused           # 0회 참조 항목 아카이브
node cli.js glossary-archive-unused --dry-run # 미리 보기
node cli.js glossary-restore <term>           # 아카이브된 항목 복구
```

**처리 로직:**
```javascript
// 각 Glossary 항목에 대해:
if (referenceCount === 0) {
  if (ai_generated === true) {
    // 자동 아카이브
    moveToArchive();
  } else {
    // 사용자 확인
    askUser();
  }
}
```

---

### Phase 5-5: Term Change Detection & Alias System

**파일:** `.obsidian/scripts/glossary-term-change-detector.js`

**기능:**
1. Projects의 파일 변경 감시
2. 기존 Glossary 용어와 비교
3. 이름 변경 감지 (Keyword Extraction 기반)
4. Alias 자동 추가
5. 기존 링크 유지 (backward compatibility)

**감지 메커니즘:**
```javascript
// 파일 변경 감지 → 키워드 추출 → 기존 Glossary와 비교
// 예: "비트" 용어 존재, 새로 "레인" 키워드 추출
// → 동일 source_document 확인 → 이름 변경 판단
// → aliases: [비트] 추가
```

**생성되는 파일 구조 (변경 후):**
```yaml
---
title: 레인
aliases: [비트, Beat, 주인공]  # 옛날 이름 보존
ai_generated: true
ai_updated_at: 2025-10-22T15:30:00Z

reference_count: 15  # 유지됨
source_documents: [...]

rename_history:
  - from: 비트
    to: 레인
    date: 2025-10-22T15:30:00Z
    reason: "더 세련된 이름으로 변경"
---

# 레인 (구 비트)

[내용...]
```

**Index 업데이트:**
```json
{
  "alias_map": {
    "비트": "5_Glossary/레인.md",  // 하위 호환!
    "레인": "5_Glossary/레인.md"
  }
}
```

**CLI 명령어:**
```bash
node cli.js glossary-rename-links "비트" "레인"  # 명시적 링크 업데이트 (선택적)
```

---

### Phase 5-6: Index Synchronization & Validation

**파일:** `.obsidian/scripts/glossary-index-validator.js`

**기능:**
1. Index와 실제 파일 비교
2. 불일치 항목 감지
3. 파일 존재 검증 (find 메서드에서 사용)
4. 필요 시 자동 재빌드

**검증 로직:**
```javascript
// Index에 있는데 파일 없음 → 인덱스에서 제거
// 파일 있는데 Index에 없음 → 인덱스에 추가
// 기타 불일치 → 경고 및 수정
```

**사용 위치:**
```javascript
// glossary-builder.js의 find() 메서드에 추가
async find(keyword) {
  const filePath = index.title_map[keyword];

  // 🔑 핵심: 항상 파일 존재 확인
  if (!fs.existsSync(filePath)) {
    // Index 재빌드 또는 제거
    await this.rebuildIndex();
    return null;
  }

  return item;
}
```

**자동 동기화 전략 (3단계):**
1. **Level 1:** 실시간 동기화 (File Watcher)
2. **Level 2:** 사용 시 검증 (find 메서드)
3. **Level 3:** 수동 복구 (glossary-build 재실행)

---

## 📅 구현 순서 및 스케줄

### Week 1 (2025-10-23)
- [ ] Phase 5-1: 참조 횟수 계산 시스템
- [ ] Phase 5-2: Glossary Creation Agent (기본)

### Week 2 (2025-10-24)
- [ ] Phase 5-3: Glossary Update Agent
- [ ] Phase 5-4: Glossary Cleanup System

### Week 3 (2025-10-25)
- [ ] Phase 5-5: Term Change Detection & Alias System
- [ ] Phase 5-6: Index Synchronization & Validation
- [ ] 통합 테스트

---

## 🔌 Pipeline 통합

### 기존 Pipeline (Phase 4)
```
Normalization → Keyword Extraction → Linking → Tagging → Filing
```

### 확장된 Pipeline (Phase 5)
```
Normalization → Keyword Extraction → Linking → Tagging → Filing
                          ↓
                 Glossary Creation Agent  ← 새로 추가
                          ↓
                 Glossary Linking Agent   ← 확장
```

### 후처리 (Post-processing)
```
파일 처리 완료 후:
  → Reference Count 계산 (매 문서당)
  → Glossary Update (필요시)
  → Index Synchronization (검증)
```

### 정기 작업 (Scheduled)
```
하루 1회:
  → Glossary Usage 리포트 생성
  → Cleanup 감지 (0회 참조)
  → Term Change 감지
  → Index 완전 검증
```

---

## 📝 Frontmatter 확장

### 기존 Glossary Frontmatter
```yaml
---
title: String
aliases: String[]
tags: String[]
---
```

### 확장된 Frontmatter (Phase 5)
```yaml
---
title: String                    # 용어명
aliases: String[]                # 별칭 (이름 변경 시 보존)
ai_generated: Boolean             # LLM 생성 여부
ai_generated_at: ISO-DateTime    # 생성 시간
ai_updated_at: ISO-DateTime      # 마지막 업데이트 시간

# 🔑 새로 추가 (Phase 5)
reference_count: Number          # 참조 횟수
source_documents: String[]       # 참조 문서 목록
related_concepts: String[]       # 관련 개념

rename_history: Array            # 이름 변경 이력
  - from: String
    to: String
    date: ISO-DateTime
    reason: String (선택적)

tags: String[]
---
```

---

## 🧪 테스트 계획

### Unit Tests
- 참조 횟수 계산 정확도
- Glossary 파일 생성 검증
- Alias 매핑 정확도
- Term change 감지 정확도

### Integration Tests
- 전체 Pipeline 통합
- CLI 명령어 동작
- 정기 작업 스케줄

### Manual Tests
- 용어 변경 시나리오
- 참조 0 정리 시나리오
- Index 재빌드 시나리오

---

## 🎯 성공 기준

- [ ] 모든 CLI 명령어 구현 및 작동
- [ ] Glossary 자동 생성 정상 동작
- [ ] 참조 횟수 정확하게 계산
- [ ] 용어 변경 자동 감지 (Alias)
- [ ] 0회 참조 자동 정리
- [ ] Index 일관성 검증
- [ ] 모든 테스트 통과
- [ ] 문서화 완성

---

## 📚 참고 자료

- 설계 문서: `system-design-discussion-summary.md`
- Phase 4 문서: `PHASE4-COMPLETION-REPORT.md`
- Glossary Builder: `.obsidian/scripts/glossary-builder.js`
- Keyword Extraction: `.obsidian/scripts/agent-modules/keyword-extraction-agent.js`

---

## 🔗 다음 단계

1. ✅ Phase 5-1 구현 시작
2. ✅ 각 단계마다 테스트
3. ✅ CLI 명령어 통합
4. ✅ 문서화 및 예제 작성
5. ✅ Phase 6 계획 (고급 기능)

