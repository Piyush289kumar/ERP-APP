import Router from "express";
import { getAllActiveGallery, getAllGallery } from "../controllers/gallery.controller.js";

const router = Router();

// Public Routes
router.get("/", getAllGallery);
router.get("/active", getAllActiveGallery);

export default router;
