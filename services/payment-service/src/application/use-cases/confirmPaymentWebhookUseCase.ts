import type { TypePaymentWebhookDTO } from "../dtos/paymentWebhookDto";
import type { IPaymentRepository } from "../../domain/repositories/IPaymentRepository";
import { Payment } from "../../domain/entities/Payment";

export class ConfirmPaymentWebhookUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(dto: TypePaymentWebhookDTO): Promise<Payment> {
    const existingPayment = await this.paymentRepository.findById(
      dto.paymentId,
    );
    const issuedAt = new Date(dto.issuedAt);
    const status = dto.status;

    if (existingPayment) {
      existingPayment.setPixCode(dto.pixCode ?? null);
      existingPayment.setPaymentMethod(dto.paymentMethod);
      existingPayment.setAmount(dto.amount);
      existingPayment.setIssuedAt(issuedAt);
      existingPayment.setStatus(status);
      if (dto.failureReason !== undefined) {
        existingPayment.setFailureReason(dto.failureReason);
      }
      await this.paymentRepository.update(existingPayment);
      return existingPayment;
    }

    const orderId = dto.orderId;
    if (!orderId) {
      throw new Error("Missing orderId to create a new payment");
    }

    const payment = Payment.create({
      id: dto.paymentId,
      orderId,
      pixCode: dto.pixCode ?? null,
      paymentMethod: dto.paymentMethod,
      failureReason: dto.failureReason ?? null,
      amount: dto.amount,
      issuedAt,
      status,
    });

    await this.paymentRepository.save(payment);
    return payment;
  }
}
