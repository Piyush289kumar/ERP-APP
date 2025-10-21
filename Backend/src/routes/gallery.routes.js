import Router from "express";
import { getAllGallery } from "../controllers/gallery.controller.js";

const router = Router();

// Public Routes
router.get("/", getAllGallery);

export default router;
