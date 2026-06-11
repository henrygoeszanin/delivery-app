import type { IPaymentRepository } from "../../domain/repositories/IPaymentRepository";
import type { OrderCreated, PixGenerated } from "packages/order.events";
import { Payment } from "../../domain/entities/Payment";
import type { IEventPublisher } from "../../domain/messaging/IEventPublisher";

export class CreatePaymentCodeUseCase {
  constructor(
    private readonly paymentRepo: IPaymentRepository,
    private readonly publisher: IEventPublisher,
  ) {}

  async execute(event: OrderCreated["payload"]): Promise<void> {
    const existing = await this.paymentRepo.findByOrderId(event.orderId);
    if (existing) return;

    const paymentDueDate = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    const attempt = Payment.create({
      orderId: event.orderId,
      paymentMethod: "pix",
      amount: event.totalAmount,
      dueDate: paymentDueDate,
    });

    await this.paymentRepo.save(attempt);

    const payload: PixGenerated["payload"] = {
      orderId: attempt.orderId,
      paymentId: attempt.id,
      pixCode: attempt.pixCode,
      amount: attempt.amount,
      dueDate: attempt.dueDate,
    };

    await this.publisher.publish({
      eventId: crypto.randomUUID(),
      eventType: "payment.pix_generated",
      occurredAt: new Date(),
      payload,
    });
  }
}
