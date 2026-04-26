import type { TypeCreateOrderDTO } from "../dtos/createOrderDto";
import type { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { Order } from "../../domain/entities/Order";
import type { IEventPublisher } from "../../domain/messaging/IEventPubliser";
import type { OrderCreated } from "packages/order.events";

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly publisher: IEventPublisher,
  ) {}

  async execute(dto: TypeCreateOrderDTO) {
    const order = Order.create(dto.customerId, dto.items);

    await this.orderRepository.save(order);

    const event: OrderCreated = {
      eventId: crypto.randomUUID(),
      eventType: "order.created",
      occurredAt: new Date(),
      payload: {
        orderId: order.id,
        customerId: order.customerId,
        items: order.items,
        totalAmount: order.totalAmount,
      },
    };

    await this.publisher.publish(event);

    return {
      id: order.id,
      customerId: order.customerId,
      items: order.items,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
