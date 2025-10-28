/**
 * Firestore Collections & Sub-collections 정의
 * YOLOSEUM 프로젝트 데이터베이스 구조
 */

export const COLLECTIONS = {
  USERS: 'users',           // 사용자 정보
  TRADERS: 'traders',       // 트레이더 프로필
  STRATEGIES: 'strategies', // 거래 전략
  LEADERBOARD: 'leaderboard', // 리더보드
  SUPPORTERS: 'supporters', // 펀딩 정보
  TRANSACTIONS: 'transactions', // 거래 내역
  RANKINGS: 'rankings',     // 순위 정보
  REVIEWS: 'reviews'        // 리뷰
};

export const SUB_COLLECTIONS = {
  // /traders/{traderId}/performance - 트레이더 성과 기록
  PERFORMANCE: 'performance',

  // /strategies/{strategyId}/trades - 전략별 거래 기록
  TRADES: 'trades',

  // /strategies/{strategyId}/metrics - 전략 메트릭
  METRICS: 'metrics'
};

/**
 * Collection 구조:
 *
 * /users/{uid}
 *   └─ 사용자 기본 정보 및 설정
 *
 * /traders/{uid}
 *   └─ 트레이더 프로필 및 성과
 *   └─ /performance/{docId} - 성과 기록
 *
 * /strategies/{strategyId}
 *   └─ 전략 정보 및 성과
 *   └─ /trades/{tradeId} - 거래 기록
 *   └─ /metrics/{metricId} - 메트릭 데이터
 *
 * /supporters/{supportId}
 *   └─ 사용자의 펀딩 정보
 *
 * /transactions/{txId}
 *   └─ 거래 기록
 *
 * /leaderboard/{periodId}
 *   └─ 주간/월간 리더보드
 *
 * /rankings/{rankingId}
 *   └─ 종합 순위 정보
 *
 * /reviews/{reviewId}
 *   └─ 트레이더/전략 리뷰
 */
