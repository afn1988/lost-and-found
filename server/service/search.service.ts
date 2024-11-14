/**
 * Service for searching products
 */

import { SearchProductRequest } from "../dto/product.dto";
import { Product } from "../models";
import OpenAI from "openai";
import logger from "../utils/logger";
import { FilterQuery } from "mongoose";
import { IProduct } from "../models/product.model";

interface SearchResult {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class SearchService {
  private static openai = new OpenAI({
    apiKey: process.env["OPENAI_API_KEY"],
  });

  public static async searchByKeywords(
    searchParams: SearchProductRequest
  ): Promise<SearchResult> {
    const { keywords, startDate, endDate, page = 1, limit = 10 } = searchParams;

    if (!keywords?.length)
      return {
        items: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };

      const query: FilterQuery<IProduct> = {
        keywords: {
          $in: keywords.map(keyword => new RegExp(keyword, 'i'))
        }
      };

    // Add date range if provided
    if (startDate || endDate) {
      query.foundTime = {};
      if (startDate) query.foundTime.$gte = new Date(startDate);
      if (endDate) query.foundTime.$lte = new Date(endDate);
    }

    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const items = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ foundTime: -1 });

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  public static async searchByMessage(
    searchParams: SearchProductRequest
  ): Promise<SearchResult> {
    if (!searchParams.message) {
      return {
        items: [],
        total: 0,
        page: searchParams.page || 1,
        limit: searchParams.limit || 10,
        totalPages: 0,
      };
    }
    try {
      const chatCompletion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Extract relevant keywords for product search from the following message. Return only keywords as a comma-separated list.",
          },
          {
            role: "user",
            content: searchParams.message,
          },
        ],
      });

      const keywords =
        chatCompletion.choices[0].message.content
          ?.split(",")
          .map((k) => k.trim())
          .filter((k) => k.length > 0) || [];

      return this.searchByKeywords({
        ...searchParams,
        keywords,
      });
    } catch (error) {
      logger.error("Failed to process message search on OPENAI", error as Error);
      throw new Error("Failed to process message search");
    }
  }
}
