import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";

import "./config/passport.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.routes.js";
// import eauthRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use(
    session({
        secret : process.env.JWT_SECRET || "Fallback_Secret";
        resave: false,
        saveUninitialized : false,
    })
);


app.use(passport.initialize());
app.use(passport.session());


// Routes
const routePrefix = "/api/v1/"
app.use(`${routePrefix}/auth`, authRoutes);
app.use(`${routePrefix}/users`, userRoutes);


app.get("/", (req,res)=>{
    res.send("API is running....");
})


// Global Error Handler
// app.use(error)

export default app;