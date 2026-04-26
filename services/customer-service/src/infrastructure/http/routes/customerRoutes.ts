import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AddCustomerAddressDTO } from "../../../application/dtos/addCustomerAddressDto";
import { CreateCustomerDTO } from "../../../application/dtos/createCustomerDto";
import { UpdateCustomerAddressDTO } from "../../../application/dtos/updateCustomerAddressDto";
import { CustomerController } from "../controllers/customerController";
import { db } from "../../persistence/db";
import { CustomerRepository } from "../../persistence/customerRepository";
import { AddCustomerAddressUseCase } from "../../../application/use-cases/addCustomerAddressUseCase";
import { CreateCustomerUseCase } from "../../../application/use-cases/createCustomerUseCase";
import { UpdateCustomerAddressUseCase } from "../../../application/use-cases/updateCustomerAddressUseCase";
import type { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";

export async function customerRoutes(app: FastifyInstance) {
  const fastify = app.withTypeProvider<ZodTypeProvider>();

  const repo: ICustomerRepository = new CustomerRepository(db);
  const controller = new CustomerController(
    new CreateCustomerUseCase(repo),
    new AddCustomerAddressUseCase(repo),
    new UpdateCustomerAddressUseCase(repo),
  );

  fastify.post(
    "/customers",
    {
      schema: { body: CreateCustomerDTO },
    },
    (req, reply) => controller.create(req, reply),
  );

  fastify.post(
    "/customers/:id/address",
    {
      schema: {
        params: z.object({ id: z.uuid() }),
        body: AddCustomerAddressDTO,
      },
    },
    (req, reply) => controller.addAddress(req, reply),
  );

  fastify.put(
    "/customers/:id/address",
    {
      schema: {
        params: z.object({ id: z.uuid() }),
        body: UpdateCustomerAddressDTO,
      },
    },
    (req, reply) => controller.updateAddress(req, reply),
  );
}
