import express from "express";
import { getBTCPrice } from "../controllers/priceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected price route
router.get("/protected", protect, getBTCPrice);

export default router;
