import type { IOrderRepository } from "../../domain/repositories/IOrderRepository";

export class FindOrderByIdUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(id: string) {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      return null;
    }

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
