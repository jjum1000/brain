import type { Timestamp } from "firebase/firestore";

/**
 * User Stats - 사용자의 투자 통계
 */
export interface UserStats {
  totalInvested: number;
  totalEarnings: number;
  favoriteTraders: string[];
  followingCount: number;
}

/**
 * User Preferences - 사용자 설정
 */
export interface UserPreferences {
  notifications: boolean;
  theme: "light" | "dark";
  language: "ko" | "en";
}

/**
 * User Document - 일반 사용자 (Supporter, Spectator)
 * Collection: /users/{uid}
 */
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: "supporter" | "trader" | "spectator";
  walletAddress: string | null;
  bio: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  stats: UserStats;
  preferences: UserPreferences;
  verified: boolean;
  verifiedAt: Timestamp | null;
  kycStatus: "pending" | "approved" | "rejected";
}

/**
 * Trader Verification - 트레이더 검증 정보
 */
export interface TraderVerification {
  status: "pending" | "verified" | "rejected";
  submittedAt: Timestamp | null;
  rejectionReason: string | null;
}

/**
 * Trader Performance - 트레이더 성과
 */
export interface TraderPerformance {
  totalTrades: number;
  totalWins: number;
  totalLosses: number;
  winRate: number; // 0-100
  avgROI: number; // %
  maxDrawdown: number; // %
  sharpeRatio: number;
  updatedAt: Timestamp;
}

/**
 * Trader Rating - 트레이더 평점
 */
export interface TraderRating {
  averageRating: number; // 1-5
  ratingCount: number;
  communityScore: number;
}

/**
 * Trader Document - 트레이더 프로필
 * Collection: /traders/{uid}
 */
export interface Trader {
  uid: string;
  displayName: string;
  bio: string;
  avatar: string | null;
  youtubeUrl: string | null;
  twitterUrl: string | null;
  discordUsername: string | null;
  followerCount: number;
  createdAt: Timestamp;
  verifiedAt: Timestamp | null;
  verification: TraderVerification;
  performance: TraderPerformance;
  rating: TraderRating;
}

/**
 * Strategy Execution - 전략 실행 정보
 */
export interface StrategyExecution {
  smartContractAddress: string;
  network: "solana" | "ethereum";
  tvl: number; // Total Value Locked
  supporterCount: number;
  status: "active" | "paused" | "closed";
}

/**
 * Strategy Performance - 전략 성과
 */
export interface StrategyPerformance {
  currentROI: number; // %
  roi30d: number; // %
  roi90d: number; // %
  winRate: number; // %
  totalTrades: number;
  maxDrawdown: number; // %
  sharpeRatio: number;
  profitFactor: number;
  lastUpdated: Timestamp;
}

/**
 * Strategy Rules - 전략 규칙
 */
export interface StrategyRules {
  entryCondition: string; // JSON format
  exitCondition: string; // JSON format
  stopLoss: number; // %
  takeProfit: number; // %
  maxPosition: number; // %
}

/**
 * Backtesting Results - 백테스트 결과
 */
export interface BacktestingResults {
  period: "1y" | "6m" | "3m" | "1m";
  accuracy: number; // %
  results: Record<string, unknown>; // JSON results
  timestamp: Timestamp;
}

/**
 * Strategy Document - 거래 전략
 * Collection: /strategies/{strategyId}
 */
export interface Strategy {
  id: string;
  traderId: string;
  traderName: string;
  name: string;
  description: string;
  category: "momentum" | "contrarian" | "scalping" | "grid" | "hedging";
  risk: "low" | "medium" | "high";
  youtubeUrl?: string;
  youtubeTitle?: string;
  youtubeDescription?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  execution: StrategyExecution;
  performance: StrategyPerformance;
  rules: StrategyRules;
  backtesting: BacktestingResults;
}

/**
 * Support Returns - 투자 수익 정보
 */
export interface SupportReturns {
  earned: number; // USD
  roi: number; // %
  realized: number; // USD
  unrealized: number; // USD
  lastUpdated: Timestamp;
}

/**
 * Support Contract - Smart Contract 정보
 */
export interface SupportContract {
  address: string;
  txHash: string;
  blockNumber: number;
}

/**
 * Support Document - 사용자 투자 정보
 * Collection: /supporters/{supportId}
 */
export interface Support {
  id: string;
  userId: string;
  traderId: string;
  strategyId: string;
  investmentAmount: number; // USD
  investedAt: Timestamp;
  currency: "SOL" | "USDC" | "USD";
  status: "active" | "closed" | "exited";
  returns: SupportReturns;
  contract: SupportContract;
  notes: string | null;
}

/**
 * Leaderboard Period - 리더보드 기간 정보
 */
export interface LeaderboardPeriod {
  type: "weekly" | "monthly" | "seasonal";
  startDate: Timestamp;
  endDate: Timestamp;
  season: string | null;
}

/**
 * Leaderboard Ranking Entry - 리더보드 순위 항목
 */
export interface LeaderboardRankingEntry {
  rank: number;
  traderId: string;
  traderName: string;
  roi: number;
  wins: number;
  totalTrades: number;
  winRate: number;
}

/**
 * Leaderboard Document - 주간/월간 리더보드
 * Collection: /leaderboard/{periodId}
 */
export interface Leaderboard {
  id: string;
  period: LeaderboardPeriod;
  rankings: LeaderboardRankingEntry[];
  totalStrategies: number;
  totalTraders: number;
  totalSupporters: number;
  totalVolume: number; // USD
  updatedAt: Timestamp;
}

/**
 * Transaction Document - 거래 내역
 * Collection: /transactions/{txId}
 */
export interface Transaction {
  id: string;
  userId: string;
  strategyId: string;
  type: "deposit" | "withdraw" | "profit" | "loss";
  amount: number; // USD
  currency: "SOL" | "USDC" | "USD";
  status: "pending" | "completed" | "failed";
  txHash: string | null;
  createdAt: Timestamp;
  completedAt: Timestamp | null;
}

/**
 * Review Document - 리뷰
 * Collection: /reviews/{reviewId}
 */
export interface Review {
  id: string;
  reviewerId: string;
  traderId: string | null;
  strategyId: string | null;
  rating: number; // 1-5
  title: string;
  content: string;
  verified: boolean;
  investmentAmount: number;
  helpful: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Firestore Collection Type Mapping
 */
export interface FirestoreCollections {
  users: User;
  traders: Trader;
  strategies: Strategy;
  supporters: Support;
  leaderboard: Leaderboard;
  transactions: Transaction;
  reviews: Review;
}

/**
 * Paginated Result - 페이지네이션 결과
 */
export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  pageSize: number;
  pageNumber: number;
  hasMore: boolean;
}

/**
 * Query Options - 쿼리 옵션
 */
export interface QueryOptions {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
  filters?: Record<string, unknown>;
}

/**
 * Realtime Update - 실시간 업데이트 래퍼
 */
export interface RealtimeUpdate<T> {
  data: T;
  timestamp: Timestamp;
  changeType: "added" | "modified" | "removed";
}

/**
 * Dashboard Stats - Dashboard에 표시할 통계
 */
export interface DashboardStats {
  totalInvested: number;
  totalEarnings: number;
  totalProfit: number;
  winRate: number;
  totalTrades: number;
  averageROI: number;
  currentRank: number;
  activeStrategies: number;
}

/**
 * Trader Card - Trader 카드 표시용 간소화 데이터
 */
export interface TraderCard {
  uid: string;
  displayName: string;
  avatar: string | null;
  winRate: number;
  totalTrades: number;
  profit: string; // formatted
  rank: number;
  followerCount: number;
  verified: boolean;
}

/**
 * Transaction Row - Transaction 테이블 표시용 데이터
 */
export interface TransactionRow {
  id: string;
  token: string;
  type: "buy" | "sell" | "deposit" | "withdraw";
  amount: string; // formatted
  price: string; // formatted
  timestamp: string; // formatted
  status: "completed" | "pending" | "failed";
}

/**
 * Leaderboard Entry - Leaderboard 표시용 데이터
 */
export interface LeaderboardEntryDisplay {
  rank: number;
  traderId: string;
  traderName: string;
  avatar: string | null;
  winRate: number;
  totalTrades: number;
  profit: string; // formatted
  roi: number;
  verified: boolean;
}

/**
 * Timestamp Conversion Utilities
 */
export const FirebaseTimestamp = {
  /**
   * Firestore Timestamp를 JavaScript Date로 변환
   */
  toDate: (timestamp: Timestamp | null): Date | null => {
    return timestamp ? timestamp.toDate() : null;
  },

  /**
   * Firestore Timestamp를 ISO string으로 변환
   */
  toISOString: (timestamp: Timestamp | null): string | null => {
    return timestamp ? timestamp.toDate().toISOString() : null;
  },

  /**
   * Firestore Timestamp를 로컬 날짜 문자열로 변환
   */
  toLocaleDateString: (timestamp: Timestamp | null, locale = "en-US"): string | null => {
    return timestamp ? timestamp.toDate().toLocaleDateString(locale) : null;
  },

  /**
   * Firestore Timestamp를 시간 경과 표시로 변환 (예: "2 hours ago")
   */
  toRelativeTime: (timestamp: Timestamp | null): string | null => {
    if (!timestamp) return null;

    const date = timestamp.toDate();
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return date.toLocaleDateString();
  },
};
