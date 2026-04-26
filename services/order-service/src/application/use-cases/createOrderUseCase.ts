import type { TypeCreateOrderDTO } from "../dtos/createOrderDto";
import type { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { Order } from "../../domain/entities/Order";

export class CreateOrderUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(dto: TypeCreateOrderDTO) {
    const order = Order.create(dto.customerId, dto.items);

    await this.orderRepository.save(order);

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
