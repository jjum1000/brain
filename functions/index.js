/**
 * YOLOSEUM Cloud Functions
 * Firebase Cloud Functions 메인 파일
 */

const admin = require('firebase-admin');
const functions = require('firebase-functions');

// Firebase Admin 초기화
admin.initializeApp();

// 각 함수 import
const { updateLeaderboard } = require('./src/updateLeaderboard');
const { calculateROI } = require('./src/calculateROI');
const { distributeProfit } = require('./src/distributeProfit');
const { validateTrader } = require('./src/validateTrader');
const { sendNotification } = require('./src/sendNotification');
const { backupData } = require('./src/backupData');
const { archiveOldData } = require('./src/archiveOldData');

/**
 * 리더보드 업데이트 (매시간)
 * Pub/Sub trigger로 매시간 실행
 */
exports.updateLeaderboard = functions
  .pubsub
  .schedule('every 1 hours')
  .onRun(updateLeaderboard);

/**
 * ROI 계산 (Firestore Trigger)
 * Strategy 데이터 변경시 즉시 실행
 */
exports.calculateROI = functions
  .firestore
  .document('strategies/{strategyId}')
  .onWrite(calculateROI);

/**
 * 수익 배분 (매일 자정)
 * Cloud Scheduler trigger
 */
exports.distributeProfit = functions
  .pubsub
  .schedule('0 0 * * *')
  .timeZone('Asia/Seoul')
  .onRun(distributeProfit);

/**
 * 트레이더 검증 (HTTP Trigger)
 * 관리자 대시보드에서 호출
 */
exports.validateTrader = functions
  .https
  .onCall(validateTrader);

/**
 * 알림 발송 (Firestore Trigger)
 * 중요 이벤트 발생시 자동 알림
 */
exports.sendNotification = functions
  .firestore
  .document('transactions/{txId}')
  .onCreate(sendNotification);

/**
 * 데이터 백업 (매일 2AM)
 * Cloud Scheduler trigger
 */
exports.backupData = functions
  .pubsub
  .schedule('0 2 * * *')
  .timeZone('Asia/Seoul')
  .onRun(backupData);

/**
 * 오래된 데이터 정리 (매월 1일)
 * Cloud Scheduler trigger
 */
exports.archiveOldData = functions
  .pubsub
  .schedule('0 3 1 * *')
  .timeZone('Asia/Seoul')
  .onRun(archiveOldData);

// 헬스 체크 endpoint
exports.health = functions.https.onRequest((req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    functions: [
      'updateLeaderboard',
      'calculateROI',
      'distributeProfit',
      'validateTrader',
      'sendNotification',
      'backupData',
      'archiveOldData'
    ]
  });
});
