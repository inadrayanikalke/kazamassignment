import mqtt from "mqtt";
import config from "../config";
import { logger, taskSchema } from "../utils/logger";
import { TaskService } from "../services/TaskService";

export async function initMQTTClient(taskService: TaskService) {
  const client = mqtt.connect(config.MQTT_BROKER, {
    port: config.MQTT_PORT,
    username: config.MQTT_USERNAME,
    password: config.MQTT_PASSWORD,
    rejectUnauthorized: false,
  });

  client.on("connect", () => {
    logger.info("MQTT connected");
    client.subscribe("/add");
  });

  client.on("message", async (topic, message) => {
    if (topic === "/add") {
      const task = message.toString();
      const { error } = taskSchema.validate(task);

      if (error) {
        logger.warn(`Invalid task received: ${error.message}`);
        return;
      }

      logger.info(`Received task via MQTT: ${task}`);
      await taskService.addTask(task);
    }
  });

  client.on("error", (err) => {
    logger.error("MQTT error:", err);
  });
}
