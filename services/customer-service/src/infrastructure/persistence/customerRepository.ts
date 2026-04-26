import type { SQL } from "bun";
import { Customer } from "../../domain/entities/Customer";
import type { ICustomerRepository } from "../../domain/repositories/ICustomerRepository";

export class CustomerRepository implements ICustomerRepository {
  constructor(private readonly db: SQL) {}

  async save(customer: Customer): Promise<void> {
    await this.db`
      INSERT INTO customers (id, name, telephone, address, created_at, updated_at)
      VALUES (
        ${customer.id},
        ${customer.name},
        ${customer.telephone},
        ${customer.address},
        ${customer.createdAt},
        ${customer.updatedAt}
      )
    `;
  }

  async update(customer: Customer): Promise<void> {
    await this.db`
      UPDATE customers SET
        name = ${customer.name},
        telephone = ${customer.telephone},
        address = ${customer.address},
        updated_at = ${customer.updatedAt}
      WHERE id = ${customer.id}
    `;
  }

  async findById(id: string): Promise<Customer | null> {
    const rows = await this.db`
      SELECT id, name, telephone, address, created_at, updated_at
      FROM customers
      WHERE id = ${id}
    `;

    if (rows.length === 0) {
      return null;
    }

    return this.toEntity(rows[0]);
  }

  async findByTelephone(telephone: string): Promise<Customer | null> {
    const rows = await this.db`
      SELECT id, name, telephone, address, created_at, updated_at
      FROM customers
      WHERE telephone = ${telephone}
    `;

    if (rows.length === 0) {
      return null;
    }

    return this.toEntity(rows[0]);
  }

  private toEntity(row: Record<string, unknown>): Customer {
    return Customer.restore({
      id: row.id as string,
      name: row.name as string,
      telephone: row.telephone as string,
      address: row.address as string | null,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    });
  }
}
