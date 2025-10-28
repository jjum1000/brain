/**
 * Firestore 초기화 스크립트
 * 샘플 데이터로 Firestore 초기화
 *
 * 실행: node scripts/initializeFirestore.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-key.json'); // Firebase service account key

// Firebase 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID || 'yolosseum-3bebc'
});

const db = admin.firestore();

/**
 * 초기 데이터 설정
 */
const SAMPLE_DATA = {
  users: [
    {
      uid: 'user-001',
      email: 'trader1@yoloseum.com',
      displayName: 'Aethelred the Unyielding',
      photoURL: 'https://example.com/avatar1.jpg',
      role: 'trader',
      verified: true,
      walletAddress: 'HN7cABqLq46Es1jh92dQQisAq662SmxELPhPDMrgntEb',
      stats: {
        totalInvested: 0,
        totalEarnings: 0,
        favoriteTraders: [],
        followingCount: 0
      },
      preferences: {
        notifications: true,
        theme: 'dark',
        language: 'ko'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      uid: 'user-002',
      email: 'supporter1@yoloseum.com',
      displayName: 'Julius Caesar',
      photoURL: 'https://example.com/avatar2.jpg',
      role: 'supporter',
      verified: true,
      walletAddress: 'Dn7c9Bpkfh56Fb48TrDiU3yN8thjPqWeFdJhPBmkmo2',
      stats: {
        totalInvested: 10000,
        totalEarnings: 1500,
        favoriteTraders: ['user-001'],
        followingCount: 2
      },
      preferences: {
        notifications: true,
        theme: 'dark',
        language: 'ko'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  traders: [
    {
      uid: 'user-001',
      displayName: 'Aethelred the Unyielding',
      bio: 'Trend following expert with 10+ years of experience',
      avatar: 'https://example.com/avatar1.jpg',
      youtubeUrl: 'https://youtube.com/@aethelred',
      twitterUrl: 'https://twitter.com/aethelred',
      discordUsername: 'Aethelred#1234',
      followerCount: 1284,
      verification: {
        status: 'verified',
        submittedAt: new Date(),
        rejectionReason: null
      },
      performance: {
        totalTrades: 250,
        totalWins: 170,
        totalLosses: 80,
        winRate: 68,
        avgROI: 5.8,
        maxDrawdown: 12.5,
        sharpeRatio: 1.8,
        updatedAt: new Date()
      },
      rating: {
        averageRating: 4.5,
        ratingCount: 45,
        communityScore: 8500
      },
      createdAt: new Date(),
      verifiedAt: new Date()
    }
  ],

  strategies: [
    {
      id: 'strat-001',
      traderId: 'user-001',
      traderName: 'Aethelred the Unyielding',
      name: 'Core Trend Following',
      description: 'Robust trend-following algorithm for sustained market movements',
      category: 'momentum',
      risk: 'medium',
      execution: {
        smartContractAddress: 'TrendFollowV1x2FhD3eQ5nJ9kL0mP2wR4s6t8u9v',
        network: 'solana',
        tvl: 500000,
        supporterCount: 45,
        status: 'active'
      },
      performance: {
        currentROI: 124,
        roi30d: 8.5,
        roi90d: 28.3,
        winRate: 68,
        totalTrades: 250,
        maxDrawdown: 12.5,
        sharpeRatio: 1.8,
        profitFactor: 2.1,
        lastUpdated: new Date()
      },
      rules: {
        entryCondition: 'EMA(20) > EMA(50) on 4H',
        exitCondition: 'Stop loss 2% or Take profit 5%',
        riskManagement: '1.5% max risk per trade',
        leverage: 1
      },
      backtesting: {
        period: '2023-2024',
        accuracy: 92,
        results: 'Passed'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  supporters: [
    {
      userId: 'user-002',
      traderId: 'user-001',
      strategyId: 'strat-001',
      investment: {
        amount: 10000,
        investedAt: new Date(),
        currency: 'USDT',
        status: 'active'
      },
      returns: {
        earned: 1500,
        roi: 15.0,
        lastUpdated: new Date()
      },
      metadata: {
        contract: 'TrendFollowV1x2FhD3eQ5nJ9kL0mP2wR4s6t8u9v',
        txHash: '5RvQ3pK7mN2wX8yZ1aB4cD6eF9gH0jL2nO3pR5sT7u',
        notes: ''
      }
    }
  ]
};

/**
 * 초기화 메인 함수
 */
async function initializeFirestore() {
  try {
    console.log('🚀 Starting Firestore initialization...\n');

    // 1. Users 초기화
    console.log('👥 Initializing Users collection...');
    for (const user of SAMPLE_DATA.users) {
      await db.collection('users').doc(user.uid).set(user);
      console.log(`  ✅ Created user: ${user.displayName}`);
    }

    // 2. Traders 초기화
    console.log('\n👨‍💼 Initializing Traders collection...');
    for (const trader of SAMPLE_DATA.traders) {
      await db.collection('traders').doc(trader.uid).set(trader);
      console.log(`  ✅ Created trader: ${trader.displayName}`);
    }

    // 3. Strategies 초기화
    console.log('\n📊 Initializing Strategies collection...');
    for (const strategy of SAMPLE_DATA.strategies) {
      await db.collection('strategies').doc(strategy.id).set(strategy);
      console.log(`  ✅ Created strategy: ${strategy.name}`);
    }

    // 4. Supporters 초기화
    console.log('\n🤝 Initializing Supporters collection...');
    for (const supporter of SAMPLE_DATA.supporters) {
      const supporterId = db.collection('supporters').doc().id;
      await db.collection('supporters').doc(supporterId).set(supporter);
      console.log(`  ✅ Created supporter record: ${supporter.userId}`);
    }

    // 5. Admin 설정
    console.log('\n🔐 Setting up Admin collection...');
    await db.collection('admin').doc('users').set({
      admins: ['admin-001']
    });
    console.log('  ✅ Admin users configured');

    // 6. 초기 리더보드 생성
    console.log('\n🏆 Creating initial leaderboard...');
    const now = admin.firestore.Timestamp.now();
    const weekId = `week_${new Date().getFullYear()}_${getWeekNumber()}`;

    await db.collection('leaderboard').doc(weekId).set({
      id: weekId,
      type: 'weekly',
      period: {
        startDate: now,
        endDate: now,
        weekNumber: getWeekNumber()
      },
      rankings: [
        {
          rank: 1,
          strategyId: 'strat-001',
          traderId: 'user-001',
          traderName: 'Aethelred the Unyielding',
          performance: {
            currentROI: 124,
            roi30d: 8.5,
            winRate: 68,
            sharpeRatio: 1.8
          },
          execution: {
            tvl: 500000,
            supporterCount: 45
          }
        }
      ],
      totalStrategies: 1,
      statistics: {
        averageROI: 124,
        totalTVL: 500000,
        totalSupporters: 45
      },
      updatedAt: now
    });
    console.log('  ✅ Initial leaderboard created');

    console.log('\n✨ Firestore initialization completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Users: ${SAMPLE_DATA.users.length}`);
    console.log(`  - Traders: ${SAMPLE_DATA.traders.length}`);
    console.log(`  - Strategies: ${SAMPLE_DATA.strategies.length}`);
    console.log(`  - Supporters: ${SAMPLE_DATA.supporters.length}`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error initializing Firestore:', error);
    process.exit(1);
  }
}

/**
 * 주 번호 계산
 */
function getWeekNumber() {
  const date = new Date();
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// 실행
initializeFirestore();
