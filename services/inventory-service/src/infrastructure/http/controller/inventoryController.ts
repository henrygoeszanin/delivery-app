import type { FastifyReply, FastifyRequest } from "fastify";
import type { TypeRegisterNewProductDTO } from "services/inventory-service/src/application/dtos/registerNewProductDto";
import type { RegisterNewProductUseCase } from "services/inventory-service/src/application/use-cases/registerNewProductUseCase";

export class InventoryController {
  constructor(
    private readonly registerNewProductUseCase: RegisterNewProductUseCase,
  ) {}

  async registerNewProduct(
    request: FastifyRequest<{ Body: TypeRegisterNewProductDTO }>,
    reply: FastifyReply,
  ) {
    const result = await this.registerNewProductUseCase.execute(request.body);
    return reply.status(201).send(result);
  }
}
