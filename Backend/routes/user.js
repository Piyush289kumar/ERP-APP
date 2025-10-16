import { Router } from "express";

const router = Router();

router.get("/profile", (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not Authorized" });
  res.json({ user: req.user });
});

export default router;
