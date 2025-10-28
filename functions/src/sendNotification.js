/**
 * sendNotification
 * 중요 이벤트 발생시 알림 발송 함수
 */

const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * 거래 이벤트 알림 발송
 * Transaction 생성시 트리거
 */
async function sendNotification(snap, context) {
  try {
    const transaction = snap.data();
    const transactionId = context.params.txId;

    console.log(`📢 Sending notification for transaction: ${transactionId}`);

    // 알림 대상 및 메시지 결정
    const { userId, traderId, type, amount, currency } = transaction;
    let notificationData = {};

    switch (type) {
      case 'deposit':
        notificationData = {
          title: '입금 완료',
          message: `${amount} ${currency}가 입금되었습니다.`,
          type: 'deposit_success',
          icon: '💰'
        };
        break;

      case 'withdraw':
        notificationData = {
          title: '출금 완료',
          message: `${amount} ${currency}가 출금되었습니다.`,
          type: 'withdraw_success',
          icon: '💸'
        };
        break;

      case 'profit_share':
        notificationData = {
          title: '수익 배분',
          message: `${amount} ${currency}의 수익이 배분되었습니다.`,
          type: 'profit_received',
          icon: '📈'
        };
        break;

      case 'profit_distribution':
        notificationData = {
          title: '수익 지급',
          message: `${amount} ${currency}가 지급되었습니다.`,
          type: 'profit_distribution',
          icon: '🎁'
        };
        break;

      default:
        return;
    }

    // Notification 저장
    const notificationRef = db
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .doc();

    const now = admin.firestore.Timestamp.now();

    await notificationRef.set({
      id: notificationRef.id,
      ...notificationData,
      transactionId,
      amount,
      currency,
      read: false,
      createdAt: now,
      expiresAt: new Date(now.toDate().getTime() + 30 * 24 * 60 * 60 * 1000) // 30일 후 만료
    });

    console.log(`✅ Notification sent to ${userId}: ${notificationData.title}`);
    return { success: true, notificationId: notificationRef.id };

  } catch (error) {
    console.error('❌ Error sending notification:', error);
    // 알림 실패가 거래를 방해하지 않도록 처리
    return { success: false, error: error.message };
  }
}

/**
 * 대량 알림 발송 헬퍼 함수
 */
async function sendBulkNotification(userIds, notificationData) {
  try {
    const batch = db.batch();
    const now = admin.firestore.Timestamp.now();

    for (const userId of userIds) {
      const notificationRef = db
        .collection('users')
        .doc(userId)
        .collection('notifications')
        .doc();

      batch.set(notificationRef, {
        id: notificationRef.id,
        ...notificationData,
        read: false,
        createdAt: now,
        expiresAt: new Date(now.toDate().getTime() + 30 * 24 * 60 * 60 * 1000)
      });
    }

    await batch.commit();
    console.log(`✅ Bulk notification sent to ${userIds.length} users`);
    return { success: true, sentCount: userIds.length };

  } catch (error) {
    console.error('❌ Error sending bulk notification:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendNotification, sendBulkNotification };
