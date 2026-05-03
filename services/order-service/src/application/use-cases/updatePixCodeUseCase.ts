import type { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import type { UpdateOrderResult } from "../dtos/updateOrderDto";

export class UpdatePixUseCase {
  constructor(private readonly orderRepository: IOrderRepository){}

  async execute(
    id: string,
    pixCode: string,
    paymentId: string,
  ): Promise<UpdateOrderResult>{

    let order = await this.orderRepository.findById(id)

    if (!order) {
      return { success: false, reason: "not_found" };
    }

    if(!pixCode) {
      return {success: false, reason: "without_pix_code"}
    }


    order.pixCode = pixCode

    order.attachPixCode(
      pixCode,
      paymentId
    )

    await this.orderRepository.update(order)

    return{success: true, order}
  }
}
