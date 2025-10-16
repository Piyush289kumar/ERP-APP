import express from "express";
// import router from "express.router";
import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send("Welcome to the Blog API");
});

router.get("/api/users", (req, res) => {
  res.json([
    { id: 1, name: "Piyush Kumar Raikwar" },
    { id: 2, name: "Kumar" },
  ]);
});

export default router;
