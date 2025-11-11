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

// ⚠️ Important: Keep dynamic slug route LAST
router.get("/", getAllActiveBlogs);
router.get("/:slug", getBlogBySlug);

/* ================================
   🔒 ADMIN ROUTES
   ================================ */
router.get("/admin/all", ensureAuth, getAllBlogs);

router.post(
  "/admin",
  ensureAuth,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "gallery_images", maxCount: 10 },
  ]),
  createBlog
);

router.put(
  "/admin/:slug",
  ensureAuth,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "gallery_images", maxCount: 10 },
  ]),
  updateBlog
);

router.patch("/admin/:slug", ensureAuth, partiallyUpdateBlog);
router.delete("/admin/:slug", ensureAuth, destroyBlogBySlug);

export default router;
