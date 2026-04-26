import type { IPaymentRepository } from "../../domain/repositories/IPaymentRepository";
import type { OrderCreated } from "packages/order.events";
import { Payment } from "../../domain/entities/Payment";
import type { IEventPublisher } from "../../domain/messaging/IEventPublisher";

export class ProcessPaymentUseCase {
  constructor(
    private readonly paymentRepo: IPaymentRepository,
    private readonly publisher: IEventPublisher,
  ) {}

  async execute(event: OrderCreated["payload"]): Promise<void> {
    // idempotência — não reprocessar o mesmo pedido
    const existing = await this.paymentRepo.findByOrderId(event.orderId);
    if (existing) return;

    const attempt = Payment.create({
      orderId: event.orderId,
      paymentMethod: "pix",
      amount: event.totalAmount,
      issuedAt: new Date(),
    });

    await this.paymentRepo.save(attempt);

    await this.publisher.publish({
      eventId: crypto.randomUUID(),
      eventType: "payment.pix_generated",
      occurredAt: new Date(),
      payload: {
        orderId: attempt.orderId,
        paymentId: attempt.id,
        pixCode: attempt.pixCode,
        amount: attempt.amount,
      },
    });
  }
}
