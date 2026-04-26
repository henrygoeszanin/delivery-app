import type { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import type { Order } from "../../domain/entities/Order";

export class CancelOrderUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(id: string): Promise<Order | null> {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      return null;
    }

    if (order.status === "cancelled") {
      return order;
    }

    order.cancel();
    await this.orderRepository.update(order);

    return order;
  }
}
