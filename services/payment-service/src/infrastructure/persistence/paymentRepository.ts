import type { SQL } from "bun";
import { Payment } from "../../domain/entities/Payment";
import type { IPaymentRepository } from "../../domain/repositories/IPaymentRepository";

export class PaymentRepository implements IPaymentRepository {
  constructor(private readonly db: SQL) {}

  async save(payment: Payment): Promise<void> {
    await this.db`
      INSERT INTO payments (
        id,
        order_id,
        pix_code,
        payment_method,
        failure_reason,
        amount,
        issued_at,
        status,
        created_at,
        updated_at
      ) VALUES (
        ${payment.id},
        ${payment.orderId},
        ${payment.pixCode},
        ${payment.paymentMethod},
        ${payment.failureReason},
        ${payment.amount},
        ${payment.issuedAt},
        ${payment.status},
        ${payment.createdAt},
        ${payment.updatedAt}
      )
    `;
  }

  async update(payment: Payment): Promise<void> {
    await this.db`
      UPDATE payments SET
        pix_code = ${payment.pixCode},
        payment_method = ${payment.paymentMethod},
        failure_reason = ${payment.failureReason},
        amount = ${payment.amount},
        issued_at = ${payment.issuedAt},
        status = ${payment.status},
        updated_at = ${payment.updatedAt}
      WHERE id = ${payment.id}
    `;
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const rows = await this.db`
      SELECT id, order_id, pix_code, payment_method, failure_reason, amount, issued_at, status, created_at, updated_at
      FROM payments
      WHERE order_id = ${orderId}
    `;

    if (rows.length === 0) {
      return null;
    }

    return this.toEntity(rows[0]);
  }

  private toEntity(row: Record<string, unknown>): Payment {
    return Payment.restore({
      id: row.id as string,
      orderId: row.order_id as string,
      pixCode: row.pix_code as string | null,
      paymentMethod: row.payment_method as Payment["paymentMethod"],
      failureReason: row.failure_reason as string | null,
      amount: Number(row.amount),
      issuedAt: new Date(row.issued_at as string),
      status: row.status as Payment["status"],
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    });
  }
}
