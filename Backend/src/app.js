import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";

import "./config/passport.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import appConfigRoutes from "./routes/appConfig.routes.js";
import categoriesRoutes from "./routes/category.routes.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use(
  session({
    secret: process.env.JWT_SECRET || "Fallback_Secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
const routePrefix = "/api/v1";
app.use(`${routePrefix}/auth`, authRoutes);
app.use(`${routePrefix}/users`, userRoutes);
app.use(`${routePrefix}/app-config`, appConfigRoutes);
app.use(`${routePrefix}/categories`, categoriesRoutes);

app.get("/", (req, res) => {
  res.send("API is running....");
});

// Global Error Handler
app.use(errorHandler);

export default app;
