import {Router, Request, Response} from "express";
import admin from "firebase-admin";
import {db, getById} from "../services/firestore";
const router = Router();

/**
 * @openapi
 * /users:
 *   post:
 *     summary: 유저 생성
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_guest: { type: boolean }
 *               name: { type: string }
 *               phone: { type: string }
 *               age: { type: integer }
 *               village_id: { type: string }
 *               session_id: { type: string }
 *               score: { type: integer}
 *     responses:
 *       200:
 *         description: 생성된 유저
 */
router.post("/", async (req: Request, res: Response) => {
  const now = admin.firestore.Timestamp.now();
  const ref = await db.collection("users").add({...req.body, created_at: now, updated_at: now});
  return res.json({user_id: ref.id, ...req.body});
});

/**
 * @openapi
 * /users/{user_id}:
 *   get:
 *     summary: 유저 상세 조회
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 유저 객체
 */
router.get("/:id", async (req: Request, res: Response) => {
  const data = await getById("users", req.params.id);
  if (!data) return res.status(404).json({error: "Not found"});
  return res.json({user_id: req.params.id, ...data});
});

export default router;
