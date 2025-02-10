import express from "express";
import { signup, login, confirmSignup } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/confirm-signup", confirmSignup);

router.get("/profile", authMiddleware, (req, res) => {
    res.json({ email: req.user.email });
  });

export default router;
