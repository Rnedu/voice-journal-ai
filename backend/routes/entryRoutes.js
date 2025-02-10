import express from "express";
import { createEntry, getEntries, getEntryById, deleteEntry } from "../controllers/entryController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createEntry);
router.get("/", authMiddleware, getEntries);
router.get("/:entryId", authMiddleware, getEntryById);
router.delete("/:entryId", authMiddleware, deleteEntry);

export default router;
