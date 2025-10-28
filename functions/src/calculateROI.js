/**
 * calculateROI
 * Strategy 데이터 변경시 ROI 자동 계산
 */

const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * ROI 자동 계산 함수
 * Strategy 문서 변경시 트리거됨
 */
async function calculateROI(change, context) {
  try {
    const strategyId = context.params.strategyId;
    const newData = change.after.data();
    const oldData = change.before.data();

    if (!newData) return; // 삭제된 경우

    console.log(`📈 Calculating ROI for strategy: ${strategyId}`);

    // Performance 데이터 조회
    const performance = newData.performance || {};

    // 기본값 설정
    const roi = calculateROIValue(performance);
    const roi30d = calculate30dROI(performance);
    const roi90d = calculate90dROI(performance);
    const sharpeRatio = calculateSharpeRatio(performance);

    // 업데이트할 데이터
    const updateData = {
      'performance.currentROI': roi,
      'performance.roi30d': roi30d,
      'performance.roi90d': roi90d,
      'performance.sharpeRatio': sharpeRatio,
      'performance.lastUpdated': admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };

    // 트레이더 성과 업데이트
    if (newData.traderId) {
      await updateTraderPerformance(newData.traderId, roi, performance.winRate);
    }

    // Strategy 업데이트
    await db.collection('strategies').doc(strategyId).update(updateData);

    console.log(`✅ ROI calculated: ${roi.toFixed(2)}%`);
    return { success: true, roi, roi30d, roi90d, sharpeRatio };

  } catch (error) {
    console.error('❌ Error calculating ROI:', error);
    // 에러 로깅하지만 함수 실패로 처리하지 않음
    return { success: false, error: error.message };
  }
}

/**
 * 현재 ROI 계산
 * 수익 / 투자금 * 100
 */
function calculateROIValue(performance) {
  if (!performance.totalTrades || performance.totalTrades === 0) return 0;
  const profitPercentage = (performance.totalWins / performance.totalTrades) * 100;
  return profitPercentage;
}

/**
 * 30일 ROI 계산
 */
function calculate30dROI(performance) {
  // 실제 구현에서는 최근 30일 거래 데이터 분석
  // 현재는 Mock 값 반환
  return (performance.roi30d || 0);
}

/**
 * 90일 ROI 계산
 */
function calculate90dROI(performance) {
  // 실제 구현에서는 최근 90일 거래 데이터 분석
  // 현재는 Mock 값 반환
  return (performance.roi90d || 0);
}

/**
 * Sharpe Ratio 계산
 * (포트폴리오 수익률 - 무위험율) / 표준편차
 */
function calculateSharpeRatio(performance) {
  // 실제 구현에서는 복잡한 통계 계산 필요
  // 현재는 Mock 값 반환
  const riskFreeRate = 0.02; // 2% 무위험율
  const volatility = Math.sqrt(performance.maxDrawdown || 0);

  if (volatility === 0) return 0;

  const excessReturn = (performance.currentROI || 0) - riskFreeRate;
  return excessReturn / volatility;
}

/**
 * 트레이더 성과 업데이트
 */
async function updateTraderPerformance(traderId, strategyROI, winRate) {
  try {
    const traderRef = db.collection('traders').doc(traderId);
    const traderDoc = await traderRef.get();

    if (!traderDoc.exists) return;

    const trader = traderDoc.data();
    const totalTrades = trader.performance?.totalTrades || 0;
    const totalWins = trader.performance?.totalWins || 0;

    // 평균 ROI 계산
    const avgROI = totalTrades === 0
      ? strategyROI
      : ((trader.performance?.avgROI || 0) + strategyROI) / 2;

    const overallWinRate = totalTrades === 0
      ? winRate || 0
      : ((trader.performance?.winRate || 0) + winRate) / 2;

    await traderRef.update({
      'performance.avgROI': avgROI,
      'performance.winRate': overallWinRate,
      'performance.updatedAt': admin.firestore.Timestamp.now()
    });

    console.log(`✅ Trader performance updated: ${traderId}`);
  } catch (error) {
    console.error('Error updating trader performance:', error);
  }
}

module.exports = { calculateROI };
