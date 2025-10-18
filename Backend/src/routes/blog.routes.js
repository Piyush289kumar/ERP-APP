import { Router } from "express";
import {
  getAllFeatureBlogs,
  modifyBlogBySlug,
} from "../controllers/blog.controller.js";
import { ensureAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getAllFeatureBlogs);
router.post("/", ensureAuth, modifyBlogBySlug);

export default router;
