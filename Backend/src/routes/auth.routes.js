import { Router } from "express";
import { getProfile, login, register } from "../controllers/auth.controller.js";
import { ensureAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", ensureAuth, getProfile);

export default router;
