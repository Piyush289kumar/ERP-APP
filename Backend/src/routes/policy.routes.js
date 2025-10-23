import Router from "express";
import {
  getAllActivePolicies,
  getAllPolicies,
} from "../controllers/policy.controller.js";
import { ensureAuth } from "../middleware/authMiddleware.js";

const router = Router();

// Public Routes
router.get("/", getAllActivePolicies);
// Protected Routes
router.get("/admin", ensureAuth, getAllPolicies);

export default router;
