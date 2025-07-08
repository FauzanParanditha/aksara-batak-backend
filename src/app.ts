import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import path from "path";
import { errorHandler } from "./middlewares/error.middleware";
import { requestLogger } from "./utils/logger";
import { multerErrorHandler } from "./utils/multerError";

import authRoutes from "./routes/auth.route";
import dashboardRoutes from "./routes/dashboard.route";
import emailLogRoutes from "./routes/email-log.routes";
import paylabsRoutes from "./routes/paylabs.route";
import paymentRoutes from "./routes/payment.route";
import teamRoutes from "./routes/team.route";
import teamMemberRoutes from "./routes/teamMember.route";

dotenv.config();

const app = express();
app.use(requestLogger);
app.use(errorHandler);
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(multerErrorHandler);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

//route
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/teams", teamRoutes);
app.use("/api/v1/team-members", teamMemberRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/paylabs", paylabsRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/email-logs", emailLogRoutes);

// Contoh route test
app.get("/", (req, res) => {
  res.send("Event API Running");
});

export default app;
