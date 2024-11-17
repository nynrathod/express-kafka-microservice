import express from "express";

const router = express.Router();

router.post("/signup", (req, res) => {
  res.send("Signup route");
});

router.post("/login", (req, res) => {
  res.send("login route");
});

export default router;
