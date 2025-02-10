import express from "express";
import { signup, login, confirmSignup } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/confirm-signup", confirmSignup);

export default router;
