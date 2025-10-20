import { Router } from "express";
import {
  destroyBlogBySlug,
  getAllBlogs,
  getAllFeatureBlogs,
  getBlogBySlug,
  modifyBlogBySlug,
} from "../controllers/blog.controller.js";
import { ensureAuth } from "../middleware/authMiddleware.js";
import upload from "../config/multer.js";

const router = Router();

// Public Routes

router.get("/", getAllBlogs);
router.get("/featured", getAllFeatureBlogs);
router.get("/:slug", getBlogBySlug);

// Protected (Admin/Author) Routes
router.post(
  "/",
  ensureAuth,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "gallery_images", maxCount: 10 },
  ]),
  modifyBlogBySlug
);
router.delete("/:slug", ensureAuth, destroyBlogBySlug);

export default router;
