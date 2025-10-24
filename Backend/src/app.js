import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import path from "path";
import { fileURLToPath } from "url";

// 🧩 Local Imports
import "./config/passport.js";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";

// 🗂 Routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import appConfigRoutes from "./routes/appConfig.routes.js";
import categoriesRoutes from "./routes/category.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import galleryRoutes from "./routes/gallery.routes.js";
import testimonialRoutes from "./routes/testimonials.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import policyRoutes from "./routes/policy.routes.js";
import contatUsRoutes from "./routes/contactus.routes.js";

// ===============================================
// 🧠 Environment Config
// ===============================================
dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const routePrefix = "/api/v1";

// ===============================================
// ⚙️ Database Connection
// ===============================================
connectDB();

// ===============================================
// 🧱 Core Middleware
// ===============================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors({ origin: process.env.FRONTEND_URL || "*", credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(morgan("dev"));
app.use(hpp()); // Prevent HTTP parameter pollution

// ===============================================
// ⚡ Rate Limiting
// ===============================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200, // Limit each IP
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// ===============================================
// 🔐 Session & Passport Config
// ===============================================
app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      process.env.JWT_SECRET ||
      "SuperSecretKey_123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ===============================================
// 🗂️ Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===============================================
// 🚏 API Routes
// ===============================================
app.use(`${routePrefix}/auth`, authRoutes);
app.use(`${routePrefix}/users`, userRoutes);
app.use(`${routePrefix}/app-config`, appConfigRoutes);
app.use(`${routePrefix}/categories`, categoriesRoutes);
app.use(`${routePrefix}/blog`, blogRoutes);
app.use(`${routePrefix}/comments`, commentRoutes);
app.use(`${routePrefix}/gallery`, galleryRoutes);
app.use(`${routePrefix}/testimonial`, testimonialRoutes);
app.use(`${routePrefix}/service`, serviceRoutes);
app.use(`${routePrefix}/policy`, policyRoutes);
app.use(`${routePrefix}/contact`, contatUsRoutes);

// ===============================================
// 🩵 Health Check
// ===============================================
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "🚀 API is running successfully!",
    version: "v1.0.0",
    env: process.env.NODE_ENV,
  });
});

// ===============================================
// 🧰 Global Error Handler
// ===============================================
app.use(errorHandler);

// ===============================================
// 🚀 Start Server
// ===============================================
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

export default app;
