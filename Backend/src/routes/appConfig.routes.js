import { Router } from "express";
import { ensureAuth } from "../middleware/authMiddleware.js";
import { getAppConfig, modifyAppConfig } from "../controllers/appConfig.controller.js";

const router = Router();

router.get("/", ensureAuth, getAppConfig);
router.post("/", ensureAuth, modifyAppConfig);

export default router;
