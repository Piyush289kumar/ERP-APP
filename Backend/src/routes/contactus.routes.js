import Router from "express";
import { ensureAuth } from "../middleware/authMiddleware.js";

const router = Router();

// Public Routes

// Submit contact us form
router.post("/submit", createContactUs);

// Protected Routes

// Get all contact us message
router.get("/admin", ensureAuth, getAllContactUs);

// Get single contact us message by ID
router.get("/admin/:id", ensureAuth, getContactUsById);

// Admin, respond to a contact message
router.post("/admin/respond/:id", ensureAuth, respondToContactUs);

// Delete a contact us message
router.delete("/admin/destroy/:id", ensureAuth, destroyContactUsById);

export default router;
