import express from "express";
import { createEntry, getEntries } from "../controllers/entryController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createEntry);
router.get("/", authMiddleware, getEntries);

export default router;
