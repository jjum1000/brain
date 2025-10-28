/**
 * validateTrader
 * 트레이더 검증 HTTP 함수
 * 관리자만 호출 가능
 */

const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * 트레이더 검증 함수
 */
async function validateTrader(data, context) {
  try {
    // 인증 확인
    if (!context.auth) {
      throw new Error('Authentication required');
    }

    // 관리자 권한 확인
    const userDoc = await db.collection('admin/users').get();
    const adminList = userDoc.docs.length > 0 ? userDoc.data().admins : [];

    if (!adminList.includes(context.auth.uid)) {
      throw new Error('Admin privileges required');
    }

    const { traderId, approved, rejectionReason } = data;

    if (!traderId) {
      throw new Error('traderId is required');
    }

    console.log(`🔍 Validating trader: ${traderId}`);

    const traderRef = db.collection('traders').doc(traderId);
    const traderDoc = await traderRef.get();

    if (!traderDoc.exists) {
      throw new Error('Trader not found');
    }

    const now = admin.firestore.Timestamp.now();

    if (approved) {
      // 트레이더 승인
      await traderRef.update({
        'verification.status': 'verified',
        'verification.rejectionReason': null,
        verifiedAt: now
      });

      // 사용자에게 알림
      const userRef = db.collection('users').doc(traderId);
      await userRef.update({
        verified: true,
        role: 'trader',
        updatedAt: now
      });

      console.log(`✅ Trader approved: ${traderId}`);

      return {
        success: true,
        message: 'Trader approved successfully',
        traderId,
        status: 'verified',
        verifiedAt: now.toDate()
      };

    } else {
      // 트레이더 거절
      if (!rejectionReason) {
        throw new Error('rejectionReason is required for rejection');
      }

      await traderRef.update({
        'verification.status': 'rejected',
        'verification.rejectionReason': rejectionReason,
        verifiedAt: null
      });

      // 사용자에게 알림
      const userRef = db.collection('users').doc(traderId);
      await userRef.update({
        verified: false,
        updatedAt: now
      });

      console.log(`⛔ Trader rejected: ${traderId}`);

      return {
        success: true,
        message: 'Trader rejected successfully',
        traderId,
        status: 'rejected',
        rejectionReason
      };
    }

  } catch (error) {
    console.error('❌ Error validating trader:', error);
    throw new Error(`Validation failed: ${error.message}`);
  }
}

module.exports = { validateTrader };
