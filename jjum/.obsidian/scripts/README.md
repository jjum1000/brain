# AI Agent 기반 지식 관리 시스템

완전 자동화된 AI 에이전트 중심의 Obsidian 지식 관리 시스템입니다.

## 📋 시스템 개요

### 핵심 원칙
- **세션 독립성**: 모든 상태를 JSON 파일로 추적
- **완전 자동화**: AI 에이전트가 독립적으로 작동
- **멱등성 보장**: 동일 작업 재실행 시 안전
- **복구 가능성**: 실패 지점부터 재시작 가능

### 주요 구성 요소

#### 1. 상태 추적 시스템
- **Work Queue** (`work-queue.json`): 처리 대기 문서 관리
- **Processing Manifest** (`processing-manifest.json`): 현재 처리 중인 작업 추적
- **Completion Log** (`completion-log.json`): 완료된 작업 이력

#### 2. 리소스 관리
- **Resource Registry** (`resource-registry.json`): 시스템 리소스 경로 관리
- **Glossary Index** (`glossary-index.json`): 용어집 인덱스
- **Filing Rules** (`filing-rules.json`): 자동 파일 분류 규칙

## 🚀 설치 및 설정

### 1. 의존성 설치

```bash
cd .obsidian/scripts
npm install
```

### 2. 디렉토리 구조

시스템이 자동으로 생성한 구조:

```
.obsidian/
├── state/                          # 상태 추적 파일
│   ├── work-queue.json
│   ├── processing-manifest.json
│   ├── completion-log.json
│   ├── resource-registry.json
│   └── glossary-index.json
├── config/                         # 설정 파일
│   └── filing-rules.json
└── scripts/                        # 스크립트
    ├── agent-modules/              # 에이전트 모듈
    ├── queue-manager.js
    ├── processing-manifest.js
    ├── completion-log.js
    ├── resource-registry.js
    ├── base-agent.js
    ├── main-processor.js
    ├── glossary-builder.js
    ├── filing-rules-engine.js
    └── file-watcher.js
```

### 3. 초기화

Resource Registry 초기화 (필수 폴더 생성):

```bash
node -e "const RR = require('./resource-registry'); const r = new RR('.'); r.initialize();"
```

Glossary Index 빌드:

```bash
node glossary-builder.js build
```

## 💻 사용법

### Work Queue 관리

```bash
# 다음 작업 처리
node main-processor.js process-next

# 모든 작업 처리
node main-processor.js process-all

# 실패한 작업 재시도
node main-processor.js retry-failed

# 시스템 상태 확인
node main-processor.js status
```

### File Watcher (자동 모니터링)

```bash
# 00_Inbox 폴더 모니터링 시작
node file-watcher.js watch

# 기존 파일 스캔 및 큐 추가
node file-watcher.js scan

# Watcher 통계
node file-watcher.js stats
```

### Glossary 관리

```bash
# Glossary Index 빌드
node glossary-builder.js build

# 용어 검색
node glossary-builder.js find "react"

# 용어 검색 (부분 일치)
node glossary-builder.js search "java"

# 통계
node glossary-builder.js stats
```

### Filing Rules 관리

```bash
# 규칙 목록 보기
node filing-rules-engine.js list

# 통계
node filing-rules-engine.js stats
```

## 🔄 워크플로우

### 1. 파일이 00_Inbox에 추가됨
- File Watcher가 감지
- 메타데이터 자동 추출
- Work Queue에 추가

### 2. Main Processor가 처리
- Work Queue에서 다음 작업 가져오기
- Processing Manifest에 등록
- Agent Pipeline 실행:
  1. Normalization Agent
  2. Keyword Extraction Agent
  3. Linking Agent
  4. Tagging Agent
  5. Filing Agent

### 3. 완료 처리
- 최종 위치로 파일 이동
- Completion Log에 기록
- Processing Manifest에서 제거

## 🤖 에이전트 개발

### Base Agent 상속

```javascript
const BaseAgent = require('../base-agent');

class MyAgent extends BaseAgent {
  constructor(vaultPath) {
    super('my-agent', vaultPath);
  }

  async process(documentState) {
    // 문서 처리 로직

    // 문서 저장
    await this.saveDocument(
      documentState.path,
      updatedFrontmatter,
      updatedBody
    );

    return {
      // 결과 반환
      changes_made: true
    };
  }
}

module.exports = MyAgent;
```

### 에이전트 등록

1. `.obsidian/scripts/agent-modules/`에 파일 생성
2. 파일명: `{agent-name}-agent.js`
3. Work Queue의 `determineAgents()` 함수에 추가

## 📊 모니터링

### 시스템 상태 확인

```bash
node main-processor.js status
```

출력 예시:
```json
{
  "queue": {
    "total_items": 5,
    "by_type": {
      "inbox-file": 3,
      "git-commit": 2
    }
  },
  "processing": {
    "total_processing": 1,
    "by_status": {
      "in_progress": 1
    }
  },
  "completed": {
    "total_completed": 42,
    "success_rate": 95
  }
}
```

## 🛠️ 트러블슈팅

### 에이전트 실패 시

1. Processing Manifest 확인:
   ```bash
   cat .obsidian/state/processing-manifest.json
   ```

2. 실패한 에이전트부터 재시작:
   ```bash
   node main-processor.js retry-failed
   ```

### Queue가 비어있는데 처리되지 않은 파일이 있을 때

```bash
# 기존 파일 다시 스캔
node file-watcher.js scan
```

### Glossary Index 재빌드

```bash
node glossary-builder.js build
```

## 📝 설정 파일

### Filing Rules 예시

```json
{
  "rules": [
    {
      "id": "rule-react",
      "name": "React 관련 문서",
      "priority": 1,
      "conditions": {
        "tags": ["react", "javascript"],
        "any": true
      },
      "destination": "3_Resources/React",
      "enabled": true
    }
  ]
}
```

### Resource Registry 예시

```json
{
  "folders": {
    "inbox": "00_Inbox",
    "projects": "1_Projects",
    "resources": "3_Resources",
    "glossary": "5_Glossary"
  }
}
```

## 🔐 보안

- `.env` 파일은 Git에 커밋되지 않도록 `.gitignore`에 추가됨
- GitHub API 토큰은 안전하게 `.env`에 저장됨

## 📈 성능 최적화

- Glossary Index는 사전 빌드되어 빠른 검색 제공
- Work Queue는 우선순위 기반 정렬
- File Watcher는 파일 안정화 후 처리 (2초 대기)

## 🤝 기여

새로운 에이전트나 기능을 추가하려면:

1. Base Agent를 상속한 새 에이전트 작성
2. `agent-modules/` 폴더에 배치
3. Queue Manager의 `determineAgents()` 업데이트
4. 테스트 실행

## 📚 참고 문서

- [AI Agent Workflow 설계](../00_Inbox/ai_agent_workflow.txt)
- [구현 TodoList](../00_Inbox/ai-agent-system-todolist.md)

---

**버전**: 1.0.0
**최종 업데이트**: 2025-10-21
