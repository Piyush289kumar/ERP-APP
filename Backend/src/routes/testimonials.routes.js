import Router from "express";
import {
  getAllActiveTestimonials,
  getAllTestimonials,
  getTestimonialById,
  modifyTestimonial,
} from "../controllers/testimonial.controller.js";
import { ensureAuth } from "../middleware/authMiddleware.js";
import upload from "../config/multer.js";

const router = Router();

// Public Routes
router.get("/", getAllActiveTestimonials);
router.get("/:id", getTestimonialById);

// Protective Routes
router.get("/all", ensureAuth, getAllTestimonials);
router.post(
  "/",
  ensureAuth,
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  modifyTestimonial
);

export default router;
