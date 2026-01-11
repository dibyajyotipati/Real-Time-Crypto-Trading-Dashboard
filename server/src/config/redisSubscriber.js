import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redisSubscriber = new Redis(process.env.REDIS_URL);

redisSubscriber.on("connect", () => console.log("Redis Subscriber Connected"));
redisSubscriber.on("error", (err) => console.error("Redis Subscriber Error:", err));

export default redisSubscriber;
