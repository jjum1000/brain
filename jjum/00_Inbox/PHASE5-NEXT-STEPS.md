# Phase 5 다음 단계: 구현 전략

**상태:** Phase 5-1 완료, Phase 5-2 ~ 5-6 계획 수립
**작성일:** 2025-10-23
**우선순위:** Phase 5-2 → Phase 5-4 → Phase 5-3/5-5/5-6

---

## 🎯 Phase 5-2: Glossary Creation Agent (LLM 기반 개념 추출)

### 목표
새 문서 처리 시 중요 개념을 자동으로 추출하여 Glossary 파일 생성

### 구현 계획

#### 1단계: 기존 Keyword Extraction Agent 활용
```javascript
// keyword-extraction-agent.js 확장
class GlossaryCreationAgent extends BaseAgent {
  async extractImportantConcepts(documentContent) {
    // 기존 keyword-extraction-agent 사용
    // 상위 10개 키워드 중 중요도 필터링
    const keywords = await extractKeywords(documentContent);
    return keywords.filter(k => k.importance > threshold);
  }
}
```

#### 2단계: LLM API 통합 (선택적)
```javascript
// Claude API 통합
async function generateGlossaryDefinition(concept, context) {
  const prompt = `Given the concept "${concept}" in this context:
  ${context}

  Generate:
  1. A clear definition (1-2 sentences)
  2. Key features (bullet points)
  3. Related concepts (2-3 items)`;

  return await claudeAPI.message({
    model: "claude-3-haiku",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }]
  });
}
```

#### 3단계: Glossary 파일 생성
```javascript
async createGlossaryFile(concept, definition, context, sourceDocument) {
  const frontmatter = {
    title: concept,
    aliases: [concept.toLowerCase()],
    ai_generated: true,
    ai_generated_at: new Date().toISOString(),
    reference_count: 1,
    source_documents: [sourceDocument],
    tags: [],
    related_concepts: []
  };

  const content = `---
${YAML.stringify(frontmatter)}
---

# ${concept}

${definition}

## 발견된 문맥

> ${context.substring(0, 200)}...

## 사용 예시

[LLM이 생성한 코드 예시]
`;

  fs.writeFileSync(`5_Glossary/${concept}.md`, content);
}
```

### 실행 위치
- **Pipeline에 추가:** Filing Agent 이후
- **또는 정기 실행:** 하루 1회 batch 처리

### CLI 명령어
```bash
node cli.js glossary-create-from <file>      # 특정 파일에서 생성
node cli.js glossary-create-batch            # 모든 문서 스캔
```

### 성공 기준
- [ ] 새 문서에서 5개 이상의 개념 자동 추출
- [ ] Glossary 파일 자동 생성 (frontmatter 포함)
- [ ] 기존 개념과 중복 제외
- [ ] CLI 명령어 정상 작동

---

## 🎯 Phase 5-4: Glossary Cleanup System (우선순위 높음)

### 목표
참조 0회인 용어를 자동으로 아카이브하거나 사용자에게 알림

### 구현 계획

#### 1단계: 0회 참조 감지
```javascript
// Phase 5-1의 glossary-usage 결과 활용
async detectUnusedTerms() {
  const refData = await countAllReferences();
  const unused = Object.entries(refData)
    .filter(([_, item]) => item.reference_count === 0)
    .map(([name, item]) => ({
      term: item.title,
      file: item.file,
      ai_generated: item.ai_generated,
      daysUnused: daysUnusedSince(item.ai_updated_at)
    }));
  return unused;
}
```

#### 2단계: 아카이브 처리
```javascript
async archiveUnusedTerms(terms) {
  for (const term of terms) {
    if (term.ai_generated && term.daysUnused > 30) {
      // AI 생성 항목: 자동 아카이브
      moveToArchive(term.file, '4_Archives/unused-glossary/');
      logAction(`Archived: ${term.term}`);
    } else if (!term.ai_generated) {
      // 수동 작성: 사용자 확인 요청
      reportForReview(term);
    }
  }
}
```

#### 3단계: 사용자 알림
```javascript
function generateCleanupReport(unusedTerms) {
  console.log(`\n⚠️  Cleanup Report: ${unusedTerms.length} unused term(s)\n`);

  const aiGenerated = unusedTerms.filter(t => t.ai_generated);
  const manual = unusedTerms.filter(t => !t.ai_generated);

  if (aiGenerated.length > 0) {
    console.log(`✅ 자동 아카이브 예정 (${aiGenerated.length}개):`);
    aiGenerated.forEach(t => {
      console.log(`   - ${t.term} (${t.daysUnused}일 미사용)`);
    });
  }

  if (manual.length > 0) {
    console.log(`⚡ 사용자 검토 필요 (${manual.length}개):`);
    manual.forEach(t => {
      console.log(`   - ${t.term} (수동 작성)`);
    });
  }
}
```

### CLI 명령어
```bash
node cli.js glossary-archive-unused           # 자동 아카이브 실행
node cli.js glossary-archive-unused --dry-run # 미리 보기
node cli.js glossary-restore <term>           # 아카이브에서 복구
```

### 정기 실행
```javascript
// cron job 또는 스케줄러
schedule('0 2 * * *', async () => {  // 매일 2시
  const unused = await detectUnusedTerms();
  if (unused.length > 0) {
    await archiveUnusedTerms(unused);
    generateCleanupReport(unused);
  }
});
```

### 성공 기준
- [ ] 0회 참조 항목 자동 감지
- [ ] AI 생성 항목 자동 아카이브 (> 30일)
- [ ] 수동 작성 항목 보존 (사용자 확인)
- [ ] 아카이브 항목 복구 가능
- [ ] 정기 실행 가능

---

## 🎯 Phase 5-3: Glossary Update Agent (내용 보강)

### 목표
기존 Glossary 항목을 새로운 참조 정보로 자동 보강

### 구현 계획

#### 1단계: 변경 감지
```javascript
async detectChanges() {
  const prevStats = loadPreviousStats();
  const currentStats = await countAllReferences();

  const changes = [];
  for (const [term, current] of Object.entries(currentStats)) {
    const previous = prevStats[term] || { reference_count: 0 };

    if (current.reference_count > previous.reference_count) {
      changes.push({
        term: current.title,
        newReferences: current.reference_count - previous.reference_count,
        newDocuments: findNewSourceDocs(current, previous)
      });
    }
  }

  return changes;
}
```

#### 2단계: 내용 업데이트
```javascript
async updateGlossaryContent(term, newReferences) {
  const filePath = `5_Glossary/${term}.md`;
  const content = readFile(filePath);
  const { data: frontmatter, content: body } = matter(content);

  // frontmatter 업데이트
  frontmatter.reference_count = newReferences.length;
  frontmatter.source_documents = newReferences;
  frontmatter.ai_updated_at = new Date().toISOString();

  // 필요시 LLM으로 내용 보강
  if (shouldEnhance(frontmatter)) {
    const enhancement = await generateEnhancement(term, newReferences);
    body += `\n\n## 추가 문맥 (${getCurrentDate()})\n\n${enhancement}`;
  }

  writeFile(filePath, matter.stringify(body, frontmatter));
}
```

### 성공 기준
- [ ] 참조 증가 자동 감지
- [ ] source_documents 자동 업데이트
- [ ] ai_updated_at 타임스탬프 갱신
- [ ] 선택적 LLM 보강

---

## 🎯 Phase 5-5: Term Change Detection & Alias System

### 목표
용어 이름 변경을 감지하고 Alias로 하위 호환성 유지

### 구현 계획

#### 1단계: 변경 감지
```javascript
async detectTermChanges() {
  // Projects 폴더의 파일 변경 감시
  // 이전 키워드 vs 현재 키워드 비교

  const previousKeywords = loadPreviousKeywords();
  const currentKeywords = await extractAllKeywords();

  const changes = detectRenameCandidates(previousKeywords, currentKeywords);
  // 같은 문서의 다른 키워드 = 이름 변경 가능성

  return changes;
}
```

#### 2단계: Alias 생성
```javascript
async handleTermRename(oldTerm, newTerm, sourceDocument) {
  // 새 Glossary 파일 생성
  const newGlossary = {
    title: newTerm,
    aliases: [oldTerm, ...oldAliases],  // 옛날 이름 보존!
    ai_generated: true,
    reference_count: oldCount,
    source_documents: sourceDocuments,
    rename_history: [{
      from: oldTerm,
      to: newTerm,
      date: new Date().toISOString(),
      reason: "자동 감지된 이름 변경"
    }]
  };

  // 기존 파일은 삭제
  deleteFile(`5_Glossary/${oldTerm}.md`);

  // Index alias_map 자동 생성
  await rebuildGlossaryIndex();
}
```

#### 3단계: 기존 링크 유지
```javascript
// Index alias_map이 자동으로 처리
// [[oldTerm]] → 자동으로 newTerm으로 연결됨
// 사용자는 아무것도 수정할 필요 없음!
```

### 성공 기준
- [ ] 용어 변경 자동 감지
- [ ] Alias 기반 하위 호환성
- [ ] 기존 링크 자동 유지
- [ ] rename_history 기록

---

## 🎯 Phase 5-6: Index Synchronization & Validation

### 목표
Index와 실제 파일 간의 불일치 자동 감지 및 수정

### 구현 계획

#### 1단계: 검증
```javascript
async validateIndexConsistency() {
  const index = loadIndex();
  const actualFiles = getAllGlossaryFiles();

  const issues = {
    missingFiles: [],      // Index에만 있음
    orphanedFiles: [],     // 파일에만 있음
    invalidEntries: []     // 손상된 항목
  };

  // 검증 로직...

  return issues;
}
```

#### 2단계: 자동 수정
```javascript
async fixInconsistencies(issues) {
  // 파일이 없으면 Index에서 제거
  issues.missingFiles.forEach(entry => {
    removeFromIndex(entry);
  });

  // 고아 파일이 있으면 Index에 추가
  issues.orphanedFiles.forEach(filePath => {
    addToIndex(filePath);
  });

  // Index 재저장
  await saveIndex();
}
```

### 성공 기준
- [ ] Index와 파일 비교 검증
- [ ] 불일치 자동 감지
- [ ] 자동 수정 (Level 1)
- [ ] 수동 복구 (Level 3)

---

## 📊 구현 우선순위 및 일정

### 추천 순서

**주 1 (2025-10-23 ~ 10-24)**
- [ ] **Phase 5-4: Cleanup System** (우선순위 높음)
  - 0회 참조 정리 시스템 구축
  - 정기 실행 스케줄 설정

**주 2 (2025-10-24 ~ 10-25)**
- [ ] **Phase 5-2: Creation Agent**
  - Keyword Extraction 확장
  - 자동 Glossary 파일 생성

**주 3 (2025-10-25 이후)**
- [ ] **Phase 5-3: Update Agent**
- [ ] **Phase 5-5: Term Change Detection**
- [ ] **Phase 5-6: Index Validation**

---

## 🔌 통합 전략

### Pipeline 수정 (권장)
```
기존: Normalization → KeywordExt → Linking → Tagging → Filing

확장: Normalization → KeywordExt → Linking → Tagging → Filing
                         ↓
                 ✨ Glossary Creation ← (NEW)
                         ↓
                    Glossary Linking
```

### 정기 작업 스케줄 (권장)
```javascript
// 하루 1회
schedule('0 2 * * *', async () => {
  // 참조 횟수 계산
  await glossaryReferenceCounter.countAllReferences();

  // Glossary 업데이트
  await glossaryUpdateAgent.updateAll();

  // 정리 감지
  const unused = await glossaryCleanupSystem.detectUnused();
  if (unused.length > 0) {
    await generateReport(unused);
  }
});
```

---

## 💡 구현 팁

### 1. 점진적 구현
```javascript
// Phase 5-1 완료 상태에서 시작
✅ Reference Counting (이미 작동)
✅ CLI 명령어 (이미 작동)
✅ Frontmatter 업데이트 (이미 작동)

이제부터:
⏳ Creation Agent
⏳ Cleanup System
⏳ Update Agent
...
```

### 2. 테스트 문서 활용
```javascript
// test-glossary-references.md 처럼
// 각 Phase마다 테스트 문서 생성
// 자동화된 검증 가능
```

### 3. 에러 처리
```javascript
// 모든 Phase는 실패해도 다른 작업 계속
try {
  await glossaryCreationAgent.run();
} catch (error) {
  logWarning(`Creation failed: ${error.message}`);
  // 다른 작업 계속 진행
}
```

### 4. 로깅 및 모니터링
```javascript
// 각 작업마다 상세 로그
- 처리된 항목 수
- 생성/수정/삭제된 항목
- 에러 및 경고
- 처리 시간
```

---

## 🎯 최종 목표 (Phase 5 완료)

```
완전 자동화된 Glossary 관리 시스템
├── 자동 생성: 새 개념 발견 시 파일 자동 생성
├── 자동 업데이트: 참조 증가 시 내용 보강
├── 자동 정리: 0회 참조 시 아카이브
├── 자동 변경 감지: 용어 변경 시 Alias 추가
└── 자동 동기화: Index와 파일 일관성 유지

🎉 LLM이 운영하는 지식 정원!
```

---

## 📚 참고 자료

- [`PHASE5-IMPLEMENTATION-PLAN.md`](./PHASE5-IMPLEMENTATION-PLAN.md) - 전체 설계
- [`glossary-reference-counter.js`](../.obsidian/scripts/glossary-reference-counter.js) - Phase 5-1 구현
- [`system-design-discussion-summary.md`](./system-design-discussion-summary.md) - 설계 철학

---

**다음 단계:** Phase 5-4 또는 5-2 중 선택하여 구현 시작!