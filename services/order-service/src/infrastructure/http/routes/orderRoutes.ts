import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { CreateOrderDTO } from "../../../application/dtos/createOrderDto";
import { OrderController } from "../controllers/orderController";
import { db } from "../../persistence/db";
import { OrderRepository } from "../../persistence/orderRepository";
import { CreateOrderUseCase } from "services/order-service/src/application/use-cases/createOrderUseCase";
import { FindOrderByIdUseCase } from "services/order-service/src/application/use-cases/findOrderByIdUseCase";
import type { IOrderRepository } from "services/order-service/src/domain/repositories/IOrderRepository";

export async function orderRoutes(app: FastifyInstance) {
  const fastify = app.withTypeProvider<ZodTypeProvider>();

  const repo: IOrderRepository = new OrderRepository(db);
  const controller = new OrderController(
    new CreateOrderUseCase(repo),
    new FindOrderByIdUseCase(repo),
  );

  fastify.post(
    "/orders",
    {
      schema: { body: CreateOrderDTO },
    },
    (req, reply) => controller.create(req, reply),
  );

  fastify.get<{ Params: { id: string } }>(
    "/orders/:id",
    {
      schema: { params: z.object({ id: z.uuid() }) },
    },
    (req, reply) => controller.findById(req, reply),
  );
}
