import api from "../api";

// ─────────────────────────────────────────────────────────────────────────────
// 1. User 생성 시 보내는 요청 바디 데이터 타입 정의
// ─────────────────────────────────────────────────────────────────────────────
export interface UserCreateData {
  name: string;
  phone: string;
  age: number;
  is_guest?: boolean;   // 게스트 여부 : 이전 데이터 제외ㅜㅜ
  session_id: string;
  score: number;
  
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. createUser 함수: villageId + UserCreateData 두 개 인자로 받도록 정의
// ─────────────────────────────────────────────────────────────────────────────
export function createUser(
  villageId: string,
  data: UserCreateData
) {
  // 내부에서 최종 Request Payload 형태로 합치기
  const payload = {
    village_id: villageId,
    name: data.name,
    phone: data.phone,
    age: data.age,
    is_guest: data.is_guest ?? false, // 기본값 false
    session_id: data.session_id,
    score: data.score,
  };

  return api.post<{
    user_id: string;
    is_guest: boolean;
    name: string;
    phone: string;
    age: number;
    village_id: string;
    session_id: string;
    score: number;
    created_at: { _seconds: number; _nanoseconds: number };
  }>("/users", payload);
}
