import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import helmet from "helmet";
// @ts-ignore
import mongoSanitize from "express-mongo-sanitize";
// express-mongo-sanitize.sanitize() used directly (Express v5 has getter-only req.query)
import { logger } from "./lib/logger";
import { connectDB } from "./lib/db";
import { readFileSync } from "fs";
import { join } from "path";

// Import JS routes from backend-core
// @ts-ignore
import authRoutes from "./routes/authRoutes.js";
// @ts-ignore
import watchlistRoutes from "./routes/watchlistRoutes.js";
// @ts-ignore
import progressRoutes from "./routes/progressRoutes.js";
// @ts-ignore
import settingsRoutes from "./routes/settingsRoutes.js";
// @ts-ignore
import notificationRoutes from "./routes/notificationRoutes.js";

import healthRouter from "./routes/health";
import proxyRouter from "./routes/proxy";
import streamRouter from "./routes/stream";
import adminRouter from "./routes/adminRoutes";

const app: Express = express();

// Connect to MongoDB — serverless-ready cached pool (see lib/db.ts)
if (process.env.MONGO_URI) {
  connectDB().catch((err) => logger.error({ err }, "MongoDB connection failed"));
} else {
  logger.warn("MONGO_URI not set — auth/user features will not work");
}

// ── Security Headers (helmet) ─────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy:       false, // disabled — we embed third-party iframes
    crossOriginEmbedderPolicy:   false, // disabled — needed for embedded media
    crossOriginResourcePolicy:   false,
  }),
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());

// ── Body Parsers with 50 kb limit (DDoS / memory-exhaustion prevention) ───────
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

// ── NoSQL Injection Sanitization (body-only; Express v5 req.query is getter-only) ───
app.use((req: any, _res: any, next: any) => {
  if (req.body && typeof req.body === "object") {
    try { req.body = mongoSanitize.sanitize(req.body); } catch { /* noop */ }
  }
  next();
});

app.set("trust proxy", 1);

// ── Admin bypass route (before maintenance middleware) ────────────────────────
app.get("/api/admin-bypass", (req, res) => {
  const { key } = req.query as { key?: string };
  const bypassKey = process.env.ADMIN_BYPASS_KEY;

  if (!bypassKey || key !== bypassKey) {
    res.status(403).json({ error: "Invalid bypass key." });
    return;
  }

  res.cookie("admin_bypass", bypassKey, {
    httpOnly: true, secure: true, sameSite: "none", maxAge: 7200000,
  });
  res.cookie("bypass_ui", "true", {
    httpOnly: false, secure: true, sameSite: "none", maxAge: 7200000,
  });

  const origin =
    req.headers.origin ||
    req.headers.referer?.split("/").slice(0, 3).join("/") ||
    "";
  res.redirect(origin + "/");
});

// ── Maintenance Middleware ────────────────────────────────────────────────────
function loadMaintenanceConfig(): Record<string, unknown> {
  try {
    const configPath = join(process.cwd(), "../anixo/public/maintenance-config.json");
    return JSON.parse(readFileSync(configPath, "utf-8"));
  } catch {
    return { isMaintenanceActive: false };
  }
}

app.use((req, res, next) => {
  const config = loadMaintenanceConfig();
  if (!config.isMaintenanceActive) return next();
  const bypassKey    = process.env.ADMIN_BYPASS_KEY;
  const bypassCookie = (req as any).cookies?.admin_bypass;
  if (bypassKey && bypassCookie === bypassKey) return next();
  res.status(503).json(config);
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/admin", adminRouter);
app.use("/api",       healthRouter);
app.use("/api",       proxyRouter);
app.use("/api",       streamRouter);
app.use("/auth",              authRoutes);
app.use("/watchlist",         watchlistRoutes);
app.use("/progress",          progressRoutes);
app.use("/settings",          settingsRoutes);
app.use("/notifications",     notificationRoutes);

export default app;
