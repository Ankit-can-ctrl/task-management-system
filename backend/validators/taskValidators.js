const { body, query } = require("express-validator");
const { TASK_STATUSES, TASK_PRIORITIES, ALLOWED_SORT_FIELDS } = require("../utils/constants");

const createTaskValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").optional().trim().isLength({ max: 2000 }),
  body("status").optional().isIn(TASK_STATUSES).withMessage("Invalid status"),
  body("priority").optional().isIn(TASK_PRIORITIES).withMessage("Invalid priority"),
  body("dueDate").optional({ checkFalsy: true }).isISO8601().withMessage("Invalid due date"),
];

const updateTaskValidation = [
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
  body("description").optional().trim().isLength({ max: 2000 }),
  body("status").optional().isIn(TASK_STATUSES).withMessage("Invalid status"),
  body("priority").optional().isIn(TASK_PRIORITIES).withMessage("Invalid priority"),
  body("dueDate").optional({ nullable: true }).isISO8601().withMessage("Invalid due date"),
];

const taskQueryValidation = [
  query("search").optional().trim().isLength({ max: 150 }),
  query("status").optional().isIn(TASK_STATUSES).withMessage("Invalid status filter"),
  query("priority").optional().isIn(TASK_PRIORITIES).withMessage("Invalid priority filter"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  query("sortBy").optional().isIn(ALLOWED_SORT_FIELDS).withMessage("Invalid sort field"),
  query("order").optional().isIn(["asc", "desc"]).withMessage("Order must be asc or desc"),
];

module.exports = {
  createTaskValidation,
  updateTaskValidation,
  taskQueryValidation,
};
