import express from "express";
import { getMoodTrends, getTopKeywords } from "../controllers/analyticsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/mood-trends", authMiddleware, getMoodTrends);
router.get("/top-keywords", authMiddleware, getTopKeywords);

export default router;
