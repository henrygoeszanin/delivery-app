import type { TypeCreateCustomerDTO } from "../dtos/createCustomerDto";
import type { ICustomerRepository } from "../../domain/repositories/ICustomerRepository";
import { Customer } from "../../domain/entities/Customer";

export type CreateCustomerResult =
  | { success: true; customer: Customer }
  | { success: false; reason: "telephone_already_registered" };

export class CreateCustomerUseCase {
  constructor(private readonly customerRepository: ICustomerRepository) {}

  async execute(dto: TypeCreateCustomerDTO): Promise<CreateCustomerResult> {
    const existingCustomer = await this.customerRepository.findByTelephone(
      dto.telephone,
    );

    if (existingCustomer) {
      return { success: false, reason: "telephone_already_registered" };
    }

    const customer = Customer.create(dto.name, dto.telephone);
    await this.customerRepository.save(customer);

    return { success: true, customer };
  }
}
