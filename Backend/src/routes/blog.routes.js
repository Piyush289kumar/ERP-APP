import { Router } from "express";
import {
  getAllBlogs,
  getAllFeatureBlogs,
  getBlogBySlug,
  modifyBlogBySlug,
} from "../controllers/blog.controller.js";
import { ensureAuth } from "../middleware/authMiddleware.js";

const router = Router();


// Public Routes

router.get("/", getAllBlogs);
router.get("/featured", getAllFeatureBlogs);
router.get("/:slug", getBlogBySlug);

// Protected (Admin/Author) Routes
router.post("/", ensureAuth, modifyBlogBySlug);

export default router;
