import type { Product } from "../entities/product";

export interface IProductRepository {
  save(product: Product): Promise<void>;
  findById(id: string): Promise<Product | null>;
  findAll(page: number, limit: number): Promise<Product[]>;
}
