# Phase 2: 개별 에이전트 구현 계획

## 📋 개요

Phase 1에서 구축한 핵심 인프라 위에 실제 문서 처리를 담당하는 5개의 에이전트를 구현합니다.

## 🎯 목표

- 완전히 작동하는 문서 처리 파이프라인 구축
- End-to-End 테스트 통과
- 실제 문서로 시스템 검증

## 📝 작업 목록

### 1. 환경 설정 및 준비

#### 1.1 의존성 설치
```bash
cd .obsidian/scripts
npm install
```

**설치될 패키지:**
- `gray-matter`: Frontmatter 파싱
- `chokidar`: 파일 시스템 감시

**추가 필요 패키지:**
- `natural`: NLP 키워드 추출 (Keyword Extraction Agent용)
- `stopword`: 불용어 제거
- `compromise`: 자연어 처리

```bash
npm install natural stopword compromise
```

#### 1.2 리소스 초기화

Resource Registry 초기화:
```bash
node -e "const RR = require('./resource-registry'); const r = new RR('D:\\jjumV\\jjum'); r.initialize().then(() => console.log('Done'));"
```

필요한 폴더 구조:
```
00_Inbox/           # 입력 폴더
├── git-imports/    # Git 커밋용
1_Projects/         # 프로젝트
2_Areas/           # 영역
3_Resources/       # 리소스
├── React/
├── Programming/
├── Web-Clips/
└── General/
4_Archives/        # 아카이브
5_Glossary/        # 용어집
```

---

### 2. Normalization Agent 구현

**파일:** `.obsidian/scripts/agent-modules/normalization-agent.js`

**책임:**
- HTML 태그 제거
- 특수 문자 정리
- Frontmatter 생성/업데이트
- 인코딩 통일 (UTF-8)

**입력:**
```markdown
<h1>Title</h1>
<p>Some content with <strong>HTML</strong></p>
```

**출력:**
```markdown
---
title: Title
created: 2025-10-21T07:00:00Z
status: normalized
source: inbox-file
---

Title

Some content with HTML
```

**구현 체크리스트:**
- [ ] HTML 태그 제거 로직
- [ ] Frontmatter 생성/병합
- [ ] 줄바꿈 정규화
- [ ] 특수 문자 처리
- [ ] UTF-8 인코딩 확인
- [ ] 테스트 케이스 작성

**예상 작업 시간:** 30분

---

### 3. Keyword Extraction Agent 구현

**파일:** `.obsidian/scripts/agent-modules/keyword-extraction-agent.js`

**책임:**
- 본문에서 중요 키워드 추출
- TF-IDF 또는 빈도 기반 추출
- 불용어 제거
- Frontmatter에 keywords 추가

**입력:**
```markdown
---
title: React Server Components
---

React Server Components allow you to write components that render on the server...
```

**출력:**
```markdown
---
title: React Server Components
keywords:
  - React
  - Server Components
  - rendering
  - server-side
concepts:
  - React
  - Server Components
---

React Server Components allow you to write components that render on the server...
```

**NLP 라이브러리 선택:**
- **Option 1:** `natural` (TF-IDF)
- **Option 2:** `compromise` (언어 이해)
- **Option 3:** 간단한 빈도 기반 (초기 구현용)

**구현 체크리스트:**
- [ ] NLP 라이브러리 선택 및 설치
- [ ] 키워드 추출 알고리즘 구현
- [ ] 불용어 목록 작성
- [ ] 품질 임계값 설정
- [ ] Frontmatter 업데이트
- [ ] 테스트 케이스 작성

**예상 작업 시간:** 1시간

---

### 4. Linking Agent 구현

**파일:** `.obsidian/scripts/agent-modules/linking-agent.js`

**책임:**
- Glossary Index에서 용어 매칭
- 위키링크 [[...]] 생성
- 중복 링크 방지
- Frontmatter에 linked_concepts 추가

**입력:**
```markdown
---
keywords:
  - React
  - Server Components
---

React Server Components allow you to write components...
```

**출력:**
```markdown
---
keywords:
  - React
  - Server Components
linked_concepts:
  - React
  - Server Components
unlinked_keywords: []
---

[[React]] Server Components allow you to write components...
```

**매칭 전략:**
1. 정확한 제목 매칭
2. Alias 매칭
3. 대소문자 무시 매칭

**구현 체크리스트:**
- [ ] Glossary Index 로드
- [ ] 키워드 매칭 로직
- [ ] 위키링크 삽입 (첫 번째 출현만)
- [ ] 중복 방지
- [ ] linked_concepts / unlinked_keywords 업데이트
- [ ] 테스트 케이스 작성

**예상 작업 시간:** 45분

---

### 5. Tagging Agent 구현

**파일:** `.obsidian/scripts/agent-modules/tagging-agent.js`

**책임:**
- 키워드 기반 자동 태깅
- 경로 기반 태깅
- 컨텍스트 기반 태깅
- Frontmatter에 tags 추가

**입력:**
```markdown
---
keywords:
  - React
  - Server Components
  - JavaScript
---
```

**출력:**
```markdown
---
keywords:
  - React
  - Server Components
  - JavaScript
tags:
  - react
  - javascript
  - frontend
---
```

**태깅 규칙:**
- 키워드가 "React"를 포함 → `#react`, `#frontend` 추가
- 키워드가 "JavaScript"를 포함 → `#javascript` 추가
- Git 커밋 소스 → `#code-change` 추가

**구현 체크리스트:**
- [ ] 태그 시스템 파일 생성 (선택사항)
- [ ] 키워드→태그 매핑 로직
- [ ] 경로 기반 태깅
- [ ] 소스 타입 기반 태깅
- [ ] 태그 정규화 (소문자, 중복 제거)
- [ ] 테스트 케이스 작성

**예상 작업 시간:** 30분

---

### 6. Filing Agent 구현

**파일:** `.obsidian/scripts/agent-modules/filing-agent.js`

**책임:**
- Filing Rules Engine 사용
- 목적지 폴더 결정
- 파일 안전하게 이동
- 중복 파일명 처리
- Frontmatter에 이동 정보 추가

**입력:**
```markdown
---
tags:
  - react
  - javascript
---
```

**출력:**
- 파일이 `3_Resources/React/` 폴더로 이동
- Frontmatter에 `moved_at`, `final_location` 추가

**구현 체크리스트:**
- [ ] Filing Rules Engine 통합
- [ ] 목적지 결정 로직
- [ ] 파일 이동 (BaseAgent.moveFile 사용)
- [ ] 중복 처리 (파일명에 -1, -2 추가)
- [ ] Frontmatter 업데이트
- [ ] 백업 생성 (선택사항)
- [ ] 테스트 케이스 작성

**예상 작업 시간:** 45분

---

### 7. 테스트 문서 준비

**위치:** `00_Inbox/`

**테스트 케이스 1: 기본 Markdown 문서**
```markdown
# React Server Components

React Server Components is a new feature that allows...

Key benefits:
- Performance
- SEO
- User Experience
```

**테스트 케이스 2: HTML이 포함된 웹 클립**
```html
<h1>Understanding JavaScript Closures</h1>
<p>Closures are a fundamental concept in <strong>JavaScript</strong>...</p>
```

**테스트 케이스 3: Git 커밋 형식**
```markdown
---
source: git-commit
commit_hash: a3f2b1c
---

# Refactor: useState to Zustand

Changed state management from React useState to Zustand...
```

**구현 체크리스트:**
- [ ] 3개 이상의 테스트 문서 생성
- [ ] 다양한 소스 타입 커버
- [ ] HTML 포함 문서
- [ ] 키워드가 풍부한 문서
- [ ] Glossary에 매칭될 용어 포함

**예상 작업 시간:** 15분

---

### 8. Glossary 초기 데이터

**위치:** `5_Glossary/`

**샘플 용어집 파일:**

**React.md:**
```markdown
---
title: React
aliases:
  - 리액트
  - React.js
tags:
  - javascript
  - frontend
  - library
---

# React

A JavaScript library for building user interfaces.
```

**JavaScript.md:**
```markdown
---
title: JavaScript
aliases:
  - JS
  - 자바스크립트
tags:
  - programming
  - web
---

# JavaScript

A high-level programming language.
```

**구현 체크리스트:**
- [ ] 5개 이상의 용어 파일 생성
- [ ] Alias 포함
- [ ] Tags 포함
- [ ] Glossary Index 빌드 실행

**예상 작업 시간:** 20분

---

### 9. End-to-End 테스트

**테스트 시나리오:**

1. **Glossary Index 빌드**
   ```bash
   node glossary-builder.js build
   ```

2. **테스트 문서를 00_Inbox에 추가**

3. **File Watcher 시작** (별도 터미널)
   ```bash
   node file-watcher.js watch
   ```

4. **Main Processor 실행**
   ```bash
   node main-processor.js process-next
   ```

5. **결과 확인**
   - 파일이 적절한 폴더로 이동되었는가?
   - Frontmatter가 올바르게 생성되었는가?
   - 위키링크가 생성되었는가?
   - 태그가 추가되었는가?

**검증 체크리스트:**
- [ ] Work Queue에 파일 추가 확인
- [ ] Processing Manifest 업데이트 확인
- [ ] 5개 에이전트 모두 실행 확인
- [ ] Completion Log 기록 확인
- [ ] 파일이 최종 목적지로 이동 확인
- [ ] Frontmatter 완전성 확인
- [ ] 에러 없이 완료 확인

**예상 작업 시간:** 30분

---

## 📊 전체 작업 타임라인

| 작업 | 예상 시간 | 우선순위 |
|-----|---------|---------|
| 1. 의존성 설치 및 초기화 | 15분 | 🔴 최상 |
| 2. Normalization Agent | 30분 | 🔴 최상 |
| 3. Keyword Extraction Agent | 1시간 | 🟠 상 |
| 4. Linking Agent | 45분 | 🟠 상 |
| 5. Tagging Agent | 30분 | 🟡 중 |
| 6. Filing Agent | 45분 | 🟠 상 |
| 7. 테스트 문서 준비 | 15분 | 🟡 중 |
| 8. Glossary 초기 데이터 | 20분 | 🟡 중 |
| 9. End-to-End 테스트 | 30분 | 🔴 최상 |

**총 예상 시간:** 약 4-5시간

---

## 🎯 완료 기준

### Phase 2 완료 조건

✅ 5개 에이전트 모두 구현 완료
✅ 각 에이전트 개별 테스트 통과
✅ End-to-End 테스트 성공
✅ 최소 3개 문서 자동 처리 성공
✅ Completion Log에 정상 기록
✅ 에러율 < 10%

### 다음 단계 (Phase 3)

- 에러 처리 강화
- 성능 최적화
- 추가 에이전트 개발
- CI/CD 파이프라인 구축

---

## 💡 구현 팁

### 개발 순서

1. **Normalization Agent 먼저** - 가장 기본적이고 의존성 없음
2. **Keyword Extraction** - Linking과 Tagging의 기반
3. **Linking Agent** - Glossary 의존
4. **Tagging Agent** - Keywords 의존
5. **Filing Agent** - 마지막 단계

### 디버깅

각 에이전트 개별 테스트:
```bash
node -e "
const Agent = require('./agent-modules/normalization-agent');
const agent = new Agent('D:\\\\jjumV\\\\jjum');
const BaseAgent = require('./base-agent');
const base = new BaseAgent('test', 'D:\\\\jjumV\\\\jjum');
base.loadDocumentState('00_Inbox/test.md')
  .then(state => agent.execute(state))
  .then(result => console.log(JSON.stringify(result, null, 2)));
"
```

### 로깅

각 에이전트에서 `this.log()` 사용:
```javascript
this.log('info', 'Processing started', { file: documentState.path });
this.log('warn', 'No keywords found');
this.log('error', 'Failed to extract', error);
```

---

**작성일:** 2025-10-21
**상태:** 준비 완료
**다음 작업:** Phase 2 구현 시작
