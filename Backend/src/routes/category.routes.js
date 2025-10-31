import { Router } from "express";
import { ensureAuth } from "../middleware/authMiddleware.js";
import {
  createCategory,
  destroyCategoryBySlug,
  getCategories,
  updateCategory,
} from "../controllers/category.controller.js";
import upload from "../config/multer.js";

const router = Router();

router.get("/", ensureAuth, getCategories);

// Create category with file upload
router.post(
  "/",
  ensureAuth,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "icon", maxCount: 1 },
  ]),
  createCategory
);

// Create category with file upload
router.put(
  "/:id",
  ensureAuth,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "icon", maxCount: 1 },
  ]),
  updateCategory
);

router.delete("/:slug", ensureAuth, destroyCategoryBySlug);

export default router;
