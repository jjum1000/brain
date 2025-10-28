/**
 * Firestore Document Schemas
 * YOLOSEUM 프로젝트 데이터 스키마 정의
 */

/**
 * User Schema
 * Description: 일반 사용자 (Supporter, Spectator)의 기본 정보
 * Collection: /users/{uid}
 */
export const UserSchema = {
  uid: String,           // Firebase Auth UID
  email: String,         // 이메일 (고유값)
  displayName: String,   // 표시 이름
  photoURL: String,      // 프로필 사진 URL
  role: String,          // 'supporter' | 'trader' | 'spectator'
  walletAddress: String, // Solana 지갑 주소
  bio: String,           // 자기소개
  createdAt: 'Timestamp',  // 가입 날짜
  updatedAt: 'Timestamp',  // 수정 날짜
  stats: {
    totalInvested: Number,   // 총 투자액 (달러)
    totalEarnings: Number,   // 총 수익 (달러)
    favoriteTraders: Array,  // 즐겨찾기 트레이더 UID 배열
    followingCount: Number,  // 팔로우 수
  },
  preferences: {
    notifications: Boolean,  // 알림 활성화
    theme: String,          // 'light' | 'dark'
    language: String        // 'ko' | 'en'
  },
  verified: Boolean,        // 본인인증 여부
  verifiedAt: 'Timestamp',  // 본인인증 날짜
  kycStatus: String         // 'pending' | 'approved' | 'rejected'
};

/**
 * Trader Schema
 * Description: 트레이더 프로필 정보 및 성과
 * Collection: /traders/{uid}
 */
export const TraderSchema = {
  uid: String,               // User UID (트레이더의 uid와 동일)
  displayName: String,       // 트레이더 이름
  bio: String,               // 트레이더 소개
  avatar: String,            // 프로필 이미지 URL
  youtubeUrl: String,        // 유튜브 채널 URL
  twitterUrl: String,        // 트위터 URL
  discordUsername: String,   // 디스코드 사용자명
  followerCount: Number,     // 팔로워 수
  createdAt: 'Timestamp',    // 트레이더 등록 날짜
  verifiedAt: 'Timestamp',   // 검증 날짜
  verification: {
    status: String,          // 'pending' | 'verified' | 'rejected'
    submittedAt: 'Timestamp',
    rejectionReason: String  // 거절 사유
  },
  performance: {
    totalTrades: Number,      // 총 거래수
    totalWins: Number,        // 승리 수
    totalLosses: Number,      // 패배 수
    winRate: Number,          // 승률 (0-100 범위)
    avgROI: Number,           // 평균 ROI (%)
    maxDrawdown: Number,      // 최대 낙폭 (%)
    sharpeRatio: Number,      // 샤프 지수
    updatedAt: 'Timestamp'    // 성과 업데이트 날짜
  },
  rating: {
    averageRating: Number,    // 평균 평점 (1-5)
    ratingCount: Number,      // 평점 받은 수
    communityScore: Number    // 커뮤니티 점수
  }
};

/**
 * Strategy Schema
 * Description: 거래 전략 정보 및 성과
 * Collection: /strategies/{strategyId}
 */
export const StrategySchema = {
  id: String,              // Strategy ID (nanoid)
  traderId: String,        // 트레이더 UID
  traderName: String,      // 트레이더 이름 (빠른 조회용)
  name: String,            // 전략 이름
  description: String,     // 전략 설명
  category: String,        // 'momentum' | 'contrarian' | 'scalping' | 'grid' | 'hedging'
  risk: String,            // 'low' | 'medium' | 'high'
  createdAt: 'Timestamp',  // 생성 날짜
  updatedAt: 'Timestamp',  // 수정 날짜
  execution: {
    smartContractAddress: String,  // Smart Contract 주소
    network: String,               // 'solana' | 'ethereum'
    tvl: Number,                   // Total Value Locked (달러)
    supporterCount: Number,        // 지원자 수
    status: String                 // 'active' | 'paused' | 'closed'
  },
  performance: {
    currentROI: Number,      // 현재 ROI (%)
    roi30d: Number,          // 30일 ROI (%)
    roi90d: Number,          // 90일 ROI (%)
    winRate: Number,         // 승률 (%)
    totalTrades: Number,     // 거래 수
    maxDrawdown: Number,     // 최대 낙폭 (%)
    sharpeRatio: Number,     // 샤프 지수
    profitFactor: Number,    // 손익비
    lastUpdated: 'Timestamp' // 마지막 업데이트
  },
  rules: {
    entryCondition: String,   // 진입 조건 (JSON 형식)
    exitCondition: String,    // 청산 조건 (JSON 형식)
    stopLoss: Number,         // 손절 레벨 (%)
    takeProfit: Number,       // 익절 레벨 (%)
    maxPosition: Number       // 최대 포지션 크기 (%)
  },
  backtesting: {
    period: String,           // '1y' | '6m' | '3m' | '1m'
    accuracy: Number,         // 정확도 (%)
    results: Object,          // 백테스트 결과 (JSON)
    timestamp: 'Timestamp'    // 백테스트 실행 시간
  }
};

/**
 * Support/Investment Schema
 * Description: 사용자의 전략에 대한 투자 정보
 * Collection: /supporters/{supportId}
 */
export const SupportSchema = {
  id: String,              // Support ID (nanoid)
  userId: String,          // 투자자 UID
  traderId: String,        // 트레이더 UID
  strategyId: String,      // 전략 ID
  investmentAmount: Number, // 투자액 (달러)
  investedAt: 'Timestamp', // 투자 날짜
  currency: String,        // 'SOL' | 'USDC' | 'USD'
  status: String,          // 'active' | 'closed' | 'exited'
  returns: {
    earned: Number,        // 벌어들인 수익 (달러)
    roi: Number,           // ROI (%)
    realized: Number,      // 실현 수익 (달러)
    unrealized: Number,    // 미실현 수익 (달러)
    lastUpdated: 'Timestamp' // 마지막 업데이트
  },
  contract: {
    address: String,       // Smart Contract 주소
    txHash: String,        // 거래 해시
    blockNumber: Number    // 블록 번호
  },
  notes: String            // 메모
};

/**
 * Leaderboard Schema
 * Description: 주간/월간 리더보드
 * Collection: /leaderboard/{periodId}
 */
export const LeaderboardSchema = {
  id: String,              // Period ID (예: week_2025_01, month_2025_01)
  period: {
    type: String,          // 'weekly' | 'monthly' | 'seasonal'
    startDate: 'Timestamp',
    endDate: 'Timestamp',
    season: String         // (선택) 시즌 이름
  },
  rankings: Array,         // 랭킹 배열 - 빠른 조회를 위해 배열로 저장
  // rankings[0] = {
  //   rank: Number,
  //   traderId: String,
  //   traderName: String,
  //   roi: Number,
  //   wins: Number,
  //   totalTrades: Number
  // }
  totalStrategies: Number,
  totalTraders: Number,
  totalSupporters: Number,
  totalVolume: Number,     // 총 거래액 (달러)
  updatedAt: 'Timestamp'   // 마지막 업데이트
};

/**
 * Transaction Schema
 * Description: 사용자의 거래 내역
 * Collection: /transactions/{txId}
 */
export const TransactionSchema = {
  id: String,              // Transaction ID (nanoid)
  userId: String,          // 사용자 UID
  strategyId: String,      // 전략 ID
  type: String,            // 'deposit' | 'withdraw' | 'profit' | 'loss'
  amount: Number,          // 거래액 (달러)
  currency: String,        // 'SOL' | 'USDC' | 'USD'
  status: String,          // 'pending' | 'completed' | 'failed'
  txHash: String,          // 블록체인 거래 해시
  createdAt: 'Timestamp',  // 거래 생성 날짜
  completedAt: 'Timestamp' // 거래 완료 날짜
};

/**
 * Review Schema
 * Description: 트레이더 또는 전략에 대한 리뷰
 * Collection: /reviews/{reviewId}
 */
export const ReviewSchema = {
  id: String,              // Review ID (nanoid)
  reviewerId: String,      // 리뷰 작성자 UID
  traderId: String,        // (선택) 평가 대상 트레이더 UID
  strategyId: String,      // (선택) 평가 대상 전략 ID
  rating: Number,          // 평점 (1-5)
  title: String,           // 제목
  content: String,         // 리뷰 내용
  verified: Boolean,       // 실제 투자자 여부
  investmentAmount: Number, // 투자액 (검증용)
  helpful: Number,         // 도움됨 수
  createdAt: 'Timestamp',  // 작성 날짜
  updatedAt: 'Timestamp'   // 수정 날짜
};
