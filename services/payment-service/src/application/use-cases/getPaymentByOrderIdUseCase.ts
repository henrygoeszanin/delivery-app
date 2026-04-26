import type { Payment } from "../../domain/entities/Payment";
import type { IPaymentRepository } from "../../domain/repositories/IPaymentRepository";

export class GetPaymentByOrderIdUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(orderId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findByOrderId(orderId);
    if (!payment) {
      throw new Error("Payment not found");
    }
    return payment;
  }
}
