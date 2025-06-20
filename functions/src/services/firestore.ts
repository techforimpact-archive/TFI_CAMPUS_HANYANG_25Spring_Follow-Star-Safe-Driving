import admin from "firebase-admin";

// Firebase 앱이 이미 초기화됐는지 확인한 후 초기화
if (!admin.apps.length) {
  admin.initializeApp();
}

// Firestore 인스턴스 생성
export const db = admin.firestore();

// 특정 문서 ID로 조회하는 함수
export async function getById(collection: string, id: string) {
  const snap = await db.collection(collection).doc(id).get();
  return snap.exists ? snap.data() : null;
}
