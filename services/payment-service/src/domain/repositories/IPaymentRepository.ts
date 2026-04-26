import type { Payment } from "../entities/Payment";

export interface IPaymentRepository {
  save(payment: Payment): Promise<void>;
  update(payment: Payment): Promise<void>;
  findById(id: string): Promise<Payment | null>;
}
