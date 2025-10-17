import { Router } from "express";
import { ensureAuth } from "../middleware/authMiddleware.js";
import { getCategories } from "../controllers/category.controller.js";

const router = Router();

router.get(
  "/",
  ensureAuth,
  async (req, res, next) => {
    console.log("Fetching Categories...");
    next();
  },
  getCategories
);

export default router;