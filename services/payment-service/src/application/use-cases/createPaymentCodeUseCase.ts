import type { IPaymentRepository } from "../../domain/repositories/IPaymentRepository";
import type { GetPixCode } from "packages/order.events";
import { Payment } from "../../domain/entities/Payment";

export class CreatePaymentCodeUseCase {
  constructor(private readonly paymentRepo: IPaymentRepository) {}

  async execute(event: GetPixCode["payload"]): Promise<Payment> {
    const existing = await this.paymentRepo.findByOrderId(event.orderId);
    if (existing) return existing;

    const paymentDueDate = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    const attempt = Payment.create({
      orderId: event.orderId,
      paymentMethod: "pix",
      amount: event.totalAmount,
      dueDate: paymentDueDate,
    });

    await this.paymentRepo.save(attempt);
    return attempt;
  }
}
