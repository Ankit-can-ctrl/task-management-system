const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 150,
    },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true },
);

taskSchema.index({ user: 1, createdAt: -1 });
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ user: 1, title: "text" });

taskSchema.statics.getStatsForUser = async function (userId) {
  const results = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const stats = { total: 0, pending: 0, inProgress: 0, completed: 0 };

  for (const row of results) {
    stats.total += row.count;
    if (row._id === "Pending") stats.pending = row.count;
    if (row._id === "In Progress") stats.inProgress = row.count;
    if (row._id === "Completed") stats.completed = row.count;
  }

  return stats;
};

module.exports = mongoose.model("Task", taskSchema);
