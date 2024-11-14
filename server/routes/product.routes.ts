import { Router } from "express";
import { UserRole } from "../dto/user.dto";
import ValidationMiddleware from "../middleware/validation.middleware";
import { authorizeRole } from "../middleware/auth.middleware";
import {
  createProductHandler,
  deleteProductHandler,
  listProductsHandler,
  searchProductsHandler,
} from "../controllers/product.controller";
import { CreateProductSchema, searchProductSchema } from "../dto/product.dto";

const router: Router = Router();
const agentOnly = authorizeRole([UserRole.AGENT]);

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         name:
 *           type: string
 *           example: Sample Product
 *         description:
 *           type: string
 *           example: This is a sample product description
 *     SearchProduct:
 *       type: object
 *       required:
 *         - query
 *       properties:
 *         query:
 *           type: string
 *           example: search term
 */

/**
 * @swagger
 * /products/list:
 *   get:
 *     tags:
 *       - Products
 *     summary: List all products
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Agent role required
 */
router.get("/list", agentOnly, listProductsHandler);

/**
 * @swagger
 * /products:
 *   post:
 *     tags:
 *       - Products
 *     summary: Create a new product
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Agent role required
 *       400:
 *         description: Invalid input
 */
router.post(
  "/",
  agentOnly,
  ValidationMiddleware.validateBody(CreateProductSchema),
  createProductHandler
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     tags:
 *       - Products
 *     summary: Delete a product
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Agent role required
 *       404:
 *         description: Product not found
 */
router.delete("/:id", agentOnly, deleteProductHandler);

/**
 * @swagger
 * /products/search:
 *   post:
 *     tags:
 *       - Products
 *     summary: Search products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SearchProduct'
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 */
router.post(
  "/search",
  ValidationMiddleware.validateBody(searchProductSchema),
  searchProductsHandler
);

export default router;
