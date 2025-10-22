import Router from "express";
import {
  destroyTestimonialById,
  getAllActiveTestimonials,
  getAllTestimonials,
  getTestimonialById,
  modifyTestimonial,
} from "../controllers/testimonial.controller.js";
import { ensureAuth } from "../middleware/authMiddleware.js";
import upload from "../config/multer.js";

const router = Router();

/* ================================
   🟢 Public Routes (No Auth Required)
   ================================ */

// ✅ Get all active testimonials (public site)
router.get("/", getAllActiveTestimonials);

// ✅ Get testimonial by ID (public)
router.get("/view/:id", getTestimonialById);


/* ================================
   🔒 Admin-Protected Routes
   ================================ */

// ⚠️ Note: Placed before dynamic routes to avoid `/all` -> ObjectId errors
router.get("/admin/all", ensureAuth, getAllTestimonials);

// ✅ Create or update testimonial (with optional avatar upload)
router.post(
  "/admin/save",
  ensureAuth,
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  modifyTestimonial
);

// ✅ Delete testimonial by ID
router.delete("/admin/:id", ensureAuth, destroyTestimonialById);

export default router;