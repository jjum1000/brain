/**
 * distributeProfit
 * 매일 수익 배분 함수
 * 지원자들에게 수익금 배분
 */

const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * 수익 배분 메인 함수
 * 매일 자정에 실행
 */
async function distributeProfit(context) {
  try {
    console.log('💰 Starting profit distribution...');

    const now = admin.firestore.Timestamp.now();
    const batchSize = 500; // Firestore 배치 크기 제한
    let batch = db.batch();
    let operationCount = 0;

    // 1. 활성 Strategy 조회
    const strategiesSnapshot = await db
      .collection('strategies')
      .where('execution.status', '==', 'active')
      .get();

    console.log(`📊 Found ${strategiesSnapshot.size} active strategies`);

    // 2. 각 Strategy의 Supporter에게 수익 배분
    for (const strategyDoc of strategiesSnapshot.docs) {
      const strategy = strategyDoc.data();

      // 3. 해당 Strategy의 모든 Supporter 조회
      const supportersSnapshot = await db
        .collection('supporters')
        .where('strategyId', '==', strategy.id)
        .where('investment.status', '==', 'active')
        .get();

      console.log(`👥 Strategy ${strategy.id}: ${supportersSnapshot.size} supporters`);

      // 4. 각 Supporter에게 수익 배분
      for (const supporterDoc of supportersSnapshot.docs) {
        const supporter = supporterDoc.data();

        // 배분액 계산
        const profitShare = calculateProfitShare(
          supporter.investment.amount,
          strategy.execution.tvl,
          strategy.performance.currentROI
        );

        if (profitShare > 0) {
          const transactionId = db.collection('transactions').doc().id;

          // Transaction 생성
          batch.set(db.collection('transactions').doc(transactionId), {
            id: transactionId,
            userId: supporter.userId,
            traderId: strategy.traderId,
            strategyId: strategy.id,
            type: 'profit_distribution',
            amount: profitShare,
            currency: 'USDT',
            status: 'completed',
            timestamp: now,
            supporterId: supporterDoc.id,
            metadata: {
              roi: strategy.performance.currentROI,
              investmentAmount: supporter.investment.amount,
              tvl: strategy.execution.tvl
            }
          });

          // Supporter의 수익 업데이트
          batch.update(db.collection('supporters').doc(supporterDoc.id), {
            'returns.earned': (supporter.returns?.earned || 0) + profitShare,
            'returns.roi': calculateROI(
              supporter.investment.amount,
              (supporter.returns?.earned || 0) + profitShare
            ),
            'returns.lastUpdated': now
          });

          // User 통계 업데이트
          batch.update(db.collection('users').doc(supporter.userId), {
            'stats.totalEarnings': (supporter.investment.totalEarnings || 0) + profitShare,
            updatedAt: now
          });

          operationCount += 3;

          // 배치 크기 도달시 커밋
          if (operationCount >= batchSize) {
            await batch.commit();
            batch = db.batch();
            operationCount = 0;
          }
        }
      }
    }

    // 남은 작업 커밋
    if (operationCount > 0) {
      await batch.commit();
    }

    console.log(`✅ Profit distribution completed: ${operationCount} operations`);
    return { success: true, operationCount };

  } catch (error) {
    console.error('❌ Error distributing profit:', error);
    throw error;
  }
}

/**
 * 수익 배분액 계산
 * 지원자의 투자금 비율만큼 수익 배분
 */
function calculateProfitShare(investmentAmount, totalTVL, strategyROI) {
  if (totalTVL === 0 || strategyROI === 0) return 0;

  const investmentRatio = investmentAmount / totalTVL;
  const strategyProfit = totalTVL * (strategyROI / 100);
  const profitShare = strategyProfit * investmentRatio;

  // 플랫폼 수수료 제외 (20%)
  const platformFee = profitShare * 0.20;
  return profitShare - platformFee;
}

/**
 * ROI 계산
 */
function calculateROI(investmentAmount, earnings) {
  if (investmentAmount === 0) return 0;
  return ((earnings / investmentAmount) * 100);
}

module.exports = { distributeProfit };
