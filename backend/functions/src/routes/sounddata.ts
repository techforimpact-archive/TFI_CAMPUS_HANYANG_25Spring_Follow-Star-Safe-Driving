import {Router, Request, Response} from "express";
import {getById} from "../services/firestore";
const router = Router();

/**
 * @openapi
 * /sounddata/{sound_id}:
 *   get:
 *     summary: 사운드 데이터 조회
 *     parameters:
 *       - in: path
 *         name: sound_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 성공
 */
router.get("/:id", async (req: Request, res: Response) => {
  const data = await getById("sounddata", req.params.id);
  if (!data) return res.status(404).json({error: "Not found"});
  return res.json({sound_id: req.params.id, ...data});
});

export default router;
