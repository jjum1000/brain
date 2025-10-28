/**
 * backupData
 * 매일 데이터 백업 함수
 * Firestore 데이터를 Cloud Storage에 백업
 */

const admin = require('firebase-admin');
const db = admin.firestore();
const bucket = admin.storage().bucket();

/**
 * 데이터 백업 메인 함수
 * 매일 2AM에 실행
 */
async function backupData(context) {
  try {
    console.log('🔄 Starting data backup...');

    const now = new Date();
    const backupTimestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    const backupPath = `backups/${backupTimestamp}/`;

    // 백업할 컬렉션 목록
    const collectionsToBackup = [
      'users',
      'traders',
      'strategies',
      'supporters',
      'transactions',
      'leaderboard',
      'reviews'
    ];

    console.log(`📦 Backing up ${collectionsToBackup.length} collections`);

    // 각 컬렉션 백업
    for (const collectionName of collectionsToBackup) {
      try {
        await backupCollection(collectionName, backupPath);
      } catch (error) {
        console.error(`Error backing up collection ${collectionName}:`, error);
        // 개별 컬렉션 백업 실패는 계속 진행
      }
    }

    // 백업 메타데이터 저장
    const metadata = {
      backupDate: now.toISOString(),
      collections: collectionsToBackup,
      status: 'completed'
    };

    const metadataPath = `${backupPath}metadata.json`;
    await bucket.file(metadataPath).save(JSON.stringify(metadata, null, 2));

    console.log(`✅ Data backup completed: gs://${bucket.name}/${backupPath}`);
    return { success: true, backupPath, collectionsCount: collectionsToBackup.length };

  } catch (error) {
    console.error('❌ Error during data backup:', error);
    throw error;
  }
}

/**
 * 개별 컬렉션 백업
 */
async function backupCollection(collectionName, backupPath) {
  try {
    console.log(`  📄 Backing up collection: ${collectionName}`);

    const snapshot = await db.collection(collectionName).get();
    const data = [];

    snapshot.forEach(doc => {
      data.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Cloud Storage에 저장
    const filePath = `${backupPath}${collectionName}.json`;
    const file = bucket.file(filePath);

    await file.save(JSON.stringify(data, null, 2), {
      metadata: {
        contentType: 'application/json',
        cacheControl: 'public, max-age=3600'
      }
    });

    console.log(`    ✅ Backed up ${collectionName}: ${data.length} documents`);
    return { collectionName, documentCount: data.length };

  } catch (error) {
    console.error(`Error backing up collection ${collectionName}:`, error);
    throw error;
  }
}

/**
 * 오래된 백업 정리 (30일 이상)
 */
async function cleanupOldBackups() {
  try {
    console.log('🧹 Cleaning up old backups...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [files] = await bucket.getFiles({ prefix: 'backups/' });

    let deletedCount = 0;
    for (const file of files) {
      const fileTime = new Date(file.metadata.timeCreated);
      if (fileTime < thirtyDaysAgo) {
        await file.delete();
        deletedCount++;
        console.log(`  ✅ Deleted old backup: ${file.name}`);
      }
    }

    console.log(`✅ Cleanup completed: ${deletedCount} old backups deleted`);
    return { deletedCount };

  } catch (error) {
    console.error('❌ Error cleaning up old backups:', error);
    // 정리 실패는 치명적이지 않음
    return { success: false, error: error.message };
  }
}

module.exports = { backupData, cleanupOldBackups };
