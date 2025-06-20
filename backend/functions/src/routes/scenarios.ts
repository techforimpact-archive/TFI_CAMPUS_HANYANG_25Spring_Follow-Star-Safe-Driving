import {Router, Request, Response} from "express";
import {db, getById} from "../services/firestore";
const router = Router();

/**
 * @openapi
 * /scenarios:
 *   get:
 *     summary: 시나리오 목록 조회
 *     responses:
 *       200:
 *         description: 성공
 */
router.get("/", async (_: Request, res: Response) => {
  const snap = await db.collection("scenarios").get();
  const list = snap.docs.map((d) => ({scenario_id: d.id, ...d.data()}));
  return res.json(list);
});

/**
 * @openapi
 * /scenarios/{scenario_id}:
 *   get:
 *     summary: 시나리오 상세 조회
 *     parameters:
 *       - in: path
 *         name: scenario_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 성공
 */
router.get("/:id", async (req: Request, res: Response) => {
  const scen = await getById("scenarios", req.params.id);
  if (!scen) return res.status(404).json({error: "Not found"});
  const questsSnap = await db.collection("quests")
    .where("scenario_id", "==", req.params.id).orderBy("quest_order").get();
  const quests = questsSnap.docs.map((d) => ({quest_id: d.id, ...d.data()}));
  return res.json({scenario_id: req.params.id, ...scen, quests});
});

export default router;
