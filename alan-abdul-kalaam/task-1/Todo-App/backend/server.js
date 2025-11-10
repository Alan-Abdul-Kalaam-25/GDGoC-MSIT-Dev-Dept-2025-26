import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./src/routes/auth.js";
import taskRoutes from "./src/routes/tasks.js";
import listRoutes from "./src/routes/lists.js";
import userRoutes from "./src/routes/user.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

async function start() {
  const mongo = process.env.MONGO_URI;
  await mongoose.connect(mongo);
  console.log("Connected to MongoDB");

  app.use("/api/auth", authRoutes);
  app.use("/api/tasks", taskRoutes);
  app.use("/api/lists", listRoutes);
  app.use("/api/user", userRoutes);

  // Root route - welcome message
  app.get("/", (req, res) => {
    res.json({
      message: "🎮 TodoQuest API is running!",
      version: "1.0.0",
      endpoints: {
        auth: {
          signup: "POST /api/auth/signup",
          login: "POST /api/auth/login",
        },
        tasks: {
          list: "GET /api/tasks (protected)",
          create: "POST /api/tasks (protected)",
          update: "PUT /api/tasks/:id (protected)",
          delete: "DELETE /api/tasks/:id (protected)",
        },
        user: {
          getProfile: "GET /api/user/profile (protected)",
          updateProfile: "PUT /api/user/profile (protected)",
          updateAvatar: "PUT /api/user/avatar (protected)",
          getSettings: "GET /api/user/settings (protected)",
          updateSettings: "PUT /api/user/settings (protected)",
          getStats: "GET /api/user/stats (protected)",
        },
        health: "GET /api/health",
      },
    });
  });

  app.get("/api/health", (req, res) => res.json({ ok: true }));

  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
