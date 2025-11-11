import { Router } from "express";
import {
  getAllActiveBlogs,
  getBlogBySlug,
  getAllBlogs,
  createBlog,
  updateBlog,
  partiallyUpdateBlog,
  destroyBlogBySlug,
} from "../controllers/blog.controller.js";
import { ensureAuth } from "../middleware/authMiddleware.js";
import upload from "../config/multer.js";

const router = Router();

/* ================================
   🟢 PUBLIC ROUTES
   ================================ */

// ✅ Get all active blogs (public)
router.get("/", getAllActiveBlogs);

// ✅ Get blog details by slug (public)
router.get("/:slug", getBlogBySlug);

/* ================================
   🔒 ADMIN ROUTES (Protected)
   ================================ */

// ✅ Get all blogs (paginated + search + sort)
router.get("/admin/all", ensureAuth, getAllBlogs);

// ✅ Create new blog
router.post(
  "/admin",
  ensureAuth,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "gallery_images", maxCount: 10 },
  ]),
  createBlog
);

// ✅ Update blog (PUT)
router.put(
  "/admin/:slug",
  ensureAuth,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "gallery_images", maxCount: 10 },
  ]),
  updateBlog
);

// ✅ Partial update (PATCH)
router.patch("/admin/:slug", ensureAuth, partiallyUpdateBlog);

// ✅ Delete blog
router.delete("/admin/:slug", ensureAuth, destroyBlogBySlug);

export default router;
