require("dotenv").config();
const mongoose = require("mongoose");
const validateEnv = require("./config/env");
const connectDB = require("./config/db");
const app = require("./app");

validateEnv();
connectDB();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully`);
  server.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
