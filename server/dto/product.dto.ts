/**
 * Zod Schema for Product
 */

import { z } from "zod";

export enum ProductStatus {
  FOUND = "found", 
  RETURNED = "returned",
}

const ProductStatusEnum = z.enum([
  ProductStatus.FOUND, 
  ProductStatus.RETURNED,
]);

export const ProductSchema = z.object({
  description: z.string().min(1),
  keywords: z.array(z.string()).min(1),
  foundTime: z.string().datetime(),
  foundLocation: z.string().min(1),
  status: ProductStatusEnum.default(ProductStatus.FOUND),
  foundByAgentId: z.string(),
  claimedByPassengerId: z.string().optional(),
  returnedTime: z.string().datetime().optional(),
});

export const CreateProductSchema = ProductSchema.omit({
  claimedByPassengerId: true,
  returnedTime: true,
});

export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
