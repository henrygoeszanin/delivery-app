import type { Payment } from "../entities/Payment";

export interface IPaymentRepository {
  save(payment: Payment): Promise<void>;
  update(payment: Payment): Promise<void>;
  findByOrderId(orderId: number): Promise<Payment | null>;
}
