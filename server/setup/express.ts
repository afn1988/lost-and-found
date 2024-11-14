/**
 * Setup Express app.
 */
import helmet from "helmet";
import methodOverride from "method-override";
import express, { Express } from "express";
import cookieParser from "cookie-parser";
import swaggerUi from 'swagger-ui-express';  
import { swaggerSpec } from "./swagger";
/**
 * Sets up Express app.
 *
 * @param {Express} app  The express app.
 * @returns {Express} The configured express app.
 */
function appSetup(app: Express): Express {
  app.use(helmet());
  app.use(methodOverride());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser());
  //app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  return app;
}

export default appSetup;

