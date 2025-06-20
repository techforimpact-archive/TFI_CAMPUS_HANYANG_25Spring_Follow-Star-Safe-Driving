import api from "../api";

export interface AttemptPayload {
  attempt_number: number;
  score_awarded: number;
  selected_option: string;
  is_correct: boolean;
  response_time: number;
}

/**
 * 퀘스트 시도 등록
 * POST /sessions/{session_id}/quests/{quest_id}/attempts
 */
export function postQuestAttempt(
  sessionId: string,
  questId: string,
  payload: AttemptPayload
) {
  return api.post<{ attempt_id: string }>(
    `/sessions/${sessionId}/quests/${questId}/attempts`,
    payload
  );
}