# 🔄 배포 롤백 절차서

**목적**: 배포 문제 발생 시 안전하게 이전 버전으로 복구
**대상**: Firebase Hosting, Cloud Functions, Firestore
**긴급도**: 🔴 높음

---

## 🆘 즉각적 대응

### 1. 현재 상황 파악 (5분)

```bash
# 배포 상태 확인
firebase hosting:releases:list

# 최근 에러 확인
firebase functions:log | head -50

# Sentry 에러 확인
# https://sentry.io/organizations/your-org
```

### 2. 영향도 평가

| 서비스 | 영향도 | 대응 방법 |
|--------|--------|---------|
| Hosting (웹사이트) | 높음 | 즉시 롤백 |
| Functions | 중간 | 함수별 롤백 |
| Firestore | 낮음 | 데이터 백업에서 복구 |

---

## 🔙 롤백 절차

### Firebase Hosting 롤백

```bash
# 배포 히스토리 확인
firebase hosting:releases:list

# 출력 예시:
# Version  | Status | Message | Create Time
# abc123   | FINALIZED | | 2025-11-02 10:00:00
# def456   | FINALIZED | | 2025-11-01 14:30:00

# 이전 버전으로 롤백
firebase hosting:channels:deploy <VERSION>

# 또는 구체적으로
firebase deploy --only hosting --version abc123
```

### Cloud Functions 롤백

```bash
# 배포된 함수 목록
firebase functions:list

# 특정 함수 삭제 (배포 취소)
firebase functions:delete updateLeaderboard --region us-central1

# 이전 버전 배포
firebase deploy --only functions:updateLeaderboard
```

### 전체 배포 롤백

```bash
# 모든 서비스 롤백
firebase hosting:releases:list
firebase deploy --only hosting --version <PREVIOUS_VERSION>
firebase deploy --only functions
firebase deploy --only firestore:rules
```

---

## 💾 데이터 복구

### Firestore 백업에서 복구

```bash
# Google Cloud Console에서
# Firestore Database → 백업 → 복구

# 또는 CLI
gcloud firestore backups restore <BACKUP_ID> --collection-ids=users,traders,strategies
```

---

## ✅ 롤백 완료 확인

```bash
# 1. 웹사이트 접근 확인
https://yoloseum.web.app

# 2. 기본 기능 테스트
# - 로그인
# - 데이터 로드
# - 거래 기능

# 3. 에러 로그 확인
firebase functions:log

# 4. 성능 메트릭 확인
firebase open hosting:analytics
```

---

## 📞 상황별 대응

### 상황 1: 새 버전에 버그가 있음

```bash
# 즉시 조치
firebase hosting:releases:list
firebase deploy --only hosting --version <STABLE_VERSION>

# 원인 분석
firebase functions:log | grep -i error

# 수정
git revert <BAD_COMMIT>
npm run build
firebase deploy
```

### 상황 2: Firestore 규칙이 잘못됨

```bash
# 이전 규칙으로 복구
firebase deploy --only firestore:rules

# 확인
firebase firestore:rules:get
```

### 상황 3: 함수가 에러를 반환

```bash
# 함수 로그 확인
firebase functions:log --limit 50 | grep -i error

# 함수 재배포
firebase deploy --only functions:updateLeaderboard

# 또는 함수 비활성화
firebase functions:delete updateLeaderboard
```

---

## 🚨 긴급 대응

### 수동 롤백 (Firebase Console)

1. [Firebase Console](https://console.firebase.google.com) 접속
2. yoloseum-3bebc 프로젝트 선택
3. Hosting → Releases
4. 이전 버전의 "⋯" 클릭
5. "Rollback to version" 선택

### 즉시 배포 중지

```bash
# 진행 중인 배포 취소
firebase deploy --cancel
```

---

## 📋 롤백 후 체크리스트

- [ ] 웹사이트 접근 확인
- [ ] 기본 기능 테스트
- [ ] 에러 로그 확인
- [ ] 성능 메트릭 정상
- [ ] 사용자 데이터 무결성 확인
- [ ] Sentry 에러율 감소
- [ ] 팀원에 공지

---

**주의**: 롤백 후 문제의 원인을 분석하고 향후 예방 조치를 수립해야 합니다.

---

**작성**: Claude AI
**최종 업데이트**: 2025-11-01
