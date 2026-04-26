import type { SQL } from "bun";
import { Order } from "../../domain/entities/Order";
import type { IOrderRepository } from "../../domain/repositories/IOrderRepository";

export class OrderRepository implements IOrderRepository {
  constructor(private readonly db: SQL) {}

  async save(order: Order): Promise<void> {
    await this.db`
      INSERT INTO orders (id, customer_id, status, total_amount, created_at, updated_at)
      VALUES (
        ${order.id},
        ${order.customerId},
        ${order.status},
        ${order.totalAmount},
        ${order.createdAt},
        ${order.updatedAt}
      )
    `;

    if (order.items.length > 0) {
      for (const item of order.items) {
        await this.db`
          INSERT INTO order_items (order_id, product_id, quantity, unit_price, discount)
          VALUES (
            ${order.id},
            ${item.productId},
            ${item.quantity},
            ${item.unitPrice},
            ${item.discount ?? 0}
          )
        `;
      }
    }
  }

  async findById(id: string): Promise<Order | null> {
    const orders = await this.db`
      SELECT
        o.id,
        o.customer_id,
        o.status,
        o.total_amount,
        o.created_at,
        o.updated_at,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'productId',  oi.product_id,
            'quantity',   oi.quantity,
            'unitPrice',  oi.unit_price,
            'discount',   oi.discount
          )
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.id = ${id}
      GROUP BY o.id
    `;

    if (orders.length === 0) return null;

    return this.toEntity(orders[0]);
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const rows = await this.db`
      SELECT
        o.id,
        o.customer_id,
        o.status,
        o.total_amount,
        o.created_at,
        o.updated_at,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'productId',  oi.product_id,
            'quantity',   oi.quantity,
            'unitPrice',  oi.unit_price,
            'discount',   oi.discount
          )
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.customer_id = ${customerId}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    return rows.map((row: Record<string, unknown>) => this.toEntity(row));
  }

  async update(order: Order): Promise<void> {
    await this.db`
      UPDATE orders SET
        customer_id = ${order.customerId},
        status      = ${order.status},
        total_amount = ${order.totalAmount},
        updated_at  = ${order.updatedAt}
      WHERE id = ${order.id}
    `;

    await this.db`
      DELETE FROM order_items
      WHERE order_id = ${order.id}
    `;

    if (order.items.length > 0) {
      for (const item of order.items) {
        await this.db`
          INSERT INTO order_items (order_id, product_id, quantity, unit_price, discount)
          VALUES (
            ${order.id},
            ${item.productId},
            ${item.quantity},
            ${item.unitPrice},
            ${item.discount ?? 0}
          )
        `;
      }
    }
  }

  // mapeia linha do banco → entidade de domínio
  private toEntity(row: Record<string, unknown>): Order {
    return Order.restore({
      id: row.id as string,
      customerId: row.customer_id as string,
      status: row.status as Order["status"],
      totalAmount: Number(row.total_amount),
      items: row.items as Order["items"],
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    });
  }
}
