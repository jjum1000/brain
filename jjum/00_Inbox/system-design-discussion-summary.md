# AI Agent 지식 관리 시스템 설계 논의 요약

## 📅 메타데이터
- 작성일: 2025-10-22
- 주제: 삭제 처리 및 Glossary 관리 전략
- 결론: LLM 관리 Glossary + 참조 카운팅 기반 생명주기

---

## 🎯 주요 논의 주제

### 1. 문서 삭제 시 Glossary 관리 문제
**문제 인식:**
- 현재 워크플로우에서 문서 삭제 시 Glossary Index가 자동으로 업데이트되지 않음
- 삭제된 용어가 Index에 남아 잘못된 참조 생성 가능

**초기 제안:**
- Glossary 폴더 감시하여 변경 시 자동 재빌드
- 삭제/수정 즉시 반영

---

### 2. AI vs 인간 생산 활동 패턴 분석

**잘못된 가정 수정:**
- ❌ 초기: 사용자가 Glossary를 직접 작성
- ✅ 실제: 사용자는 Inbox에 메모만 던짐

**실제 워크플로우:**
```
Inbox (기획서, 메모)
  ↓
Projects (코드 구현)
  ↓
Glossary (용어/개념 정리)
```

**역할 분리:**
- 👤 인간: `00_Inbox`, `1_Projects` (콘텐츠 생성)
- 🤖 LLM: `5_Glossary` (개념 추출 & 관리)

---

### 3. 복잡성 vs 간결성

**핵심 통찰:**
> "모든 상황에 대비하면 블랙박스가 된다"
> "구조의 간결성을 통해 사용자-프로세스 상호 신뢰 강화"

**원칙 확립:**
1. **파일 시스템이 진실의 원천** (Source of Truth)
2. **Index는 캐시일 뿐** (성능 최적화용)
3. **삭제는 즉각 반영** (파일 없으면 스킵)
4. **복구는 Git 활용** (특별한 시스템 불필요)

---

### 4. Glossary의 자체 생명력 개념

**핵심 아이디어:**
```
참조 횟수 (Reference Count) = 생명력

- 생성: LLM이 중요 개념 발견 → Glossary 생성
- 성장: 다른 문서에서 참조 → reference_count 증가
- 쇠퇴: 문서 삭제 → reference_count 감소
- 죽음: reference_count = 0 → 자동 정리
```

**자연스러운 생명주기:**
- 0회 참조 = "더 이상 사용되지 않는 지식"
- 자동 아카이브 또는 삭제
- 시스템이 강제하지 않음, 관찰만 함

---

### 5. 효율성: 참조 횟수 계산 방법

**비교한 방법들:**
1. Incremental Update (증분 업데이트) - 복잡함
2. Lazy Rebuild (필요할 때만) - 느림
3. Reverse Index (역인덱스) - 중간
4. **ripgrep 활용 (채택)** - 간단하고 빠름

**선택 이유:**
```bash
# ripgrep으로 실시간 계산
rg --count "\[\[Zustand\]\]" . --type md

# 장점:
- 인덱스 저장 불필요 (간단)
- 항상 정확 (실시간 파일 시스템 검색)
- 빠름 (Glossary 100개 × 10ms = ~1초)
- 하루 1번 실행으로 충분
```

---

### 6. Index와 Glossary 일관성 담보

**문제:**
- Index에 있는데 파일 없음
- 파일 있는데 Index에 없음
- 어떻게 일관성 보장?

**해결:**
```javascript
// 철학: Index는 캐시, 파일이 진실

async find(keyword) {
  const filePath = index.title_map[keyword];

  // 🔑 핵심: 항상 파일 존재 확인
  if (!fs.existsSync(filePath)) {
    return null;  // Index 믿지 않음
  }

  return item;
}
```

**보장 전략:**
- Level 1: 실시간 동기화 (5_Glossary Watcher)
- Level 2: 사용 시 검증 (파일 존재 확인)
- Level 3: 수동 복구 (`glossary-build`)

---

### 7. LLM 역할 명확화

**최종 확정:**
- Glossary는 **거의 모든 파일을 LLM이 생성**
- 사람은 Inbox/Projects에만 개입
- LLM이 Glossary 전체 관리

**Glossary 파일 구조:**
```yaml
---
title: Zustand
ai_generated: true                    # LLM 생성 표시
ai_generated_at: 2025-10-22T10:00:00Z
reference_count: 3                    # 생명력 지표
source_documents:                     # 어디서 참조?
  - 00_Inbox/zustand-idea.md
  - 1_Projects/todo-app/README.md
aliases: [zustand, state-library]
tags: [react, state-management]
related_concepts: [Redux, MobX]
---

# Zustand

[LLM이 생성한 정의와 설명...]

## 발견된 문맥
[원본 문서에서 추출한 인용구...]

## 사용 예시
[LLM이 수집/생성한 코드 예시...]
```

---

## ✅ 최종 도출된 시스템 원칙

### 원칙 1: 역할 분리
- 인간: Inbox, Projects (콘텐츠 생성)
- LLM: Glossary (개념 추출 & 관리)

### 원칙 2: Glossary = LLM의 정원
- LLM이 씨앗 심기 (개념 발견 → 파일 생성)
- LLM이 물주기 (참조 발견 → 내용 보강)
- LLM이 잡초 제거 (참조 0 → 삭제/아카이브)
- 인간은 구경만 (또는 수동 편집 가능)

### 원칙 3: 생명력 = 참조 횟수
- ripgrep으로 계산 (실시간, 정확)
- source_documents는 힌트 (캐시)
- 0되면 자동 정리

### 원칙 4: 파일 시스템 = 진실
- Index는 캐시
- Glossary 파일이 진실
- 불일치 발견 시 → 자동 재빌드

### 원칙 5: 간결성 > 완벽성
- 복잡한 동기화 로직 ❌
- 느슨한 일관성 허용 ✅
- 문제 발생 시 재빌드로 해결

---

## 🔧 구현 필요 사항

### 1. Glossary Creation Agent (새로 필요)
- LLM 호출하여 중요 개념 식별
- `5_Glossary/{concept}.md` 자동 생성
- `ai_generated: true` 표시

### 2. Glossary Update Agent (새로 필요)
- 기존 Glossary 보강
- 새로운 문맥 추가
- `source_documents` 업데이트

### 3. Glossary Cleanup (설계 완료)
```bash
# Reference counting
node cli.js glossary-usage

# 출력:
# ┌─────────────────────────────┬────────────┐
# │ Term                        │ References │
# ├─────────────────────────────┼────────────┤
# │ React                       │         15 │
# │ Zustand                     │          8 │
# │ Old Framework               │          0 │  ← 삭제 대상
# └─────────────────────────────┴────────────┘

# 미사용 항목 아카이브
node cli.js glossary-archive-unused
```

### 4. Index 동기화
- 5_Glossary Watcher (선택적, 실시간)
- 또는 정기 재빌드 (하루 1번)
- 파일 존재 검증

---

## 📊 삭제 처리 전략 (정리)

### Inbox 삭제
```
의미: "이 메모 필요 없음"
처리:
- Queue에서 제거 (또는 파일 없으면 스킵)
- Glossary에서 source_documents 업데이트
- reference_count 재계산
```

### Projects 삭제
```
의미: "프로젝트 종료/폐기"
처리:
- 관련 Glossary 항목들 reference_count 감소
- 0되면 자동 아카이브 (ai_generated: true만)
- 수동 작성 Glossary는 사용자 확인
```

### Glossary 삭제
```
의미: (거의 발생 안 함, LLM이 관리)
처리:
- Index 재빌드로 자동 제거
- 또는 LLM이 필요시 재생성
```

---

## 🔄 용어/단어 변경 감지 및 처리 전략

### 문제 정의

**시나리오:** 세계관 정리 중 주인공 이름 변경 (비트 → 레인)

```
변경 전:
├─ 1_Projects/my-novel/characters/protagonist.md
│   "# 주인공: 비트"
├─ 5_Glossary/비트.md (LLM 자동 생성)
└─ 15개 문서에서 [[비트]] 참조

변경 후:
└─ protagonist.md에서 "비트" → "레인" 수정
```

**발생 가능한 문제:**
- Glossary 파일 불일치 (비트.md vs 레인.md)
- 기존 링크 깨짐 ([[비트]] → 파일 없음)
- Reference count 손실
- 변경 이력 추적 어려움

---

### 해결 전략: Alias 기반 하위 호환

**핵심 원칙:**
> "복잡한 링크 업데이트 없이 Alias로 해결"

#### [1단계] 변경 감지

```javascript
File Watcher:
├─ 1_Projects/my-novel/characters/protagonist.md 수정 감지
├─ Work Queue에 추가
└─ Agent Pipeline 트리거 (5초 debounce)
```

#### [2단계] LLM 분석

```javascript
Keyword Extraction Agent (LLM):
입력: "# 주인공: 레인\n전직 해커..."
출력: keywords: [레인, 주인공, 해커]

Glossary Agent (LLM):
"""
발견: 새 키워드 "레인"
기존 Glossary: "비트.md" (tags: protagonist)
동일 문서(protagonist.md): 이름 변경으로 판단

작업:
1. 5_Glossary/레인.md 생성
2. aliases: [비트] 추가 (🔑 핵심!)
3. 변경 이력 기록
4. 5_Glossary/비트.md 삭제
"""
```

#### [3단계] Glossary 업데이트

```yaml
# 5_Glossary/레인.md (자동 생성)
---
title: 레인
aliases: [비트, Beat, 주인공]  # 🔑 옛날 이름 보존!
ai_generated: true
ai_updated_at: 2025-10-22T15:30:00Z

reference_count: 15  # 유지됨
source_documents:
  - 1_Projects/my-novel/characters/protagonist.md
  - 1_Projects/my-novel/chapters/chapter-01.md
  - ...

rename_history:  # 변경 이력 추적
  - from: 비트
    to: 레인
    date: 2025-10-22T15:30:00Z
    reason: "더 세련된 이름으로 변경"
---

# 레인 (구 비트)

주인공. 전직 해커로 사이버펑크 세계관에서 활동.

**이름 변경:** 비트 → 레인 (2025-10-22)
```

#### [4단계] Index 재빌드

```javascript
Glossary Index (자동):
{
  "items": [{
    "id": "레인",
    "title": "레인",
    "file": "5_Glossary/레인.md",
    "aliases": ["비트"]
  }],
  "title_map": {
    "레인": "5_Glossary/레인.md"
  },
  "alias_map": {
    "비트": "5_Glossary/레인.md"  // 🔑 하위 호환!
  }
}
```

#### [5단계] 기존 링크 작동 확인

```
기존 문서 (수정 안 함):
1_Projects/my-novel/chapters/chapter-01.md:
"비트는 네온 거리를 걸었다..."

Linking Agent:
├─ "비트" 발견
├─ Index의 alias_map에서 검색
├─ "비트" → "5_Glossary/레인.md" 매칭
└─ [[비트]] 링크 생성 ✅ (여전히 작동!)

새 문서:
└─ LLM이 자동으로 [[레인]] 사용 (점진적 업데이트)
```

#### [6단계] Reference Counting

```bash
# Alias 포함 계산
rg --count "\[\[레인\]\]" --type md    # 1개 (새 문서)
rg --count "\[\[비트\]\]" --type md    # 14개 (기존 문서)
# 합계: 15개 ✅

출력:
┌──────────┬────────────┬──────────────────┐
│ Term     │ References │ Breakdown        │
├──────────┼────────────┼──────────────────┤
│ 레인     │         15 │ 레인: 1          │
│          │            │ 비트: 14 (alias) │
└──────────┴────────────┴──────────────────┘
```

---

### 세 가지 변경 유형

#### 유형 1: 단순 이름 변경 (Rename)
```
예: 비트 → 레인
처리: aliases에 옛날 이름 추가
결과: 모든 링크 작동 유지
```

#### 유형 2: 개념 통합 (Merge)
```
예: useState.md + useEffect.md → React-Hooks.md
처리:
  title: React Hooks
  aliases: [useState, useEffect, useReducer]
결과: [[useState]] → React-Hooks.md로 연결
```

#### 유형 3: 개념 분리 (Split)
```
예: React-Hooks.md → useState.md + useEffect.md
처리:
  # useState.md
  related_concepts: [useEffect, React Hooks]

  # useEffect.md
  related_concepts: [useState, React Hooks]
결과: LLM이 문맥 보고 적절한 링크 선택
```

---

### 선택적 기능: 명시적 링크 업데이트

```bash
# 사용자가 원할 경우 (선택적)
node cli.js glossary-rename-links "비트" "레인"

출력:
"""
14개 파일에서 [[비트]] → [[레인]]으로 변경하시겠습니까?

영향받는 파일:
- chapter-01.md (3곳)
- chapter-02.md (2곳)
- chapter-03.md (1곳)
...

[Y/n]
"""

장점:
├─ 선택적 (원하면 사용)
├─ 투명 (변경 파일 미리 확인)
└─ 안전 (Git으로 복구 가능)

기본 동작:
└─ 아무것도 안 해도 됨 (alias로 작동)
```

---

### 간결성의 핵심

**복잡한 시스템 ❌**
```
- 링크 업데이트 트랜잭션
- 롤백 메커니즘
- 충돌 해결 로직
- 동기화 상태 관리
- 변경 승인 워크플로우
```

**간결한 시스템 ✅**
```
1. LLM: "옛날 이름을 aliases에 추가"
2. Index: alias_map 자동 생성
3. 옛날 링크: 그대로 작동
4. 끝.
```

**사용자 경험:**
```
사용자가 하는 것:
└─ protagonist.md에서 이름 수정 (1개 파일)

LLM이 자동으로 하는 것:
├─ Glossary 생성/업데이트
├─ Alias 추가
├─ Index 재빌드
├─ 변경 이력 기록
└─ Reference count 유지

결과:
├─ 모든 링크 작동 (하위 호환)
├─ 점진적 업데이트 (자연스럽게)
├─ 완전한 투명성 (파일에 모든 정보)
└─ Git 친화적 (의미있는 커밋)
```

---

### Git 커밋 예시

```bash
git log --oneline

abc1234 feat: 주인공 이름 변경 (비트 → 레인)

# Git diff
- 5_Glossary/비트.md (삭제)
+ 5_Glossary/레인.md (생성)
  ---
  title: 레인
+ aliases: [비트]
+ rename_history:
+   - from: 비트
+     to: 레인
  ---
```

---

## 🌟 핵심 가치

### 투명성 (Transparency)
- 모든 AI 수정은 frontmatter에 `ai_*` prefix
- Git diff로 변경 사항 추적 가능
- 사용자가 파일만 열면 "무슨 일이 일어났는지" 즉시 보임

### 예측 가능성 (Predictability)
- 파일 삭제 = 시스템도 삭제로 인정
- 참조 0회 = 더 이상 필요 없는 지식
- 단순하고 직관적인 규칙

### 복구 용이성 (Recoverability)
- Git으로 복구 (사용자가 이미 아는 방법)
- 특별한 복구 시스템 불필요
- `git checkout HEAD~1 -- "5_Glossary/Term.md"`

### 신뢰 구축 (Trust)
- 복잡한 추적 시스템 대신 → 파일 시스템이 진실
- 특별한 복구 시스템 대신 → Git 활용
- 블랙박스 대신 → frontmatter에 모든 것 기록

---

## 🎯 다음 단계

1. **Glossary Creation Agent 구현**
   - LLM API 통합
   - 중요 개념 자동 식별
   - Glossary 파일 자동 생성

2. **Reference Counting 시스템**
   - ripgrep 기반 계산
   - 정기 실행 (하루 1번)
   - 사용량 리포트 생성

3. **Cleanup 자동화**
   - 0회 참조 항목 감지
   - 자동 아카이브 (4_Archives/unused-glossary/)
   - 사용자에게 리포트 제공

4. **Index 동기화 개선**
   - 5_Glossary Watcher (선택적)
   - 파일 존재 검증 강화
   - Auto-rebuild on inconsistency

---

## 💭 설계 철학

> "간결성을 통한 신뢰"

복잡한 시스템이 안정적으로 보일 수 있지만, 오히려 사용자 측면에서 데이터 생성 과정이 블랙박스화 될 수 있다. 대신, 구조의 간결성을 통해 사용자와 프로세스 간 상호 신뢰가 강해지도록 설계한다.

**핵심:**
- 복잡한 상태 관리 대신 → 파일 시스템이 진실
- 특별한 복구 시스템 대신 → Git 활용
- 블랙박스 대신 → frontmatter에 모든 것 기록
- 완벽한 동기화 대신 → 느슨하지만 안전한 일관성

---

## 📚 관련 개념

- Knowledge Management
- LLM Agent System
- Reference Counting
- Garbage Collection (개념적 유사성)
- Source of Truth Pattern
- Cache Invalidation
- Eventual Consistency

---

## 🔗 참조

- Filing Agent: `d:\jjumV\jjum\.obsidian\scripts\agent-modules\filing-agent.js`
- Glossary Builder: `d:\jjumV\jjum\.obsidian\scripts\glossary-builder.js`
- File Watcher: `d:\jjumV\jjum\.obsidian\scripts\file-watcher.js`
- Completion Log: `d:\jjumV\jjum\.obsidian\scripts\completion-log.js`
