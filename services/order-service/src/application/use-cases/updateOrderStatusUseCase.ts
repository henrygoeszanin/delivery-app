import type { TypeUpdateOrderStatusDTO } from "../dtos/updateOrderStatusDto";
import type { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import type { Order } from "../../domain/entities/Order";

export class UpdateOrderStatusUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(
    id: string,
    dto: TypeUpdateOrderStatusDTO,
  ): Promise<Order | null> {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      return null;
    }

    order.setStatus(dto.status);
    await this.orderRepository.update(order);

    return order;
  }
}
