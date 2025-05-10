import { Router } from "express";
import { TaskController } from "../controllers/TaskController";

export function createRoutes(taskController: TaskController): Router {
  const router = Router();

  router.get("/fetchAllTasks", taskController.fetchAllTasks);

  return router;
}
