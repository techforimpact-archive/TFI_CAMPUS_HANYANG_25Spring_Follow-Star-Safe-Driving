import {Router, Request, Response} from "express";
import admin from "firebase-admin";
import {db, getById} from "../services/firestore";
const router = Router();

/**
 * @openapi
 * /sessions:
 *   post:
 *     summary: 세션 시작
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id: { type: string }
 *               scenario_id: { type: string }
 *     responses:
 *       200:
 *         description: session ID
 */
router.post("/", async (req: Request, res: Response) => {
  const now = admin.firestore.Timestamp.now();
  const ref = await db.collection("sessions").add({
    ...req.body, 
    start_time: now,
    end_time: null,
    total_attempts: 0,
    total_score: 0,
  });
  return res.json({session_id: ref.id});
});

/**
 * @openapi
 * /sessions/{session_id}:
 *   get:
 *     summary: 세션 조회 (상세 정보 및 퀘스트 결과 포함)
 *     parameters:
 *       - in: path
 *         name: session_id
 *         required: true
 *         schema:
 *           type: string
 *           description: 조회할 세션의 ID
 *     responses:
 *       200:
 *         description: 세션 정보 및 퀘스트 결과
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 session_id:
 *                   type: string
 *                 user_id:
 *                   type: string
 *                 scenario_id:
 *                   type: string
 *                 start_time:
 *                   type: string
 *                   format: date-time
 *                 end_time:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 total_attempts:
 *                   type: integer
 *                 total_score:
 *                   type: integer
 *                 quests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       quest_id:
 *                         type: string
 *                       success:
 *                         type: boolean
 *                       attempts:
 *                         type: integer
 */
/** GET /sessions/:id — 세션 조회 + 퀘스트별 결과 포함 */
router.get("/:id", async (req: Request, res: Response) => {
  const sessionId = req.params.id;
  const data = await getById("sessions", sessionId);
  if (!data) return res.status(404).json({ error: "Not found" });

  // 1) sessions 컬렉션에서 기본 세션 정보
  const sessionInfo = { session_id: sessionId, ...data };

  // 2) attempts 컬렉션에서 이 세션의 모든 시도 문서 가져오기
  const attemptsSnap = await db
    .collection("attempts")
    .where("session_id", "==", sessionId)
    .get();

  // 3) quest_id 별로 묶어서 { quest_id, success, attempts } 형태로 가공
  interface QuestResult {
    quest_id: string;
    success: boolean;
    attempts: number;
  }
  const resultMap: Record<string, QuestResult> = {};

  attemptsSnap.docs.forEach((doc) => {
    const { quest_id, is_correct } = doc.data() as {
      quest_id: string;
      is_correct: boolean;
    };
    if (!resultMap[quest_id]) {
      resultMap[quest_id] = { quest_id, success: false, attempts: 0 };
    }
    resultMap[quest_id].attempts += 1;
    // 한번이라도 is_correct === true 면 성공
    if (is_correct) {
      resultMap[quest_id].success = true;
    }
  });

  const quests = Object.values(resultMap);

  return res.json({
    ...sessionInfo,
    quests,
  });
});

/**
 * @openapi
 * /sessions/{session_id}:
 *   patch:
 *     summary: 세션 문서에 장면 or 별점 업데이트
 *     parameters:
 *       - in: path
 *         name: session_id
 *         schema:
 *           type: string
 *         required: true
 *         description: 업데이트할 세션 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               favorite_scene:
 *                 type: string
 *               satisfaction_rating:
 *                 type: integer
 *             # 둘 중 적어도 하나는 보내야 함
 *     responses:
 *       200:
 *         description: 업데이트 성공, 업데이트된 세션 문서 반환
 *       400:
 *         description: 잘못된 요청 (둘 다 없거나 형식 오류)
 *       404:
 *         description: 해당 session_id의 문서를 찾을 수 없음
 *       500:
 *         description: 서버 에러
 */
router.patch("/:session_id", async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.session_id;
    const { favorite_scene, satisfaction_rating } = req.body as {
      favorite_scene?: string;
      satisfaction_rating?: number;
    };

    // 1) favorite_scene 또는 satisfaction_rating 둘 중 하나라도 반드시 와야 함
    if (
      favorite_scene === undefined &&
      satisfaction_rating === undefined
    ) {
      return res.status(400).json({
        error:
          "Request body must contain either favorite_scene or satisfaction_rating (or both).",
      });
    }

    // 2) satisfaction_rating이 넘어온 경우, 1~5인지 확인
    if (
      satisfaction_rating !== undefined &&
      (typeof satisfaction_rating !== "number" ||
        satisfaction_rating < 1 ||
        satisfaction_rating > 5)
    ) {
      return res
        .status(400)
        .json({ error: "satisfaction_rating must be an integer between 1 and 5" });
    }

    // 3) 해당 session 문서가 존재하는지 확인
    const sessionRef = db.collection("sessions").doc(sessionId);
    const sessionSnap = await sessionRef.get();
    if (!sessionSnap.exists) {
      return res.status(404).json({ error: "Session not found" });
    }

    // 4) 업데이트할 필드를 골라서 객체 생성
    const now = admin.firestore.FieldValue.serverTimestamp();
    const updateData: any = { updated_at: now };

    if (favorite_scene !== undefined) {
      updateData.favorite_scene = favorite_scene;
      // 최초 설문이면 submitted 시간도 기록
      updateData.survey_submitted_at = now;
    }
    if (satisfaction_rating !== undefined) {
      updateData.satisfaction_rating = satisfaction_rating;
      // 만족도도 처음 기록하는 거면 survey_submitted_at 찍어 줘도 무방
      // 단, favorite_scene을 먼저 보냈다면 이미 찍혀 있으므로 중복되어도 상관없음
      updateData.survey_submitted_at = now;
    }

    // 5) Firestore 업데이트
    await sessionRef.update(updateData);

    // 6) 업데이트된 세션 문서 반환
    const updatedSnap = await sessionRef.get();
    return res.status(200).json({ session_id: updatedSnap.id, ...updatedSnap.data() });
  } catch (error) {
    console.error("[PATCH /sessions/:session_id] Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
