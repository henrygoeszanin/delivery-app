import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { IProductRepository } from "services/inventory-service/src/domain/repositories/IOrderRepository";
import { ProductRepository } from "../../persistence/productRepository";
import { db } from "../../persistence/db";
import { RegisterNewProductUseCase } from "services/inventory-service/src/application/use-cases/registerNewProductUseCase";
import { InventoryController } from "../controller/inventoryController";
import { RegisterNewProductDTO } from "services/inventory-service/src/application/dtos/registerNewProductDto";

export async function inventoryRoutes(app: FastifyInstance) {
  const fastify = app.withTypeProvider<ZodTypeProvider>();

  const repo: IProductRepository = new ProductRepository(db);
  const controller = new InventoryController(
    new RegisterNewProductUseCase(repo),
  );

  fastify.post(
    "/products",
    { schema: { body: RegisterNewProductDTO } },
    (req, reply) => controller.registerNewProduct(req, reply),
  );
}
