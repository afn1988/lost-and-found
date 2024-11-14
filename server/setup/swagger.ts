import dotenv from "dotenv";
import path from "path";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// Load environment variables.
if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: "./env/.env.development" });
} else {
  dotenv.config({ path: "./env/.env.development" });
}

const options: swaggerJsdoc.Options = {
  openapi: '3.0.0',
  definition: {
    info: {
      version: "v1.0.0",
      title: "API Documentation",
      description: "Lost and Found API Documentation",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
        },
      },
    },
    security: [{
      cookieAuth: []
    }]
  },
  apis: [
    path.join(__dirname, '../routes/product.routes.ts'), 
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec, swaggerUi };
