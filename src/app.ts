import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { createClient, RedisClientType } from "redis";
import config from "./config";
import { TaskService } from "./services/TaskService";
import { TaskController } from "./controllers/TaskController";
import { createRoutes } from "./routes/taskRoutes";
import { initMQTTClient } from "./mqtt/mqttClient";
import { logger } from "./utils/logger";
console.log("hi");
async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // MongoDB Connection
  await mongoose.connect(config.MONGO_URI, {
    serverSelectionTimeoutMS: 10000, // fail after 10s if can't connect
    socketTimeoutMS: 45000,
  });
  logger.info("MongoDB connected");

  // Add mongoose disconnect listener
  mongoose.connection.on("disconnected", () => {
    logger.error("MongoDB disconnected");
  });

  mongoose.connection.on("error", (err) => {
    logger.error("MongoDB connection error:", err);
  });

  // Redis Connection
  const redisClient: RedisClientType = createClient({
    url: config.REDIS_URL,
  });
  await redisClient.connect();

  redisClient.on("error", (err) => {
    logger.error("Redis Client Error:", err);
  });

  logger.info("Redis connected");

  // Services & Controllers
  const taskService = new TaskService(redisClient);
  const taskController = new TaskController(taskService);

  app.use("/api", createRoutes(taskController));

  // MQTT Client Init
  await initMQTTClient(taskService);

  app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`);
  });
}

startServer().catch((err) => {
  logger.error("Failed to start server:", err);
});

export default startServer;
