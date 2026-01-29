import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import priceRoutes from "./routes/priceRoutes.js";
import candleRoutes from "./routes/candleRoutes.js";

import http from "http";
import { setupWebSocket } from "./services/websocket.js";

// Load env first
dotenv.config();

// Create express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/api/price", priceRoutes);
app.use("/api/candle", candleRoutes);
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Create server AFTER app is defined
const server = http.createServer(app);

// Setup websocket on this server
setupWebSocket(server);

// Start server
server.listen(5000, () => {
  console.log("Server & WebSocket running on port 5000");
});

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB Error:", err));
