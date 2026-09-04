const express = require("express");
const {
  getTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");
const validate = require("../middleware/validate");
const {
  createTaskValidation,
  updateTaskValidation,
  taskQueryValidation,
} = require("../validators/taskValidators");

const router = express.Router();
router.use(protect);

router.get("/stats", getTaskStats);
router.get("/", taskQueryValidation, validate, getTasks);
router.get("/:id", validateObjectId(), getTaskById);
router.post("/", createTaskValidation, validate, createTask);
router.put("/:id", validateObjectId(), updateTaskValidation, validate, updateTask);
router.delete("/:id", validateObjectId(), deleteTask);

module.exports = router;
