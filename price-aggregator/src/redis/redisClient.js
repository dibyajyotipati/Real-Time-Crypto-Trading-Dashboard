import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// Publisher client
export const redisPublisher = new Redis(process.env.REDIS_URL);

// Subscriber client (not required here if you don’t subscribe)
export const redisSubscriber = new Redis(process.env.REDIS_URL);

redisPublisher.on("connect", () => console.log("Redis Publisher Connected"));
redisPublisher.on("error", (err) => console.error("Redis Publisher Error:", err));

redisSubscriber.on("connect", () => console.log("Redis Subscriber Connected"));
redisSubscriber.on("error", (err) => console.error("Redis Subscriber Error:", err));
