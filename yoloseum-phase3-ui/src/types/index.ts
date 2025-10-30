// Export all authentication types
export type * from "./auth";

// Export all wallet types
export type * from "./wallet";

// Export all Firestore types
export type {
  // User types
  User,
  UserStats,
  UserPreferences,
  // Trader types
  Trader,
  TraderVerification,
  TraderPerformance,
  TraderRating,
  // Strategy types
  Strategy,
  StrategyExecution,
  StrategyPerformance,
  StrategyRules,
  BacktestingResults,
  // Support types
  Support,
  SupportReturns,
  SupportContract,
  // Leaderboard types
  Leaderboard,
  LeaderboardPeriod,
  LeaderboardRankingEntry,
  // Transaction types
  Transaction,
  // Review types
  Review,
  // Collection mapping
  FirestoreCollections,
  // Utility types
  PaginatedResult,
  QueryOptions,
  RealtimeUpdate,
  // UI display types
  DashboardStats,
  TraderCard,
  TransactionRow,
  LeaderboardEntryDisplay,
} from "./firestore";

// Export Firestore utilities
export { FirebaseTimestamp } from "./firestore";

// Re-export everything for convenience
export * from "./auth";
export * from "./firestore";
