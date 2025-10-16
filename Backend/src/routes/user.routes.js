import { Router } from "express";
import { getProfile } from "../controllers/user.controller";
import { ensureAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/profile", ensureAuth, getProfile);

export default router;
