import { Router } from "express";
import { ensureAuth } from "../middleware/authMiddleware.js";
import {
  destroyCategoryBySlug,
  getCategories,
  modifyCategory,
} from "../controllers/category.controller.js";
import upload from "../config/multer.js";

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

// Create / Update category with file upload
router.post(
  "/",
  ensureAuth,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "icon", maxCount: 1 },
  ]),
  modifyCategory
);

router.delete("/:slug", ensureAuth, destroyCategoryBySlug);

export default router;
