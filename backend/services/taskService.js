const Task = require("../models/Task");
const AppError = require("../utils/AppError");
const { ALLOWED_SORT_FIELDS } = require("../utils/constants");

const getTasksForUser = async (userId, filters) => {
  const {
    search = "",
    status,
    priority,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
  } = filters;

  const query = { user: userId };

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

  return {
    tasks,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      limit: limitNum,
    },
  };
};

const getStatsForUser = (userId) => Task.getStatsForUser(userId);

const getTaskByIdForUser = async (taskId, userId) => {
  const task = await Task.findOne({ _id: taskId, user: userId });
  if (!task) throw new AppError("Task not found", 404);
  return task;
};

const createTaskForUser = async (userId, data) => {
  const { title, description, status, priority, dueDate } = data;
  return Task.create({
    user: userId,
    title,
    description,
    status,
    priority,
    dueDate: dueDate || null,
  });
};

const updateTaskForUser = async (taskId, userId, data) => {
  const task = await Task.findOne({ _id: taskId, user: userId });
  if (!task) throw new AppError("Task not found", 404);

  const { title, description, status, priority, dueDate } = data;
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate || null;

  return task.save();
};

const deleteTaskForUser = async (taskId, userId) => {
  const task = await Task.findOneAndDelete({ _id: taskId, user: userId });
  if (!task) throw new AppError("Task not found", 404);
  return task;
};

module.exports = {
  getTasksForUser,
  getStatsForUser,
  getTaskByIdForUser,
  createTaskForUser,
  updateTaskForUser,
  deleteTaskForUser,
};
