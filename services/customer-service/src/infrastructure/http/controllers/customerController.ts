import type { FastifyReply, FastifyRequest } from "fastify";
import type { TypeAddCustomerAddressDTO } from "../../../application/dtos/addCustomerAddressDto";
import type { TypeCreateCustomerDTO } from "../../../application/dtos/createCustomerDto";
import type { TypeUpdateCustomerAddressDTO } from "../../../application/dtos/updateCustomerAddressDto";
import type { AddCustomerAddressUseCase } from "../../../application/use-cases/addCustomerAddressUseCase";
import type { CreateCustomerUseCase } from "../../../application/use-cases/createCustomerUseCase";
import type { UpdateCustomerAddressUseCase } from "../../../application/use-cases/updateCustomerAddressUseCase";

export class CustomerController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly addCustomerAddressUseCase: AddCustomerAddressUseCase,
    private readonly updateCustomerAddressUseCase: UpdateCustomerAddressUseCase,
  ) {}

  async create(
    request: FastifyRequest<{ Body: TypeCreateCustomerDTO }>,
    reply: FastifyReply,
  ) {
    const result = await this.createCustomerUseCase.execute(request.body);

    if (!result.success) {
      return reply.status(409).send({
        message: "Telephone already registered",
      });
    }

    return reply.status(201).send(result.customer);
  }

  async addAddress(
    request: FastifyRequest<{
      Params: { id: string };
      Body: TypeAddCustomerAddressDTO;
    }>,
    reply: FastifyReply,
  ) {
    const customer = await this.addCustomerAddressUseCase.execute(
      request.params.id,
      request.body,
    );

    if (!customer) {
      return reply.status(404).send({ message: "Customer not found" });
    }

    return reply.status(200).send(customer);
  }

  async updateAddress(
    request: FastifyRequest<{
      Params: { id: string };
      Body: TypeUpdateCustomerAddressDTO;
    }>,
    reply: FastifyReply,
  ) {
    const customer = await this.updateCustomerAddressUseCase.execute(
      request.params.id,
      request.body,
    );

    if (!customer) {
      return reply.status(404).send({ message: "Customer not found" });
    }

    return reply.status(200).send(customer);
  }
}
