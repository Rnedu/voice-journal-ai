import express from "express";
import { getMoodTrends, getTopKeywords, getWeeklyInsights, getInsightsForPeriod } from "../controllers/analyticsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/mood-trends", authMiddleware, getMoodTrends);
router.get("/top-keywords", authMiddleware, getTopKeywords);
router.get("/weekly-insights", authMiddleware, getWeeklyInsights);
router.get("/insights", authMiddleware, getInsightsForPeriod);



export default router;
