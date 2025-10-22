import Router from "express";
import {
  getAllActiveTestimonials,
  getAllTestimonials,
} from "../controllers/testimonial.controller.js";
import { ensureAuth } from "../middleware/authMiddleware.js";

const router = Router();

// Public Routes
router.get("/", getAllActiveTestimonials);

// Protective Routes
router.get("/all", ensureAuth, getAllTestimonials);

export default router;
