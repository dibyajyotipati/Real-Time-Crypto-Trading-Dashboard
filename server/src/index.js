import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import priceRoutes from "./routes/priceRoutes.js";

import http from "http";
import { setupWebSocket } from "./services/websocket.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/price", priceRoutes);

app.get("/", (req, res) => res.send("Server running"));

const server = http.createServer(app);
setupWebSocket(server);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

server.listen(5000, () => console.log("Server running on port 5000"));
