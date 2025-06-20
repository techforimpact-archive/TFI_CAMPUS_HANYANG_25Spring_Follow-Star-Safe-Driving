import {Router, Request, Response} from "express";
import {db} from "../services/firestore";
const router = Router();

/**
 * @openapi
 * /certificates:
 *   get:
 *     summary: 수료증 목록 조회
 *     responses:
 *       200:
 *         description: 성공
 */
router.get("/", async (_: Request, res: Response) => {
  const snap = await db.collection("certificates").get();
  return res.json(snap.docs.map((d) => ({certificate_id: d.id, ...d.data()})));
});

/**
 * @openapi
 * /certificates:
 *   post:
 *     summary: 수료증 생성
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id: { type: string }
 *               village_id: { type: string }
 *               certificate_date: { type: string, format: date }
 *               certificate_image: { type: string }
 *               dispatch_time: { type: string, format: date-time }
 *               channel: { type: string }
 *     responses:
 *       200:
 *         description: 생성된 certificate ID
 */
router.post("/", async (req: Request, res: Response) => {
  const ref = await db.collection("certificates").add(req.body);
  return res.json({certificate_id: ref.id});
});

export default router;
