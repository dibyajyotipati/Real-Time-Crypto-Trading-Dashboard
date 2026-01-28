import express from "express";
import { getBTCPrice } from "../controllers/priceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// PUBLIC route
router.get("/", getBTCPrice);

// PROTECTED route
router.get("/protected", protect, (req, res) => {
  res.json({
    message: "You accessed a protected route",
    user: req.user,
  });
});

export default router;
