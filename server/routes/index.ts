/**
 * App routes definitions.
 */

/**
 * @openapi
 * tags:
 *   - name: Products
 *     description: Product management endpoints
 *   - name: Auth
 *     description: Authentication endpoints
 *   - name: Health
 *     description: Health check endpoints
 */
import { Express } from "express";
import { authenticateJWT, authorizeRole } from "../middleware/auth.middleware";
import healthRoutes from "./health.routes";
import authRoutes from "./auth.routes";
import productRoutes from "./product.routes";

function setRoutes(app: Express) {
  app.use("/healthcheck", healthRoutes);
  app.use("/auth", authRoutes);
  app.use("/products", authenticateJWT, productRoutes); 
}

export default setRoutes;
