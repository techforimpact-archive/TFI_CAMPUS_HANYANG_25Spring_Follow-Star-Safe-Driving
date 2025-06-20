import {Router, Request, Response} from "express";
import admin from "firebase-admin";
import {db} from "../services/firestore";

interface AttemptParams { session_id: string; quest_id: string; }
const router = Router({mergeParams: true});

/**
 * @openapi
 * /sessions/{session_id}/quests/{quest_id}/attempts:
 *   post:
 *     summary: 퀘스트 시도 등록
 *     parameters:
 *       - in: path
 *         name: session_id
 *         schema: { type: string }
 *       - in: path
 *         name: quest_id
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attempt_number: { type: integer }
 *               score_awarded: { type: integer }
 *               selected_option: { type: string }
 *               is_correct: { type: boolean }
 *               response_time: { type: integer }
 *     responses:
 *       200:
 *         description: 등록된 attempt ID
 */
router.post("/:quest_id/attempts", async (req: Request<AttemptParams>, res: Response) => {
  const sessionId = req.params.session_id;
  const questId = req.params.quest_id;
  const {attempt_number, score_awarded, selected_option, is_correct, response_time} = req.body;
  const now = admin.firestore.Timestamp.now();
  const ref = await db.collection("attempts").add({session_id: sessionId, quest_id: questId, attempt_number, score_awarded, selected_option, is_correct, response_time, timestamp: now});

  // + 세션에 점수 누적
  await db.collection("sessions").doc(sessionId).update({
    total_score: admin.firestore.FieldValue.increment(score_awarded),
  });
  return res.json({attempt_id: ref.id});
});

export default router;
