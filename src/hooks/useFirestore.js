/**
 * useFirestore Hook
 * Firestore 데이터 조회 및 수정을 위한 커스텀 훅
 */

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * useFirestore Hook
 * Firestore 단일 문서 읽기/쓰기
 *
 * @param {string} collection - Collection 이름
 * @param {string} docId - Document ID
 * @returns {Object} 데이터 및 메서드
 *
 * 사용 예시:
 * ```jsx
 * function UserProfile() {
 *   const { data, loading, error, updateDoc } = useFirestore('users', userId);
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <h1>{data.displayName}</h1>
 *       <button onClick={() => updateDoc({ bio: 'New bio' })}>
 *         Update Bio
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFirestore(collection, docId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 문서 읽기
   */
  const fetchDocument = useCallback(async () => {
    if (!collection || !docId) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, collection, docId);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        setData(docSnapshot.data());
      } else {
        setData(null);
        console.warn(`Document not found: ${collection}/${docId}`);
      }
    } catch (err) {
      console.error('Error fetching document:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [collection, docId]);

  /**
   * 초기 로드
   */
  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  /**
   * 문서 생성
   */
  const addDocument = useCallback(async (newData) => {
    if (!collection || !docId) {
      throw new Error('Collection and docId are required');
    }

    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, collection, docId);
      const dataWithTimestamp = {
        ...newData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await setDoc(docRef, dataWithTimestamp);
      setData(dataWithTimestamp);
      console.log(`✅ Document created: ${collection}/${docId}`);
    } catch (err) {
      console.error('Error creating document:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [collection, docId]);

  /**
   * 문서 업데이트
   */
  const updateFirestoreDoc = useCallback(async (updateData) => {
    if (!collection || !docId) {
      throw new Error('Collection and docId are required');
    }

    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, collection, docId);
      const dataWithTimestamp = {
        ...updateData,
        updatedAt: Timestamp.now()
      };

      await updateDoc(docRef, dataWithTimestamp);
      setData(prev => ({ ...prev, ...dataWithTimestamp }));
      console.log(`✅ Document updated: ${collection}/${docId}`);
    } catch (err) {
      console.error('Error updating document:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [collection, docId]);

  /**
   * 문서 삭제
   */
  const deleteDocument = useCallback(async () => {
    if (!collection || !docId) {
      throw new Error('Collection and docId are required');
    }

    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, collection, docId);
      await deleteDoc(docRef);
      setData(null);
      console.log(`✅ Document deleted: ${collection}/${docId}`);
    } catch (err) {
      console.error('Error deleting document:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [collection, docId]);

  /**
   * 문서 새로고침
   */
  const refresh = useCallback(() => {
    fetchDocument();
  }, [fetchDocument]);

  return {
    data,
    loading,
    error,
    addDocument,
    updateDoc: updateFirestoreDoc,
    deleteDocument,
    refresh,
    isLoading: loading,
    isEmpty: !data
  };
}

/**
 * useFirestoreQuery Hook
 * Firestore 쿼리 (여러 문서 읽기)
 *
 * @param {Function} queryFn - 쿼리 함수
 * @param {Array} dependencies - useEffect 의존성 배열
 * @returns {Object} 데이터 및 메서드
 *
 * 사용 예시:
 * ```jsx
 * function TradersList() {
 *   const { data, loading } = useFirestoreQuery(
 *     async () => TraderService.getVerifiedTraders(10),
 *     []
 *   );
 *
 *   return (
 *     <div>
 *       {loading ? 'Loading...' : data.map(trader => (
 *         <div key={trader.uid}>{trader.displayName}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useFirestoreQuery(queryFn, dependencies = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      setData(result);
    } catch (err) {
      console.error('Error fetching query data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [queryFn]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    isLoading: loading,
    isEmpty: data.length === 0
  };
}

export default useFirestore;
