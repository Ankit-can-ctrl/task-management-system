require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "ok" : "degraded",
    db: dbConnected ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));
app.use(errorMiddleware);

module.exports = app;
