import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  CancelOrderDTO,
  type TypeCancelOrderDTO,
} from "../../../application/dtos/cancelOrderDto";
import {
  ConfirmPaymentOrderDTO,
  type TypeConfirmPaymentOrderDTO,
} from "../../../application/dtos/confirmPaymentOrderDto";
import {
  CreateOrderDTO,
  type TypeCreateOrderDTO,
} from "../../../application/dtos/createOrderDto";
import {
  UpdateOrderDTO,
  type TypeUpdateOrderDTO,
} from "../../../application/dtos/updateOrderDto";
import {
  UpdateOrderStatusDTO,
  type TypeUpdateOrderStatusDTO,
} from "../../../application/dtos/updateOrderStatusDto";
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
import { RabbitMQPublisher } from "../../messaging/publisher";
import type { Channel } from "amqplib";
import { WaitForPixUseCase } from "services/order-service/src/application/use-cases/waitForPixUseCase";

export async function orderRoutes(
  app: FastifyInstance,
  options: { channel: Channel },
) {
  const fastify = app.withTypeProvider<ZodTypeProvider>();

  const repo: IOrderRepository = new OrderRepository(db);
  const publisher = new RabbitMQPublisher(options.channel);
  const controller = new OrderController(
    new CreateOrderUseCase(repo, publisher),
    new FindOrderByIdUseCase(repo),
    new UpdateOrderUseCase(repo),
    new CancelOrderUseCase(repo),
    new ConfirmPaymentUseCase(repo),
    new UpdateOrderStatusUseCase(repo),
    new WaitForPixUseCase(repo),
  );

  fastify.post<{ Body: TypeCreateOrderDTO }>(
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

  fastify.put<{
    Params: { id: string };
    Body: TypeUpdateOrderDTO;
  }>(
    "/orders/:id",
    {
      schema: {
        params: z.object({ id: z.uuid() }),
        body: UpdateOrderDTO,
      },
    },
    (req, reply) => controller.update(req, reply),
  );

  fastify.post<{
    Params: { id: string };
    Body: TypeCancelOrderDTO;
  }>(
    "/orders/:id/cancel",
    {
      schema: {
        params: z.object({ id: z.uuid() }),
        body: CancelOrderDTO,
      },
    },
    (req, reply) => controller.cancel(req, reply),
  );

  fastify.post<{
    Params: { id: string };
    Body: TypeConfirmPaymentOrderDTO;
  }>(
    "/orders/:id/confirm-payment",
    {
      schema: {
        params: z.object({ id: z.uuid() }),
        body: ConfirmPaymentOrderDTO,
      },
    },
    (req, reply) => controller.confirmPayment(req, reply),
  );

  fastify.patch<{
    Params: { id: string };
    Body: TypeUpdateOrderStatusDTO;
  }>(
    "/orders/:id/status",
    {
      schema: {
        params: z.object({ id: z.uuid() }),
        body: UpdateOrderStatusDTO,
      },
    },
    (req, reply) => controller.updateStatus(req, reply),
  );

  //long pooling para esperar pagamento via Pix
  fastify.get<{ Params: { id: string } }>(
    "/orders/:id/pix",
    {
      schema: { params: z.object({ id: z.uuid() }) },
    },
    (req, reply) => controller.waitForPixLongPooling(req, reply),
  );
}
