import Router from "express";
import {
  getActivePoliciesBySlug,
  getAllActivePolicies,
  getAllPolicies,
  modifyPolicy,
} from "../controllers/policy.controller.js";
import { ensureAuth } from "../middleware/authMiddleware.js";

const router = Router();

// Public Routes
router.get("/", getAllActivePolicies);
router.get("/view/:slug", getActivePoliciesBySlug);
// Protected Routes
router.get("/admin", ensureAuth, getAllPolicies);
router.post("/admin/save", ensureAuth, modifyPolicy);

export default router;
