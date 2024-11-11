/**
 * Setup MongoDB.
 */
import mongoose, { Connection, ConnectOptions } from "mongoose";
import logger from "../utils/logger";

// Define interface for MongoDB connection events
interface MongoConnectionEvents {
  connected: string;
  open: string;
  error: (err: Error) => void;
  disconnected: string;
  reconnected: string;
  close: string;
}

// Define MongoDB connection options interface
interface MongoConnectionOptions extends ConnectOptions {
  connectTimeoutMS: number;
  serverSelectionTimeoutMS: number;
  maxPoolSize: number;
}

async function initializeDatabase(): Promise<void> {
  try {
    const connection = await mongoSetup();
    if (!connection) {
      throw new Error("Failed to establish MongoDB connection");
    }
    // Database connected successfully
  } catch (error) {
    logger.error("Database initialization failed", error as Error);
    process.exit(1);
  }
}

async function mongoSetup() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("DATABASE_URL is not set");
  }

  const connectionOptions: MongoConnectionOptions = {
    connectTimeoutMS: 20000,
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 75,
  };

  // Setup connection event handlers
  const setupConnectionEvents = (connection: Connection): void => {
    const events: MongoConnectionEvents = {
      connected: `Connected to database`,
      open: "Connection opened",
      error: (err: Error) => {
        logger.error(
          "MongoDB connection error! Throwing error to restart application",
          err
        );
        throw new Error("MongoDB disconnected");
      },
      disconnected: "Disconnected, Reconnecting...",
      reconnected: "Reconnected",
      close: "Closed",
    };

    // Bind events to connection
    Object.entries(events).forEach(([event, handler]) => {
      connection.on(
        event,
        typeof handler === "string" ? () => logger.info(handler) : handler
      );
    });
  };

  try {
    // Check if we already have a connection
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    // Setup event handlers
    setupConnectionEvents(mongoose.connection);

    // Connect to MongoDB
    await mongoose.connect(uri, connectionOptions);

    return mongoose.connection;
  } catch (error) {
    logger.error(
      "Unable to connect MongoDB. If problem persists, please restart the server",
      error as Error
    );
    return null;
  }
}

export default initializeDatabase;
