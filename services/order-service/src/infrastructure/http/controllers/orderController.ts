import type { FastifyRequest, FastifyReply } from "fastify";
import type { TypeCreateOrderDTO } from "../../../application/dtos/createOrderDto";
import type { FindOrderByIdUseCase } from "services/order-service/src/application/use-cases/findOrderByIdUseCase";
import type { CreateOrderUseCase } from "services/order-service/src/application/use-cases/createOrderUseCase";

export class OrderController {
  constructor(
    private readonly createOrder: CreateOrderUseCase,
    private readonly findOrderById: FindOrderByIdUseCase,
  ) {}

  async create(
    request: FastifyRequest<{ Body: TypeCreateOrderDTO }>,
    reply: FastifyReply,
  ) {
    const result = await this.createOrder.execute(request.body);
    return reply.status(201).send(result);
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const order = await this.findOrderById.execute(request.params.id);

    if (!order) {
      return reply.status(404).send({ message: "Order not found" });
    }

    return reply.status(200).send(order);
  }
}
