import express from "express";
import { analyzeEntry } from "../controllers/aiController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/analyze", authMiddleware, analyzeEntry);

export default router;
