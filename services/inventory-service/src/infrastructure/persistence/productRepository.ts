import type { SQL } from "bun";
import { Product } from "../../domain/entities/product";
import type { IProductRepository } from "../../domain/repositories/IOrderRepository";

export class ProductRepository implements IProductRepository {
  constructor(private readonly db: SQL) {}

  async save(product: Product): Promise<void> {
    await this.db`
      INSERT INTO products (id, name, description, price, stock, created_at, updated_at)
      VALUES (
        ${product.id},
        ${product.name},
        ${product.description},
        ${product.price},
        ${product.stock},
        ${product.createdAt},
        ${product.updatedAt}
      )
    `;
  }

  async findById(id: string): Promise<Product | null> {
    const products = await this.db`
      SELECT id, name, description, price, stock, created_at, updated_at
      FROM products
      WHERE id = ${id}
    `;

    if (products.length === 0) return null;

    const productData = products[0];
    return new Product(
      productData.id,
      productData.name,
      productData.description,
      productData.price,
      productData.stock,
      productData.created_at,
      productData.updated_at,
    );
  }

  findAll(page: number, limit: number): Promise<Product[]> {
    const offset = (page - 1) * limit;
    return this.db`
      SELECT id, name, description, price, stock, created_at, updated_at
      FROM products
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `.then((products) =>
      products.map(
        (productData: any) =>
          new Product(
            productData.id,
            productData.name,
            productData.description,
            productData.price,
            productData.stock,
            productData.created_at,
            productData.updated_at,
          ),
      ),
    );
  }
}
