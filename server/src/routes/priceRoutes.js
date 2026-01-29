import express from "express";
import { getLatestPrice } from "../controllers/priceController.js";
import { authMiddleware }from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/latest", authMiddleware, getLatestPrice);

export default router;
