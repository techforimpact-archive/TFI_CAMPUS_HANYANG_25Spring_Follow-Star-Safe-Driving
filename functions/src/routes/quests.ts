import {Router, Request, Response} from "express";
import {getById} from "../services/firestore";
const router = Router();

/**
 * @openapi
 * /quests/{quest_id}:
 *   get:
 *     summary: 퀘스트 상세 조회
 *     parameters:
 *       - in: path
 *         name: quest_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 성공
 */
router.get("/:id", async (req: Request, res: Response) => {
  const data = await getById("quests", req.params.id);
  if (!data) return res.status(404).json({error: "Not found"});
  return res.json({quest_id: req.params.id, ...data});
});

export default router;
