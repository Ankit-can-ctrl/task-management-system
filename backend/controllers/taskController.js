const taskService = require("../services/taskService");
const asyncHandler = require("../middleware/asyncHandler");

const getTasks = asyncHandler(async (req, res) => {
  const result = await taskService.getTasksForUser(req.user._id, req.query);
  res.status(200).json(result);
});

const getTaskStats = asyncHandler(async (req, res) => {
  const stats = await taskService.getStatsForUser(req.user._id);
  res.status(200).json(stats);
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskByIdForUser(req.params.id, req.user._id);
  res.status(200).json(task);
});

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTaskForUser(req.user._id, req.body);
  res.status(201).json(task);
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTaskForUser(req.params.id, req.user._id, req.body);
  res.status(200).json(task);
});

const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTaskForUser(req.params.id, req.user._id);
  res.status(200).json({ message: "Task deleted successfully", id: req.params.id });
});

module.exports = {
  getTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
