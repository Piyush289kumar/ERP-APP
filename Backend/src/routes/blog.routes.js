import { Router } from "express";
import { getAllFeatureBlogs } from "../controllers/blog.controller.js";

const router = Router();

router.get("/", getAllFeatureBlogs);

export default router;
