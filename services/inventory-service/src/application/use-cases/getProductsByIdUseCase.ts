import type { Product } from "../../domain/entities/product";
import type { IProductRepository } from "../../domain/repositories/IOrderRepository";

export class GetItemsByIdsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(ids: string[]): Promise<(Product | null)[]> {
    return await Promise.all(
      ids.map((id: string) => this.productRepository.findById(id)),
    );
  }
}
