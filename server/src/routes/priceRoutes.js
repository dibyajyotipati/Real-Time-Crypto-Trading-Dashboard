import express from "express";
import { getBTCPrice } from "../controllers/priceController.js";

const router = express.Router();

router.get("/btc", getBTCPrice);

export default router;
