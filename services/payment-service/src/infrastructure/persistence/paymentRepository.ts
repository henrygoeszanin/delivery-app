import type { SQL } from "bun";
import { Payment } from "../../domain/entities/Payment";
import type { IPaymentRepository } from "../../domain/repositories/IPaymentRepository";

export class PaymentRepository implements IPaymentRepository {
  constructor(private readonly db: SQL) {}

  async save(payment: Payment): Promise<void> {
    await this.db`
      INSERT INTO payments (
        id,
        pix_code,
        payment_method,
        amount,
        issued_at,
        status,
        created_at,
        updated_at
      ) VALUES (
        ${payment.id},
        ${payment.pixCode},
        ${payment.paymentMethod},
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
        amount = ${payment.amount},
        issued_at = ${payment.issuedAt},
        status = ${payment.status},
        updated_at = ${payment.updatedAt}
      WHERE id = ${payment.id}
    `;
  }

  async findById(id: string): Promise<Payment | null> {
    const rows = await this.db`
      SELECT id, pix_code, payment_method, amount, issued_at, status, created_at, updated_at
      FROM payments
      WHERE id = ${id}
    `;

    if (rows.length === 0) {
      return null;
    }

    return this.toEntity(rows[0]);
  }

  private toEntity(row: Record<string, unknown>): Payment {
    return Payment.restore({
      id: row.id as string,
      pixCode: row.pix_code as string | null,
      paymentMethod: row.payment_method as Payment["paymentMethod"],
      amount: Number(row.amount),
      issuedAt: new Date(row.issued_at as string),
      status: row.status as Payment["status"],
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    });
  }
}
