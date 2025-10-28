/**
 * updateLeaderboard
 * 리더보드 자동 업데이트 함수
 * 매시간 실행 - 모든 전략의 성과 순서로 리더보드 생성
 */

const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * 리더보드 업데이트 메인 함수
 */
async function updateLeaderboard(context) {
  try {
    console.log('📊 Starting leaderboard update...');

    // 1. 모든 활성 전략 조회
    const strategiesSnapshot = await db
      .collection('strategies')
      .where('execution.status', '==', 'active')
      .orderBy('performance.currentROI', 'desc')
      .limit(100)
      .get();

    if (strategiesSnapshot.empty) {
      console.log('⚠️ No active strategies found');
      return;
    }

    // 2. 리더보드 데이터 생성
    const rankings = [];
    const now = admin.firestore.Timestamp.now();
    let rank = 1;

    for (const doc of strategiesSnapshot.docs) {
      const strategy = doc.data();
      const traderSnapshot = await db
        .collection('traders')
        .doc(strategy.traderId)
        .get();

      const trader = traderSnapshot.data() || {};

      rankings.push({
        rank: rank++,
        strategyId: strategy.id,
        strategyName: strategy.name,
        traderId: strategy.traderId,
        traderName: trader.displayName || 'Unknown',
        traderAvatar: trader.avatar || '',
        performance: {
          currentROI: strategy.performance.currentROI,
          roi30d: strategy.performance.roi30d,
          roi90d: strategy.performance.roi90d,
          winRate: strategy.performance.winRate,
          sharpeRatio: strategy.performance.sharpeRatio,
          maxDrawdown: strategy.performance.maxDrawdown
        },
        execution: {
          tvl: strategy.execution.tvl,
          supporterCount: strategy.execution.supporterCount
        },
        updatedAt: now
      });
    }

    // 3. 주간 리더보드 생성/업데이트
    const weekId = generateWeekId();
    await db.collection('leaderboard').doc(weekId).set({
      id: weekId,
      type: 'weekly',
      period: {
        startDate: getWeekStart(),
        endDate: getWeekEnd(),
        weekNumber: getWeekNumber()
      },
      rankings: rankings,
      totalStrategies: strategiesSnapshot.size,
      statistics: {
        averageROI: calculateAverageROI(rankings),
        totalTVL: rankings.reduce((sum, r) => sum + r.execution.tvl, 0),
        totalSupporters: rankings.reduce((sum, r) => sum + r.execution.supporterCount, 0)
      },
      updatedAt: now
    }, { merge: true });

    // 4. 월간 리더보드 생성/업데이트 (매월 1일에만)
    if (new Date().getDate() === 1) {
      const monthId = generateMonthId();
      await db.collection('leaderboard').doc(monthId).set({
        id: monthId,
        type: 'monthly',
        period: {
          startDate: getMonthStart(),
          endDate: getMonthEnd(),
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        },
        rankings: rankings,
        totalStrategies: strategiesSnapshot.size,
        statistics: {
          averageROI: calculateAverageROI(rankings),
          totalTVL: rankings.reduce((sum, r) => sum + r.execution.tvl, 0),
          totalSupporters: rankings.reduce((sum, r) => sum + r.execution.supporterCount, 0)
        },
        updatedAt: now
      }, { merge: true });
    }

    console.log(`✅ Leaderboard updated: ${rankings.length} strategies`);
    return { success: true, updatedCount: rankings.length };

  } catch (error) {
    console.error('❌ Error updating leaderboard:', error);
    throw error;
  }
}

/**
 * 헬퍼 함수들
 */
function generateWeekId() {
  const date = new Date();
  const year = date.getFullYear();
  const week = getWeekNumber();
  return `week_${year}_${week}`;
}

function generateMonthId() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `month_${year}_${month}`;
}

function getWeekNumber() {
  const date = new Date();
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function getWeekStart() {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return admin.firestore.Timestamp.fromDate(new Date(date.setDate(diff)));
}

function getWeekEnd() {
  const date = new Date();
  const diff = date.getDate() - date.getDay() + 7;
  return admin.firestore.Timestamp.fromDate(new Date(date.setDate(diff)));
}

function getMonthStart() {
  const date = new Date();
  return admin.firestore.Timestamp.fromDate(new Date(date.getFullYear(), date.getMonth(), 1));
}

function getMonthEnd() {
  const date = new Date();
  return admin.firestore.Timestamp.fromDate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

function calculateAverageROI(rankings) {
  if (rankings.length === 0) return 0;
  const total = rankings.reduce((sum, r) => sum + r.performance.currentROI, 0);
  return total / rankings.length;
}

module.exports = { updateLeaderboard };
