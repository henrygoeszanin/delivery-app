import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { CancelOrderDTO } from "../../../application/dtos/cancelOrderDto";
import { ConfirmPaymentOrderDTO } from "../../../application/dtos/confirmPaymentOrderDto";
import { CreateOrderDTO } from "../../../application/dtos/createOrderDto";
import { UpdateOrderDTO } from "../../../application/dtos/updateOrderDto";
import { UpdateOrderStatusDTO } from "../../../application/dtos/updateOrderStatusDto";
import { OrderController } from "../controllers/orderController";
import { db } from "../../persistence/db";
import { OrderRepository } from "../../persistence/orderRepository";
import { CancelOrderUseCase } from "services/order-service/src/application/use-cases/cancelOrderUseCase";
import { ConfirmPaymentUseCase } from "services/order-service/src/application/use-cases/confirmPaymentUseCase";
import { CreateOrderUseCase } from "services/order-service/src/application/use-cases/createOrderUseCase";
import { FindOrderByIdUseCase } from "services/order-service/src/application/use-cases/findOrderByIdUseCase";
import { UpdateOrderStatusUseCase } from "services/order-service/src/application/use-cases/updateOrderStatusUseCase";
import { UpdateOrderUseCase } from "services/order-service/src/application/use-cases/updateOrderUseCase";
import type { IOrderRepository } from "services/order-service/src/domain/repositories/IOrderRepository";

export async function orderRoutes(app: FastifyInstance) {
  const fastify = app.withTypeProvider<ZodTypeProvider>();

  const repo: IOrderRepository = new OrderRepository(db);
  const controller = new OrderController(
    new CreateOrderUseCase(repo),
    new FindOrderByIdUseCase(repo),
    new UpdateOrderUseCase(repo),
    new CancelOrderUseCase(repo),
    new ConfirmPaymentUseCase(repo),
    new UpdateOrderStatusUseCase(repo),
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

  fastify.put(
    "/orders/:id",
    {
      schema: {
        params: z.object({ id: z.uuid() }),
        body: UpdateOrderDTO,
      },
    },
    (req, reply) => controller.update(req, reply),
  );

  fastify.post(
    "/orders/:id/cancel",
    {
      schema: {
        params: z.object({ id: z.uuid() }),
        body: CancelOrderDTO,
      },
    },
    (req, reply) => controller.cancel(req, reply),
  );

  fastify.post(
    "/orders/:id/confirm-payment",
    {
      schema: {
        params: z.object({ id: z.uuid() }),
        body: ConfirmPaymentOrderDTO,
      },
    },
    (req, reply) => controller.confirmPayment(req, reply),
  );

  fastify.patch(
    "/orders/:id/status",
    {
      schema: {
        params: z.object({ id: z.uuid() }),
        body: UpdateOrderStatusDTO,
      },
    },
    (req, reply) => controller.updateStatus(req, reply),
  );
}
