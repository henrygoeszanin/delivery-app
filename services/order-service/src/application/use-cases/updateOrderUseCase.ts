import type { TypeUpdateOrderDTO } from "../dtos/updateOrderDto";
import type { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import type { Order } from "../../domain/entities/Order";

export type UpdateOrderResult =
  | { success: true; order: Order }
  | { success: false; reason: "not_found" | "no_updates" };

export class UpdateOrderUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(
    id: string,
    dto: TypeUpdateOrderDTO,
  ): Promise<UpdateOrderResult> {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      return { success: false, reason: "not_found" };
    }

    if (!dto.customerId && !dto.items) {
      return { success: false, reason: "no_updates" };
    }

    order.updateDetails(dto);
    await this.orderRepository.update(order);

    return { success: true, order };
  }
}
