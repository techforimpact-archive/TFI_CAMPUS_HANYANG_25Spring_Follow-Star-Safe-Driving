import api from "../api";

export interface QuestResult {
  quest_id: string;
  success: boolean;
  attempts: number;
}

export interface SessionDetail {
  session_id: string;
  user_id?: string;
  scenario_id: string;
  start_time: { _seconds: number; _nanoseconds: number };
  end_time: null | { _seconds: number; _nanoseconds: number };
  total_attempts: number;
  total_score: number;
  quests: QuestResult[];
  favorite_scene?: string;
  satisfaction_rating?: number;
}

export function createSession(villageId: string) {
  const payload: Record<string, any> = {
    scenario_id: "Home_Farm", // scenario 고정 (prototype)
    village_id: villageId,
  };

  return api.post("/sessions", payload);
}

export function getSession(sessionId: string) {
  return api.get<SessionDetail>(`/sessions/${sessionId}`);

}

// ─────────────────────────────────────────────────────────────────────────────
// 3. updateSessionScene(): 세션 문서에 favorite_scene 필드만 부분 업데이트
// ─────────────────────────────────────────────────────────────────────────────
export function updateSessionScene(
  sessionId: string,
  favorite_scene: string
) {
  return api.patch<SessionDetail>(`/sessions/${sessionId}`, {
    favorite_scene,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. (참고) updateSessionRating(): 별점만 업데이트할 때 사용
// ─────────────────────────────────────────────────────────────────────────────
export function updateSessionRating(
  sessionId: string,
  satisfaction_rating: number
) {
  return api.patch<SessionDetail>(`/sessions/${sessionId}`, {
    satisfaction_rating,
  });
}