/**
 * Product controllers
 */

import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { Product } from "../models";
import { CreateProduct, SearchProductRequest } from "../dto/product.dto";
import logger from "../utils/logger";
import { SearchService } from "../service/search.service";

export const listProductsHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Setup pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const total = await Product.countDocuments({});

    const products = await Product.find({})
      .sort({ foundTime: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    res.json({
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev,
      },
    });
  } catch (error) {
    logger.error("Error fetching products", error as Error);
    res.status(500).json({ message: "Error fetching products" });
  }
};

export const createProductHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const productData: CreateProduct = req.body;
    const product: Product = await Product.create({
      ...productData,
      foundByAgentId: req.user?.userId,
    });

    logger.info(`Product created successfully: ${product.description}`);
    res.status(201).json(product);
  } catch (error) {
    logger.error("Error creating product", error as Error);
    res.status(500).json({ message: "Error creating product" });
  }
};

export const deleteProductHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    await product.deleteOne();

    logger.info(`Product deleted successfully: ${product.description}`);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    logger.error("Error deleting product", error as Error);
    res.status(500).json({ message: "Error deleting product" });
  }
};

export const searchProductsHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const searchParams: SearchProductRequest = req.body;
    // Custom validation
    if (!searchParams.keywords && !searchParams.message) {
      res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: [
          {
            field: "body",
            message: "Either keywords or message must be provided",
          },
        ],
      });
      return;
    }
    const products = searchParams.keywords
      ? await SearchService.searchByKeywords(req.body)
      : await SearchService.searchByMessage(req.body); 
    res.json({
      data: products,
    });
  } catch (error) {
    logger.error("Error searching products", error as Error);
    res.status(500).json({
      status: "error",
      message: "Error searching products",
    });
  }
};
