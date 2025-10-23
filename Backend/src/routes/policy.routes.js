import Router from "express";
import {
  destroyPolicyById,
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
router.delete("/admin/destroy/:id", ensureAuth, destroyPolicyById);

export default router;
