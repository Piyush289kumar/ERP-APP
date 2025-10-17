import { Router } from "express";
import { ensureAuth } from "../middleware/authMiddleware.js";
import {
  destroyCategoryBySlug,
  getCategories,
  modifyCategory,
} from "../controllers/category.controller.js";

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

router.post("/", ensureAuth, modifyCategory);
router.delete("/:slug", ensureAuth, destroyCategoryBySlug);

export default router;
