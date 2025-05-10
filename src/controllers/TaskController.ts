import { Request, Response } from "express";
import { TaskService } from "../services/TaskService";

export class TaskController {
  private readonly taskService: TaskService;

  constructor(taskService: TaskService) {
    this.taskService = taskService;
  }

  fetchAllTasks = async (req: Request, res: Response) => {
    const tasks = await this.taskService.getAllTasks();
    res.json({ tasks });
  };
}
