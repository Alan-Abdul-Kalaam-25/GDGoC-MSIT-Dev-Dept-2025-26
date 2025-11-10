import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import quizRoutes from "./routes/quizRoutes.js";
import userStatsRoutes from "./routes/userStatsRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/quiz-app";

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/quiz", quizRoutes);
app.use("/api/stats", userStatsRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Quiz App API is running!" });
});

// MongoDB Connection
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });
