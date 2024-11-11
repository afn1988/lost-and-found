/**
 * App entrypoint.
 */

// Import dependencies.
import express from "express";
import dotenv from "dotenv";
import appSetup from "./server/setup/express";
import initializeDatabase from "./server/setup/mongoose";
import setRoutes from "./server/routes";
import logger from "./server/utils/logger";

// Load environment variables.
if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: "./env/.env.development" });
} else {
  dotenv.config({ path: "./env/.env.development" });
}

// Create Express app.
const app = express();

// Set up Express.
appSetup(app);

// Set up MongoDB.
initializeDatabase();

// Set up routes.
setRoutes(app);

// Start app.
const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  logger.info("App now listening on port " + PORT);
});

module.exports = app;
