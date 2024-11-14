import { expect } from "chai";
import sinon from "sinon";
import dotenv from "dotenv";
import { Response } from "express";
import { AuthRequest } from "../server/middleware/auth.middleware";
import { Product } from "../server/models";
import { SearchService } from "../server/service/search.service";
import {
  listProductsHandler,
  createProductHandler,
  deleteProductHandler,
  searchProductsHandler,
} from "../server/controllers/product.controller";
import { UserRole } from "../server/dto/user.dto";

describe("Product Controllers", () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let statusStub: sinon.SinonStub;
  let jsonStub: sinon.SinonStub;

  before(() => {
    if (process.env.NODE_ENV === "development") {
      dotenv.config({ path: "../env/.env.development" });
    } else {
      dotenv.config({ path: "../env/.env.development" });
    }
  });

  beforeEach(() => {
    // Reset stubs before each test
    statusStub = sinon.stub();
    jsonStub = sinon.stub();

    res = {
      status: statusStub.returns({ json: jsonStub }),
      json: jsonStub,
    };

    req = {
      query: {},
      user: { userId: "testUserId", role: UserRole.AGENT },
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("listProductsHandler", () => {
    it("should return products with pagination", async () => {
      const mockProducts = [
        {
          description: "Gold wedding ring with inscription 'Forever & Always'",
          keywords: ["ring", "jewelry", "gold", "wedding"],
          foundTime: "2024-01-16T18:45:00Z",
          foundLocation: "Restroom near Gate A7",
        },
      ];
      const countStub = sinon.stub(Product, "countDocuments").resolves(1);
      const findStub = sinon.stub(Product, "find").returns({
        sort: () => ({
          skip: () => ({
            limit: () => ({
              exec: () => Promise.resolve(mockProducts),
            }),
          }),
        }),
      } as any);

      await listProductsHandler(req as AuthRequest, res as Response);

      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.firstCall.args[0]).to.deep.include({
        data: mockProducts,
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });
    });

    it("should handle errors", async () => {
      sinon
        .stub(Product, "countDocuments")
        .rejects(new Error("Database error"));

      await listProductsHandler(req as AuthRequest, res as Response);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: "Error fetching products" })).to.be
        .true;
    });
  });

  describe("createProductHandler", () => {
    it("should create a new product", async () => {
      const productData = {
        description: "Gold wedding ring with inscription 'Forever & Always'",
        keywords: ["ring", "jewelry", "gold", "wedding"],
        foundTime: "2024-01-16T18:45:00Z",
        foundLocation: "Restroom near Gate A7",
      };
      const mockProduct: any = { ...productData, foundByAgentId: "testUserId" };

      req.body = productData;
      sinon.stub(Product, "create").resolves(mockProduct);

      await createProductHandler(req as AuthRequest, res as Response);

      expect(statusStub.calledWith(201)).to.be.true;
      expect(jsonStub.calledWith(mockProduct)).to.be.true;
    });

    it("should handle creation errors", async () => {
      req.body = { description: "New Product" };
      sinon.stub(Product, "create").rejects(new Error("Creation error"));

      await createProductHandler(req as AuthRequest, res as Response);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: "Error creating product" })).to.be
        .true;
    });
  });

  describe("deleteProductHandler", () => {
    it("should delete an existing product", async () => {
      const mockProduct = {
        id: "testId",
        description: "Test Product",
        deleteOne: sinon.stub().resolves(),
      };

      req.params = { id: "testId" };
      sinon.stub(Product, "findById").resolves(mockProduct);

      await deleteProductHandler(req as AuthRequest, res as Response);

      expect(jsonStub.calledWith({ message: "Product deleted successfully" }))
        .to.be.true;
    });

    it("should handle non-existent product", async () => {
      req.params = { id: "nonexistentId" };
      sinon.stub(Product, "findById").resolves(null);

      await deleteProductHandler(req as AuthRequest, res as Response);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWith({ message: "Product not found" })).to.be.true;
    });
  });

  describe("searchProductsHandler", () => {
    it("should search products by keywords", async () => {
      const searchParams = { keywords: ["test"] };
      const mockProducts: any = [{ id: 1, name: "Test Product" }];

      req.body = searchParams;
      sinon.stub(SearchService, "searchByKeywords").resolves(mockProducts);

      await searchProductsHandler(req as AuthRequest, res as Response);

      expect(jsonStub.calledWith({ data: mockProducts })).to.be.true;
    });

    it("should search products by message", async () => {
      const searchParams = { message: "test message" };
      const mockProducts: any = [
        {
          description: "Gold wedding ring with inscription 'Forever & Always'",
          keywords: ["ring", "jewelry", "gold", "wedding"],
          foundTime: "2024-01-16T18:45:00Z",
          foundLocation: "Restroom near Gate A7",
        },
      ];

      req.body = searchParams;
      sinon.stub(SearchService, "searchByMessage").resolves(mockProducts);

      await searchProductsHandler(req as AuthRequest, res as Response);

      expect(jsonStub.calledWith({ data: mockProducts })).to.be.true;
    });

    it("should handle validation error when no search criteria provided", async () => {
      req.body = {};

      await searchProductsHandler(req as AuthRequest, res as Response);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.firstCall.args[0]).to.deep.include({
        status: "error",
        message: "Validation failed",
      });
    });
  });
});
