import express from "express";
import { transcribeAudio, analyzeEntry } from "../controllers/aiController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/transcribe", authMiddleware, upload.single("file"), transcribeAudio);
router.post("/analyze", authMiddleware, analyzeEntry);

export default router;
