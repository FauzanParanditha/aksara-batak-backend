import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import helmet from "helmet";
import path from "path";
import { errorHandler } from "./middlewares/error.middleware";
import { requestLogger } from "./utils/logger";
import { multerErrorHandler } from "./utils/multerError";

import announcementRoutes from "./routes/announcement.route";
import authRoutes from "./routes/auth.route";
import dashboardRoutes from "./routes/dashboard.route";
import emailLogRoutes from "./routes/email-log.routes";
import paylabsRoutes from "./routes/paylabs.route";
import paymentRoutes from "./routes/payment.route";
import verifiedLogRoutes from "./routes/paymentVerified-log.routes";
import scoreRoutes from "./routes/score.route";
import teamRoutes from "./routes/team.route";
import teamMemberRoutes from "./routes/teamMember.route";
import userRoutes from "./routes/user.route";

dotenv.config();

const allowedFile = "./allowed-origins.json";
const pendingFile = "./pending-origins.json";

if (!fs.existsSync(allowedFile)) {
  fs.writeFileSync(allowedFile, JSON.stringify([], null, 2));
}
if (!fs.existsSync(pendingFile)) {
  fs.writeFileSync(pendingFile, JSON.stringify([], null, 2));
}

let allowedOrigins = JSON.parse(fs.readFileSync(allowedFile, "utf-8"));

const app = express();
app.use(requestLogger);
app.use(errorHandler);
app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Kalau origin ada di daftar allowed → izinkan
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Origin belum diizinkan → masukkan ke pending list jika belum ada
      let pendingOrigins = JSON.parse(fs.readFileSync(pendingFile, "utf-8"));
      if (!pendingOrigins.includes(origin)) {
        pendingOrigins.push(origin);
        fs.writeFileSync(pendingFile, JSON.stringify(pendingOrigins, null, 2));
        console.log(
          `❌ Origin ${origin} diblokir dan ditambahkan ke pending-origins.json untuk direview.`
        );
      }

      // Blok request
      return callback(new Error(`CORS blocked: Origin ${origin} not allowed`));
    },
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
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/team-members", teamMemberRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/paylabs", paylabsRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/email-logs", emailLogRoutes);
app.use("/api/v1/verified-logs", verifiedLogRoutes);
app.use("/api/v1/announcements", announcementRoutes);
app.use("/api/v1/scores", scoreRoutes);

// Contoh route test
app.get("/", (req, res) => {
  res.send("Event API Running");
});

export default app;
