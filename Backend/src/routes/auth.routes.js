import { Router } from "express";
import { getProfile, login, logout, register } from "../controllers/auth.controller.js";
import { ensureAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", ensureAuth, getProfile);
router.post("/logout", ensureAuth, logout);

export default router;
