import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import quizRoutes from "./routes/quizRoutes.js";
import userStatsRoutes from "./routes/userStatsRoutes.js";

// Load .env file only if it exists (local development)
dotenv.config();

const app = express();
// Render provides PORT via environment, fallback to 10000 (Render's typical default)
const PORT = process.env.PORT || 10000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/quiz-app";

// Debug logging for Render
console.log("🔍 Environment Check:");
console.log("PORT from env:", process.env.PORT);
console.log("PORT to use:", PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);

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
    // Listen on all interfaces (0.0.0.0) for Render
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Listening on 0.0.0.0:${PORT}`);
    });

    // Handle server errors
    server.on("error", (error) => {
      console.error("❌ Server error:", error);
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use`);
      }
    });

    // Confirm server is listening
    server.on("listening", () => {
      const addr = server.address();
      console.log(
        `✅ HTTP server successfully bound to ${addr.address}:${addr.port}`
      );
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });
