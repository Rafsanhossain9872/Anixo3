/**
 * Mongoose Connection Cache — Vercel Serverless Optimized
 *
 * Prevents redundant connection spikes by reusing an existing connection
 * across warm function invocations. On cold starts a new connection is
 * established and stored in global scope for the lifetime of the container.
 */

import mongoose from "mongoose";
import { logger } from "./logger";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const g = global as typeof globalThis & { _mongooseCache?: MongooseCache };

if (!g._mongooseCache) {
  g._mongooseCache = { conn: null, promise: null };
}

const cache = g._mongooseCache;

export async function connectDB(): Promise<typeof mongoose> {
  // Return immediately if a live connection already exists
  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  if (!cache.promise) {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI environment variable is required");

    const opts: mongoose.ConnectOptions = {
      bufferCommands:          false,   // Fail fast — never queue commands without a connection
      maxPoolSize:             10,      // Max concurrent socket connections
      minPoolSize:             2,       // Keep 2 idle connections warm for immediate reuse
      serverSelectionTimeoutMS: 5_000,  // Abort connection attempt after 5 s
      socketTimeoutMS:         45_000,  // Drop idle sockets after 45 s
      connectTimeoutMS:        10_000,  // Initial TCP handshake timeout
    };

    cache.promise = mongoose
      .connect(mongoUri, opts)
      .then((conn) => {
        logger.info("MongoDB connected (cached pool)");
        return conn;
      })
      .catch((err) => {
        cache.promise = null; // Allow retry on next invocation
        logger.error({ err }, "MongoDB connection failed");
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
