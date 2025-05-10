import Redis from "redis";
import config from "../config";
import { logger } from "../utils/logger";
import { TaskModel } from "../models/Task";

export class TaskService {
  private readonly redisClient: Redis.RedisClientType;
  private readonly redisKey: string;

  constructor(redisClient: Redis.RedisClientType) {
    this.redisClient = redisClient;
    this.redisKey = config.REDIS_KEY;
  }

  async addTask(task: string): Promise<void> {
    const tasks = await this.getTasksFromCache();
    tasks.push(task);

    if (tasks.length > 50) {
      logger.info("Flushing tasks to MongoDB...");
      await TaskModel.insertMany(tasks.map((t) => ({ text: t })));
      await this.redisClient.set(this.redisKey, JSON.stringify([]));
    } else {
      await this.redisClient.set(this.redisKey, JSON.stringify(tasks));
    }
  }

  async getTasksFromCache(): Promise<string[]> {
    const data = await this.redisClient.get(this.redisKey);
    return data ? JSON.parse(data) : [];
  }

  async getAllTasks(): Promise<string[]> {
    const tasks = await this.getTasksFromCache();
    const mongoTasks = await TaskModel.find().lean();
    return [...tasks, ...mongoTasks.map((t) => t.text)];
  }
}
