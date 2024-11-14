/**
 * Product model for Lost and Found system
 */
import mongoose, { model, Model } from "mongoose";
import { Product, ProductStatus } from "../dto/product.dto";

export interface IProduct extends mongoose.Document, Product {
  createdAt: Date;
  updatedAt: Date;
  isFound(): boolean; 
  isReturned(): boolean;
}

export interface IProductModel extends Model<IProduct> {
  findByKeywords(keywords: string[]): Promise<IProduct[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<IProduct[]>;
}

const productSchema = new mongoose.Schema(
  { 
    description: {
      type: String,
      required: true,
      trim: true,
    },
    keywords: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    foundTime: {
      type: Date,
      required: true,
    },
    foundLocation: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.FOUND,
      required: true,
      index: true,
    },
    foundByAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    claimedByPassengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    returnedTime: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toObject: { getters: true },
    toJSON: { getters: true },
  }
);

// Create indexes for efficient searching
productSchema.index({ keywords: 1 });
productSchema.index({ foundTime: 1 });

// Status check methods
productSchema.methods.isFound = function (): boolean {
  return this.status === ProductStatus.FOUND;
};

productSchema.methods.isReturned = function (): boolean {
  return this.status === ProductStatus.RETURNED;
};

// Static methods for searching
productSchema.statics.findByKeywords = function (keywords: string[]) {
  return this.find({
    keywords: { $in: keywords.map((keyword) => new RegExp(keyword, "i")) },
  }).exec();
};

productSchema.statics.findByDateRange = function (
  startDate: Date,
  endDate: Date
) {
  return this.find({
    foundTime: {
      $gte: startDate,
      $lte: endDate,
    },
  }).exec();
};

const Product = model<IProduct, IProductModel>("Product", productSchema);

export default Product;
