const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");

// Security modules
let helmet, rateLimit, mongoSanitize;
try {
  helmet = require("helmet");
  rateLimit = require("express-rate-limit");
  mongoSanitize = require("express-mongo-sanitize");
} catch (e) {
  console.warn(
    "⚠️ Security modules not installed yet. Skipping advanced security.",
  );
}

// Configuration
const envPath = path.join(__dirname, "../.env");
dotenv.config({ path: envPath });

let mongoConnected = false;
let mongoError = null;

// Import routes
const departmentRoutes = require("./routes/departmentRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const adminRoutes = require("./routes/adminRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const sectorRoutes = require("./routes/sectorRoutes");
const sectorAdminRoutes = require("./routes/sectorAdminRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const systemComplaintRoutes = require("./routes/systemComplaintRoutes");
const { verifyEmailConnection } = require("./utils/emailService");

const app = express();

// ==========================================
// SECURITY MIDDLEWARES
// ==========================================
if (helmet) {
  app.use(helmet());
} else {
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
  });
}

if (mongoSanitize) {
  app.use(mongoSanitize());
}

// ==========================================
// CORS (MUST BE BEFORE ROUTES!)
// ==========================================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "https://mintnavigation1.netlify.app",
      "https://mintnavigation.netlify.app",
      "https://mint-navigation-u0hc.onrender.com",
      "https://minthiwigitien.netlify.app", // Production frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);

// ==========================================
// BODY PARSERS
// ==========================================
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ==========================================
// RATE LIMITING
// ==========================================
if (rateLimit) {
  const limiter = rateLimit({
    max: 1000,
    windowMs: 15 * 60 * 1000,
    message: "Too many requests from this IP, please try again in 15 minutes.",
  });
  app.use("/api", limiter);
}

// ==========================================
// MONGODB CONNECTION
// ==========================================
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    mongoConnected = true;
    console.log("✅ [DATABASE] Connected to  MongoDB atlas");
  })
  .catch((err) => {
    mongoError = err;
    console.error("❌ [DATABASE] Connection Error:", err.message);
  });

// ==========================================
// HEALTH CHECK
// ==========================================
app.get("/api/health", (req, res) => {
  res.json({
    status: "ONLINE",
    database:
      mongoose.connection.readyState === 1 ? "CONNECTED" : "DISCONNECTED",
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// DB CONNECTION MIDDLEWARE
// ==========================================
app.use("/api", (req, res, next) => {
  if (req.path === "/health") return next();
  if (mongoose.connection.readyState === 1) return next();
  return res.status(503).json({
    message: "System initialization in progress. Please wait.",
    error:
      process.env.NODE_ENV === "development" ? mongoError?.message : undefined,
  });
});

// ==========================================
// API ROUTES (ALL AFTER CORS)
// ==========================================
app.use("/api/sectors", sectorAdminRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/sector", sectorRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/system-complaints", systemComplaintRoutes);

// ==========================================
// ERROR HANDLING
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    message: `Resource not found: ${req.originalUrl}`,
    error: "Check API endpoint spelling",
  });
});

app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({
    message: "A critical server error occurred",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal Server Error",
  });
});

// ==========================================
// SERVER STARTUP
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("\n-------------------------------------------");
  console.log(`🚀 MINT BACKEND: RUNNING IN DEV MODE`);
  console.log(`📡 LOCAL ACCESS: http://localhost:${PORT}/api`);
  console.log("-------------------------------------------\n");
  // Verify email SMTP connection on startup
  verifyEmailConnection();
});
