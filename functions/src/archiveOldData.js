/**
 * archiveOldData
 * 매월 오래된 데이터 정리 함수
 * 90일 이상 된 거래 데이터를 아카이브로 이동
 */

const admin = require('firebase-admin');
const db = admin.firestore();
const bucket = admin.storage().bucket();

/**
 * 오래된 데이터 아카이브 메인 함수
 * 매월 1일 3AM에 실행
 */
async function archiveOldData(context) {
  try {
    console.log('📦 Starting data archival process...');

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const archiveTimestamp = new Date().toISOString().split('T')[0];
    const archivePath = `archives/${archiveTimestamp}/`;

    // 아카이브할 컬렉션과 기한
    const archiveConfigs = [
      {
        collection: 'transactions',
        dateField: 'timestamp',
        beforeDate: ninetyDaysAgo,
        description: '90일 이상 된 거래'
      },
      {
        collection: 'reviews',
        dateField: 'createdAt',
        beforeDate: new Date(ninetyDaysAgo.getTime() - 180 * 24 * 60 * 60 * 1000), // 180일
        description: '180일 이상 된 리뷰'
      }
    ];

    let totalArchivedDocs = 0;

    // 각 컬렉션별 아카이브
    for (const config of archiveConfigs) {
      try {
        const count = await archiveCollection(config, archivePath);
        totalArchivedDocs += count;
      } catch (error) {
        console.error(`Error archiving ${config.collection}:`, error);
      }
    }

    // 아카이브 메타데이터 저장
    const metadata = {
      archiveDate: new Date().toISOString(),
      collections: archiveConfigs.map(c => c.collection),
      totalArchivedDocuments: totalArchivedDocs,
      status: 'completed'
    };

    const metadataPath = `${archivePath}metadata.json`;
    await bucket.file(metadataPath).save(JSON.stringify(metadata, null, 2));

    console.log(`✅ Data archival completed: ${totalArchivedDocs} documents`);
    return { success: true, archivePath, totalArchivedDocs };

  } catch (error) {
    console.error('❌ Error during data archival:', error);
    throw error;
  }
}

/**
 * 개별 컬렉션 아카이브
 */
async function archiveCollection(config, archivePath) {
  try {
    const { collection, dateField, beforeDate, description } = config;

    console.log(`  📄 Archiving ${collection}: ${description}`);

    // 아카이브 대상 문서 조회
    const query = db
      .collection(collection)
      .where(dateField, '<', admin.firestore.Timestamp.fromDate(beforeDate));

    const snapshot = await query.get();
    const archivedDocs = [];
    const batch = db.batch();

    let batchCount = 0;
    const batchSize = 500;

    for (const doc of snapshot.docs) {
      const docData = doc.data();

      // 아카이브 데이터 저장
      archivedDocs.push({
        id: doc.id,
        ...docData,
        archivedAt: admin.firestore.Timestamp.now()
      });

      // 원본 문서 삭제
      batch.delete(db.collection(collection).doc(doc.id));
      batchCount++;

      // 배치 크기 도달시 커밋
      if (batchCount >= batchSize) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }

    // 남은 작업 커밋
    if (batchCount > 0) {
      await batch.commit();
    }

    // Cloud Storage에 아카이브 저장
    if (archivedDocs.length > 0) {
      const filePath = `${archivePath}${collection}.json`;
      const file = bucket.file(filePath);

      await file.save(JSON.stringify(archivedDocs, null, 2), {
        metadata: {
          contentType: 'application/json',
          cacheControl: 'public, max-age=86400'
        }
      });

      console.log(`    ✅ Archived ${collection}: ${archivedDocs.length} documents`);
    } else {
      console.log(`    ℹ️  No documents to archive in ${collection}`);
    }

    return archivedDocs.length;

  } catch (error) {
    console.error(`Error archiving collection ${config.collection}:`, error);
    throw error;
  }
}

/**
 * 아카이브 복구 함수
 * Cloud Storage에서 데이터 복구
 */
async function restoreArchivedData(archivePath, collection) {
  try {
    console.log(`🔄 Restoring archived data from ${archivePath}${collection}.json`);

    const file = bucket.file(`${archivePath}${collection}.json`);
    const [content] = await file.download();
    const archivedDocs = JSON.parse(content.toString());

    const batch = db.batch();
    let batchCount = 0;
    const batchSize = 500;

    for (const doc of archivedDocs) {
      const { id, archivedAt, ...data } = doc;

      batch.set(
        db.collection(collection).doc(id),
        {
          ...data,
          restoredAt: admin.firestore.Timestamp.now()
        }
      );

      batchCount++;

      if (batchCount >= batchSize) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    console.log(`✅ Restored ${archivedDocs.length} documents to ${collection}`);
    return { restoredCount: archivedDocs.length };

  } catch (error) {
    console.error('❌ Error restoring archived data:', error);
    throw error;
  }
}

module.exports = { archiveOldData, restoreArchivedData };
