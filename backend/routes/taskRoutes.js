const express = require("express");
const { body } = require("express-validator");
const {
  getTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect); // every task route requires a valid JWT

const taskValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("status").optional().isIn(["Pending", "In Progress", "Completed"]),
  body("priority").optional().isIn(["Low", "Medium", "High"]),
  body("dueDate").optional({ checkFalsy: true }).isISO8601(),
];

router.get("/stats", getTaskStats);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.post("/", taskValidation, createTask);
router.put("/:id", taskValidation, updateTask);
router.delete("/:id", deleteTask);

module.exports = router;
