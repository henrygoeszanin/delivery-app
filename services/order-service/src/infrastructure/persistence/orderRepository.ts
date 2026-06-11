import type { SQL } from "bun";
import { Order } from "../../domain/entities/Order";
import type { IOrderRepository } from "../../domain/repositories/IOrderRepository";

export class OrderRepository implements IOrderRepository {
  constructor(private readonly db: SQL) {}
  async save(order: Order): Promise<number> {
    const rows = await this.db`
    INSERT INTO orders (
      customer_id,
      total_amount,
      status,
      created_at,
      updated_at,
      items
    )
    VALUES (
      ${order.customerId},
      ${order.totalAmount},
      ${order.status},
      ${order.createdAt},
      ${order.updatedAt},
      ${JSON.stringify(order.items)}
    )
    RETURNING id
  `;

    order.id = Number(rows[0].id);
    return order.id;
  }

  async findById(id: number): Promise<Order | null> {
    const rows = await this.db`
    SELECT
      id,
      customer_id,
      total_amount,
      status,
      created_at,
      updated_at,
      items
    FROM orders
    WHERE id = ${id}
    LIMIT 1
  `;

    if (rows.length === 0) return null;

    return this.toEntity(rows[0]);
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const rows = await this.db`
    SELECT
      id,
      customer_id,
      total_amount,
      status,
      created_at,
      updated_at,
      items
    FROM orders
    WHERE customer_id = ${customerId}
    ORDER BY created_at DESC
  `;

    return rows.map((row: Record<string, unknown>) => this.toEntity(row));
  }

  async update(order: Order): Promise<void> {
    await this.db`
    UPDATE orders
    SET
      customer_id = ${order.customerId},
      total_amount = ${order.totalAmount},
      status = ${order.status},
      updated_at = ${order.updatedAt},
      items = ${JSON.stringify(order.items)}
    WHERE id = ${order.id}
  `;
  }

  private toEntity(row: Record<string, unknown>): Order {
    return Order.restore({
      id: row.id as number,
      customerId: row.customer_id as string,
      status: row.status as Order["status"],
      totalAmount: Number(row.total_amount),
      items: row.items as Order["items"],
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    });
  }
}
