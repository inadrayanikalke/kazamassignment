import winston from "winston";
import Joi from "joi";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

export const taskSchema = Joi.string().min(5).max(1000).required();
