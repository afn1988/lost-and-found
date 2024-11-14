/**
 * Zod Schema for Product
 */

import { z } from "zod";

export enum ProductStatus {
  FOUND = "found",
  RETURNED = "returned",
}

const ProductStatusEnum = z.enum([ProductStatus.FOUND, ProductStatus.RETURNED]);

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
  foundByAgentId: true,
  claimedByPassengerId: true,
  returnedTime: true,
});

export const searchProductSchema = z.object({
  keywords: z.array(z.string()).optional(),
  message: z.string().optional(),
  startDate: z.string().datetime({
    message: "Invalid start date format. Must be ISO 8601 format",
  }),
  endDate: z
    .string()
    .datetime({ message: "Invalid end date format. Must be ISO 8601 format" }),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

//   .refine((data) => data.keywords || data.message, {
//     message: "Either keywords or message must be provided",
//   });

export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type SearchProductRequest = z.infer<typeof searchProductSchema>;
