import express from "express";
import { getMoodTrends, getTopKeywords, getWeeklyInsights } from "../controllers/analyticsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/mood-trends", authMiddleware, getMoodTrends);
router.get("/top-keywords", authMiddleware, getTopKeywords);
router.get("/weekly-insights", authMiddleware, getWeeklyInsights);


export default router;
