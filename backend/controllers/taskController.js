const Task = require("../models/Task");
const AppError = require("../utils/AppError");
const asyncHandler = require("../middleware/asyncHandler");
const { ALLOWED_SORT_FIELDS } = require("../utils/constants");

const getTasks = asyncHandler(async (req, res) => {
  const {
    search = "",
    status,
    priority,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const query = { user: req.user._id };

  if (search.trim()) query.title = { $regex: search.trim(), $options: "i" };
  if (status) query.status = status;
  if (priority) query.priority = priority;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
  const sortOptions = { [safeSortBy]: order === "asc" ? 1 : -1 };

  const [tasks, totalCount] = await Promise.all([
    Task.find(query).sort(sortOptions).skip(skip).limit(limitNum),
    Task.countDocuments(query),
  ]);

  res.status(200).json({
    tasks,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      limit: limitNum,
    },
  });
});

const getTaskStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const [total, pending, inProgress, completed] = await Promise.all([
    Task.countDocuments({ user: userId }),
    Task.countDocuments({ user: userId, status: "Pending" }),
    Task.countDocuments({ user: userId, status: "In Progress" }),
    Task.countDocuments({ user: userId, status: "Completed" }),
  ]);
  res.status(200).json({ total, pending, inProgress, completed });
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) throw new AppError("Task not found", 404);
  res.status(200).json(task);
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;
  const task = await Task.create({
    user: req.user._id,
    title,
    description,
    status,
    priority,
    dueDate: dueDate || null,
  });
  res.status(201).json(task);
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) throw new AppError("Task not found", 404);

  const { title, description, status, priority, dueDate } = req.body;
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate || null;

  const updatedTask = await task.save();
  res.status(200).json(updatedTask);
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!task) throw new AppError("Task not found", 404);
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
