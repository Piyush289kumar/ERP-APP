import { Router } from "express";
import {
  destroyGalleryById,
  getAllActiveGallery,
  getAllGallery,
  getGalleryById,
  modifyGallery,
} from "../controllers/gallery.controller.js";
import { ensureAuth } from "../middleware/authMiddleware.js";
import upload from "../config/multer.js";

const router = Router();

/* ================================
   🟢 Public Routes (No Auth Required)
   ================================ */

// ✅ Get all galleries (for public view with pagination)
router.get("/", getAllGallery);

// ✅ Get all active galleries (public only active)
router.get("/active", getAllActiveGallery);

// ✅ Get single gallery by ID
router.get("/:id", getGalleryById);

/* ================================
   🔒 Admin-Protected Routes
   ================================ */

// ✅ Create or Update Gallery (with optional image upload)
router.post(
  "/admin/save",
  ensureAuth,
  upload.fields([{ name: "galleryMedia", maxCount: 1 }]),
  modifyGallery
);

// ✅ Delete Gallery by ID
router.delete("/admin/:id", ensureAuth, destroyGalleryById);

export default router;
