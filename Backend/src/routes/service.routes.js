import Router from "express";
import { ensureAuth } from "../middleware/authMiddleware.js";
import {
  destroyServiceById,
  getAllActiveServices,
  getAllServices,
  getServiceById,
  modifyService,
} from "../controllers/service.controller.js";
import upload from "../config/multer.js";

const router = Router();

/* ================================
   🟢 Public Routes (No Auth Required)
   ================================ */

// ✅ Get all active services (public site)
router.get("/", getAllActiveServices);

// ✅ Get service by ID (public)
router.get("/view/:id", getServiceById);

/* ================================
   🔒 Admin-Protected Routes
   ================================ */

// ⚠️ Note: Placed before dynamic routes to avoid `/all` -> ObjectId errors
router.get("/admin/all", ensureAuth, getAllServices);

// ✅ Create or update Service (with optional avatar upload)
router.post(
  "/admin/save",
  ensureAuth,
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  modifyService
);

// ✅ Delete Service by ID
router.delete("/admin/:id", ensureAuth, destroyServiceById);

export default router;
