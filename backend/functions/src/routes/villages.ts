import {Router, Request, Response} from "express";
import {db, getById} from "../services/firestore";
import admin from "firebase-admin";
const router = Router();

/**
 * @openapi
 * /villages:
 *   get:
 *     summary: 마을 목록 조회
 *     responses:
 *       200:
 *         description: 성공
 */
router.get("/", async (_req: Request, res: Response) => {
  const snap = await db.collection("villages").get();
  const list = snap.docs.map((d) => ({village_id: d.id, ...d.data()}));
  return res.json(list);
});
/**
 * @openapi
 * /villages/ranking:
 *   get:
 *     summary: 모든 마을의 안전 점수(평균) 기반 랭킹을 반환
 *     description: |
 *       - users 컬렉션을 조회해서, 같은 village_id끼리 묶어 “참여자 수”와 “평균 점수”를 계산하고
 *         평균 점수 내림차순으로 정렬된 배열을 반환합니다.
 *
 *       응답 예시:
 *       [
 *         {
 *           "rank": 1,
 *           "village_id": "iCXAlVvBKBoXLZnOwNCo",
 *           "village_name": "충청남도 예산군",
 *           "participants": 150,
 *           "avg_score": 85
 *         },
 *         {
 *           "rank": 2,
 *           "village_id": "UkEZamxGcMTeUarzNc6E",
 *           "village_name": "충청북도 홍천군",
 *           "participants": 431,
 *           "avg_score": 80
 *         }
 *         // … 이하 생략
 *       ]
 *
 *     responses:
 *       200:
 *         description: 랭킹 목록 (배열) 반환
 */
router.get("/ranking", async (_req: Request, res: Response) => {
  try {
    // 1) users 컬렉션 전체 조회
    const usersSnap = await db.collection("users").get();
    const allUsers = usersSnap.docs.map((doc) => {
      const data = doc.data() as { village_id: string; score: number };
      return {
        village_id: data.village_id,
        score: data.score ?? 0,
      };
    });

    // 2) 마을별로 '참여자 수' 및 '점수 합계' 집계
    type Agg = { participants: number; totalScore: number };
    const aggMap: Record<string, Agg> = {};

    allUsers.forEach(({ village_id, score }) => {
      if (!aggMap[village_id]) {
        aggMap[village_id] = { participants: 0, totalScore: 0 };
      }
      aggMap[village_id].participants += 1;
      aggMap[village_id].totalScore += score;
    });

    // 3) villages 컬렉션에서 마을 이름 조회
    const villagesSnap = await db.collection("villages").get();
    const villageNames: Record<string, string> = {};
    villagesSnap.docs.forEach((doc) => {
      const data = doc.data() as { village_name: string };
      villageNames[doc.id] = data.village_name;
    });

    // 4) aggregationMap을 배열로 변환하고 '평균 점수' 계산
    type RankingEntry = {
      rank: number;
      village_id: string;
      village_name: string;
      participants: number;
      avg_score: number;
    };

    const rankingArr: RankingEntry[] = Object.entries(aggMap)
      .map(([villageId, agg]) => {
        const avg =
          agg.participants > 0 ? agg.totalScore / agg.participants : 0;
        return {
          rank: 0, // 나중에 순서대로 채워넣음
          village_id: villageId,
          village_name: villageNames[villageId] ?? villageId,
          participants: agg.participants,
          avg_score: Math.round(avg), // 소수점 반올림
        };
      })
      // 5) 평균 점수 내림차순으로 정렬
      .sort((a, b) => b.avg_score - a.avg_score);

    // 6) 순위(rank) 부여
    rankingArr.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    // 7) 결과 반환
    return res.status(200).json(rankingArr);
  } catch (error) {
    console.error("Error fetching village rankings:", error);
    return res
      .status(500)
      .json({ error: "랭킹을 불러오지 못했습니다." });
  }
});

/**
 * @openapi
 * /villages/{village_id}:
 *   get:
 *     summary: 마을 상세 조회
 *     parameters:
 *       - in: path
 *         name: village_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 성공
 */
router.get("/:id", async (req: Request, res: Response) => {
  const data = await getById("villages", req.params.id);
  if (!data) return res.status(404).json({error: "Not found"});
  return res.json({village_id: req.params.id, ...data});
});

/**
 * @openapi
 * /villages:
 *   post:
 *     summary: 마을 생성 (없으면 생성, 있으면 기존 ID 반환)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               village_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: 마을 생성 성공
 *       200:
 *         description: 이미 존재하는 마을
 */

router.post("/", async (req: Request, res: Response) => {
  const { village_name } = req.body;
  if (!village_name) {
    return res.status(400).json({ error: "village_name is required" });
  }

  // 1. 중복 체크
  const existingSnap = await db
    .collection("villages")
    .where("village_name", "==", village_name)
    .limit(1)
    .get();

  if (!existingSnap.empty) {
    const existingDoc = existingSnap.docs[0];
    return res.status(200).json({
      message: "Village already exists",
      village_id: existingDoc.id,
      ...existingDoc.data(),
    });
  }

  // 2. 새 마을 생성
  const now = admin.firestore.FieldValue.serverTimestamp();
  const newVillage = {
    village_name,
    created_at: now,
    updated_at: now,
  };

  const newDocRef = await db.collection("villages").add(newVillage);
  const newDoc = await newDocRef.get();

  return res.status(201).json({
    message: "Village created",
    village_id: newDocRef.id,
    ...newDoc.data(),
  });
});


export default router;