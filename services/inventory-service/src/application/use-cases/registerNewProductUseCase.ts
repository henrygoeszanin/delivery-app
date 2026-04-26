import { Product } from "../../domain/entities/product";
import type { IProductRepository } from "../../domain/repositories/IOrderRepository";
import type { TypeRegisterNewProductDTO } from "../dtos/registerNewProductDto";

export class RegisterNewProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(dto: TypeRegisterNewProductDTO) {
    const product = Product.create(
      crypto.randomUUID(),
      dto.name,
      dto.price,
      dto.stock,
      dto.description,
      dto.photoUrl,
    );

    await this.productRepository.save(product);

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
