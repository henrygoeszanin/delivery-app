import type { FastifyRequest, FastifyReply } from "fastify";
import type { TypeCancelOrderDTO } from "../../../application/dtos/cancelOrderDto";
import type { TypeConfirmPaymentOrderDTO } from "../../../application/dtos/confirmPaymentOrderDto";
import type { TypeCreateOrderDTO } from "../../../application/dtos/createOrderDto";
import type { TypeUpdateOrderDTO } from "../../../application/dtos/updateOrderDto";
import type { TypeUpdateOrderStatusDTO } from "../../../application/dtos/updateOrderStatusDto";
import type { CancelOrderUseCase } from "services/order-service/src/application/use-cases/cancelOrderUseCase";
import type { ConfirmPaymentUseCase } from "services/order-service/src/application/use-cases/confirmPaymentUseCase";
import type { CreateOrderUseCase } from "services/order-service/src/application/use-cases/createOrderUseCase";
import type { FindOrderByIdUseCase } from "services/order-service/src/application/use-cases/findOrderByIdUseCase";
import type { UpdateOrderStatusUseCase } from "services/order-service/src/application/use-cases/updateOrderStatusUseCase";
import type { UpdateOrderUseCase } from "services/order-service/src/application/use-cases/updateOrderUseCase";

export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly findOrderByIdUseCase: FindOrderByIdUseCase,
    private readonly updateOrderUseCase: UpdateOrderUseCase,
    private readonly cancelOrderUseCase: CancelOrderUseCase,
    private readonly confirmPaymentUseCase: ConfirmPaymentUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
  ) {}

  async create(
    request: FastifyRequest<{ Body: TypeCreateOrderDTO }>,
    reply: FastifyReply,
  ) {
    const result = await this.createOrderUseCase.execute(request.body);
    return reply.status(201).send(result);
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const order = await this.findOrderByIdUseCase.execute(request.params.id);

    if (!order) {
      return reply.status(404).send({ message: "Order not found" });
    }

    return reply.status(200).send(order);
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: TypeUpdateOrderDTO;
    }>,
    reply: FastifyReply,
  ) {
    const result = await this.updateOrderUseCase.execute(
      request.params.id,
      request.body,
    );

    if (!result.success) {
      if (result.reason === "not_found") {
        return reply.status(404).send({ message: "Order not found" });
      }
      return reply
        .status(400)
        .send({ message: "Update payload must include at least one field" });
    }

    return reply.status(200).send(result.order);
  }

  async cancel(
    request: FastifyRequest<{
      Params: { id: string };
      Body: TypeCancelOrderDTO;
    }>,
    reply: FastifyReply,
  ) {
    const order = await this.cancelOrderUseCase.execute(request.params.id);

    if (!order) {
      return reply.status(404).send({ message: "Order not found" });
    }

    return reply.status(200).send(order);
  }

  async confirmPayment(
    request: FastifyRequest<{
      Params: { id: string };
      Body: TypeConfirmPaymentOrderDTO;
    }>,
    reply: FastifyReply,
  ) {
    const order = await this.confirmPaymentUseCase.execute(request.params.id);

    if (!order) {
      return reply.status(404).send({ message: "Order not found" });
    }

    if (order.status === "cancelled") {
      return reply
        .status(400)
        .send({ message: "Cannot confirm payment for a cancelled order" });
    }

    return reply.status(200).send(order);
  }

  async updateStatus(
    request: FastifyRequest<{
      Params: { id: string };
      Body: TypeUpdateOrderStatusDTO;
    }>,
    reply: FastifyReply,
  ) {
    const order = await this.updateOrderStatusUseCase.execute(
      request.params.id,
      request.body,
    );

    if (!order) {
      return reply.status(404).send({ message: "Order not found" });
    }

    return reply.status(200).send(order);
  }
}
