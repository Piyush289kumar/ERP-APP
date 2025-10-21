import Router from "express";
import {
  getAllActiveGallery,
  getAllGallery,
  modifyGallery,
} from "../controllers/gallery.controller.js";
import { ensureAuth } from "../middleware/authMiddleware.js";
import upload from "../config/multer.js";

const router = Router();

// Public Routes
router.get("/", getAllGallery);
router.get("/active", getAllActiveGallery);

// Protected (Admin/Author) Routes
router.post(
  "/",
  ensureAuth,
  upload.fields([{ name: "galleryMedia", maxCount: 1 }]),
  modifyGallery
);

export default router;
