import type { TypeUpdateOrderDTO } from "../dtos/updateOrderDto";
import type { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import type { UpdateOrderResult } from "../dtos/updateOrderDto";

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
